import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { getMemoryContext, formatMemoryContext } from "@/lib/memory";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// ===================================================================
// API KEY & CLIENTS
// ===================================================================

function loadApiKeyFromEnvFile(): string {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("ANTHROPIC_API_KEY=")) {
        return trimmed.substring("ANTHROPIC_API_KEY=".length);
      }
    }
  } catch {
    // fallback
  }
  return "";
}

function getAnthropicClient() {
  let apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    apiKey = loadApiKeyFromEnvFile();
  }
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquante");
  }
  return new Anthropic({ apiKey });
}

/** Client anon — pour les requêtes SELECT avec RLS (ex: sessions) */
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Client service role — pour les INSERT logs (bypass RLS, serveur uniquement) */
function getSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    console.warn("[TRACEA API] SUPABASE_SERVICE_ROLE_KEY manquante, fallback anon");
    return getSupabase();
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ===================================================================
// AI USAGE LOGGING
// ===================================================================

// Tarifs Claude Sonnet (claude-sonnet-4-20250514) — mai 2025
const COST_PER_INPUT_TOKEN = 3.0 / 1_000_000;      // $3 / 1M tokens
const COST_PER_OUTPUT_TOKEN = 15.0 / 1_000_000;     // $15 / 1M tokens
const COST_PER_CACHE_WRITE_TOKEN = 3.75 / 1_000_000; // $3.75 / 1M tokens (écriture cache)
const COST_PER_CACHE_READ_TOKEN = 0.30 / 1_000_000;  // $0.30 / 1M tokens (lecture cache — 90% de réduction)

async function logAiUsage(params: {
  userId: string;
  callType: string;
  stepId?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  isRetry?: boolean;
}) {
  const cacheWrite = params.cacheCreationTokens || 0;
  const cacheRead = params.cacheReadTokens || 0;
  const nonCachedInput = params.inputTokens - cacheWrite - cacheRead;

  const cost =
    nonCachedInput * COST_PER_INPUT_TOKEN +
    cacheWrite * COST_PER_CACHE_WRITE_TOKEN +
    cacheRead * COST_PER_CACHE_READ_TOKEN +
    params.outputTokens * COST_PER_OUTPUT_TOKEN;

  // Console log (toujours visible dans Vercel logs)
  const cacheInfo = (cacheWrite || cacheRead)
    ? ` | cache_write: ${cacheWrite} cache_read: ${cacheRead}`
    : "";
  console.log(
    `[AI COST] ${params.callType}${params.stepId ? ` (${params.stepId})` : ""}` +
    `${params.isRetry ? " [RETRY]" : ""}` +
    ` | in: ${params.inputTokens} out: ${params.outputTokens}${cacheInfo}` +
    ` | $${cost.toFixed(6)}` +
    ` | user: ${params.userId.slice(0, 8)}...`
  );

  // Persist to Supabase via service role (don't block the response if it fails)
  try {
    const supabase = getSupabaseService();
    const { error: insertError } = await supabase.from("ai_usage_logs").insert({
      user_id: params.userId,
      call_type: params.callType,
      step_id: params.stepId || null,
      model: params.model,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      estimated_cost_usd: cost,
      is_retry: params.isRetry || false,
    });

    if (insertError) {
      console.error("[AI LOG ERROR] Supabase insert failed:", insertError.message, insertError.details, insertError.hint);
    } else {
      console.log(`[AI LOG SAVED] ${params.userId.slice(0, 8)}... | $${cost.toFixed(6)}`);
    }
  } catch (err) {
    // Ne jamais bloquer la réponse pour un problème de logging
    console.error("[AI LOG ERROR] Exception:", err);
  }
}

// ===================================================================
// SECTION 1 — SYSTEM PROMPTS
// ===================================================================

// Master prompt (complet) — utilisé pour final-analysis
const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "docs", "IA_TRACEA_SYSTEM_PROMPT.md"),
  "utf-8"
);

// Runtime prompt (court) — utilisé pour step-mirror en production
const RUNTIME_PROMPT = readFileSync(
  join(process.cwd(), "docs", "IA_TRACEA_RUNTIME_PROMPT.md"),
  "utf-8"
);

// ===================================================================
// SECTION 2.3 — DEVELOPER PROMPT (JSON structuré)
// ===================================================================

const DEVELOPER_PROMPT = `Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans backticks markdown.

Le JSON doit respecter exactement ce schéma :
{
  "tone_level": "soft" ou "moderate" ou "deep",
  "risk_level": "low" ou "medium" ou "high",
  "module": "[module_actuel]",
  "mirror": "CE QUE TU VIS — reformulation fidèle, sans ajout. Les mots de la personne. 1 à 3 phrases max.",
  "hypothesis": "MISE EN LUMIÈRE — 1 phrase directe. Si l'utilisateur mentionne une zone du corps, reformuler dans cette zone. Sinon, rester non localisé (ex: 'Il y a de la fatigue.', 'C'est lourd à porter.'). Ne jamais inventer une zone corporelle. Vide si rien de notable ou si risk_level high.",
  "insight": "toujours vide",
  "question": "À EXPLORER — 1 question simple orientée corps ou ressenti. Vide si risk_level high.",
  "micro_action": "À ESSAYER MAINTENANT — 1 action courte, physique, immédiate. Faisable en 30 secondes.",
  "pattern_observation": "toujours vide — pas de détection de patterns ni de comparaison avec le passé",
  "progress_signal": "toujours vide — JAMAIS de formulation évaluative ('tu identifies plus vite', 'tu identifies précisément', 'tu progresses')",
  "next_step_suggestion": "vide sauf au module aligner",
  "safety_message": "message de sécurité — obligatoire si risk_level est high, sinon vide",
  "user_state_snapshot": {
    "dominant_emotion": "formulation incarnée de l'état émotionnel — ton humain, pas clinique. Ex: 'Tu viens de faire redescendre ton corps' au lieu de 'apaisement'. Ex: 'La colère est encore là' au lieu de 'colère'.",
    "tension_level": 0-10,
    "regulation_state": "stable" ou "fluctuating" ou "overloaded",
    "clarity_level": 0-10
  },
  "do_not_store": false
}

=== RÈGLES IMPÉRATIVES ===

- mirror est TOUJOURS rempli. Fidèle. Factuel. Reprends les mots exacts de la personne. Simplifie. Clarifie. 1 à 3 phrases max. Max 12-15 mots par phrase.
- hypothesis : 1 phrase directe. JAMAIS "tête" ou "mental". Si l'utilisateur mentionne une zone du corps → reformuler dans cette zone. Si l'utilisateur NE mentionne PAS de zone → rester non localisé ("Il y a de la fatigue.", "C'est lourd à porter.", "Quelque chose pèse."). INTERDIT d'inventer une zone corporelle. PAS OK : "On dirait que…", "C'est dans ta tête.", "Il y a déjà…", "Je remarque que…"
- question : 1 question simple. Si la sensation n'est pas encore cadrée, question ouverte avec options ("C'est plutôt lourd, tendu, agité ou autre chose ?"). Si une zone est déjà nommée, oppositions liées à cette zone ("Ça serre ou ça pèse ?"). PAS OK : "dur ou mou", formulations techniques, oppositions trop fermées sans contexte.
- micro_action : corporelle, faisable en 30 secondes. Pas une liste. Pas un conseil. JAMAIS de technique respiratoire ("gonfle", "inspire X secondes", "expire lentement"). Juste revenir au corps : poser une main, sentir un contact, appuyer les pieds.
- insight : toujours vide.
- progress_signal : toujours vide.
- pattern_observation : toujours vide. Pas de détection de patterns. Pas de comparaison avec le passé.
- Si risk_level est "high", safety_message est OBLIGATOIRE et hypothesis/question sont vides.
- Le texte total de mirror + hypothesis + question + micro_action ne doit pas dépasser 100 mots. SOIS COURT.
- OBLIGATOIRE : reprendre au moins 1 mot ou expression exacte de l'utilisateur dans mirror ou hypothesis. Si des notes libres sont présentes dans le contexte, les utiliser en priorité. Ne jamais répondre de manière générique.
- Écrire en français. Tutoyer la personne.
- Phrases courtes (max 12-15 mots).
- dominant_emotion : TOUJOURS une phrase incarnée, jamais un mot seul. ❌ "apaisement" ✅ "Tu viens de faire redescendre ton corps". ❌ "colère" ✅ "La colère est encore là". ❌ "tristesse" ✅ "Il y a de la tristesse."
- Ancrage neuro subtil AUTORISÉ dans hypothesis ou mirror (avec parcimonie) : "Ton corps commence à redescendre", "La tension diminue", "Tu reviens vers quelque chose de plus stable". Ne pas utiliser systématiquement.
- Ne jamais utiliser : "poitrinaire", "souvent", "en général", "beaucoup de gens", "une partie de toi", "tu évites", "tu cherches à", "lâche prise", "accueille", "prends soin de toi", "cela signifie que", "il est possible que", "on dirait que", "il y a déjà", "je remarque que", "quelque chose en toi".`;

// ===================================================================
// SECTION 3 — ROUTING PAR MODULE
// ===================================================================

const MODULE_INSTRUCTIONS: Record<string, string> = {
  demarrer: `Module actif : DÉMARRER.
Accueillir. Reformuler simplement. Rien d'autre.
tone_level : "soft".`,

  traverser: `Module actif : TRAVERSER.
100% corps. Zéro mental.
mirror : les mots exacts de la personne.
question : orientée corps ("Où tu sens ça ?", "Ça serre ou ça pèse ?").
Si flou : 2 options corporelles simples.`,

  reconnaitre: `Module actif : RECONNAÎTRE.
Rester dans la MÊME zone du corps que l'étape 1 (Traverser).
Ne pas changer de zone. Approfondir ce qui est déjà là.
hypothesis : faire évoluer la sensation — plus précise, plus localisée. Ne pas répéter la formulation de l'étape 1.
question : toujours corporelle, jamais mentale. Utiliser des oppositions simples de sensation.
Exemples de questions : "Dans ta poitrine, ça pousse ou ça serre ?", "Ça appuie ou ça bloque ?", "Ça reste ou ça bouge ?", "C'est chaud ou c'est froid ?", "Ça monte ou ça descend ?"
Ne pas étiqueter. Ne pas expliquer. Ne pas interpréter.`,

  ancrer: `Module actif : ANCRER.
Ramener au corps. INTERDIT toute interprétation.
mirror : uniquement l'état du corps tel que décrit. Ton incarné : "Il y a encore des zones tendues." pas "Tu identifies les zones tendues."
Ancrage neuro subtil autorisé : "Ton corps commence à redescendre.", "La tension diminue.", "Tu reviens vers quelque chose de plus stable."
micro_action OBLIGATOIREMENT corporelle : posture, pieds au sol, contact main.
tone_level : "soft".`,

  conscientiser: `Module actif : CONSCIENTISER.
Faire émerger un besoin — sans l'imposer.
hypothesis : 1 mise en lumière simple. Pas de causalité.
question : ancrée dans le présent.`,

  emerger: `Module actif : ÉMERGER.
Clarifier simplement. INTERDIT créer du sens.
Si rien n'a bougé, le dire. Ne rien inventer.
mirror : ce qui est là maintenant, pas ce que tu voudrais. Ton incarné, direct.
Ancrage neuro subtil autorisé si pertinent : "Quelque chose se pose.", "Tu reviens vers quelque chose de plus stable."`,

  aligner: `Module actif : ALIGNER.
Orienter vers une action concrète.
mirror : format "Tu choisis de …" — reformuler ce que la personne a nommé comme geste ou intention.
hypothesis : format "Tu viens d'écouter quelque chose d'important en toi." ou équivalent incarné. Ce qui évolue en elle.
micro_action OBLIGATOIRE. Simple. Immédiate. Un geste.`,
};

// ===================================================================
// SECTION 4 — DÉTECTION DE RISQUE ÉMOTIONNEL
// ===================================================================

function assessRiskLevel(userInput: string): "low" | "medium" | "high" {
  const input = userInput.toLowerCase();

  const highRiskKeywords = [
    "mourir", "en finir", "plus la peine", "me tuer",
    "suicide", "disparaître", "plus envie de vivre",
    "personne ne m'aime", "je suis un poids",
    "je n'en peux plus", "je ne supporte plus",
    "tout est foutu", "aucune issue", "aucun espoir",
  ];

  const mediumRiskKeywords = [
    "dépassée", "submergée", "trop", "effondrer",
    "panique", "terrifiée", "perdue", "vide",
    "épuisée", "plus de force", "craquer",
    "dépassé", "submergé", "terrifié", "perdu", "épuisé",
  ];

  for (const keyword of highRiskKeywords) {
    if (input.includes(keyword)) return "high";
  }

  let mediumCount = 0;
  for (const keyword of mediumRiskKeywords) {
    if (input.includes(keyword)) mediumCount++;
  }
  if (mediumCount >= 2) return "medium";

  return "low";
}

function getRiskInstruction(riskLevel: "low" | "medium" | "high"): string {
  if (riskLevel === "high") {
    return `ALERTE : Le niveau de risque émotionnel détecté est ÉLEVÉ.
Tu dois :
1. Stopper toute analyse et toute hypothèse.
2. Ralentir. Ton doux et sécurisant uniquement.
3. Recentrer sur le présent et le concret.
4. Remplir le champ safety_message OBLIGATOIREMENT.
5. Laisser hypothesis et question VIDES.
6. Proposer uniquement un recentrage corporel simple dans micro_action.`;
  }
  if (riskLevel === "medium") {
    return `ATTENTION : Le niveau de risque émotionnel détecté est MODÉRÉ.
Tu dois :
1. Réduire la profondeur d'analyse.
2. Prioriser la validation et le recentrage.
3. Poser une question douce et non confrontante.
4. tone_level doit être "soft".`;
  }
  return "";
}

// ===================================================================
// SECTION 5 — VALIDATION POST-GÉNÉRATION
// ===================================================================

interface TraceaResponse {
  tone_level: "soft" | "moderate" | "deep";
  risk_level: "low" | "medium" | "high";
  module: string;
  mirror: string;
  hypothesis: string;
  insight: string;
  question: string;
  micro_action: string;
  pattern_observation: string;
  progress_signal: string;
  next_step_suggestion: string;
  safety_message: string;
  user_state_snapshot: {
    dominant_emotion: string;
    tension_level: number;
    regulation_state: "stable" | "fluctuating" | "overloaded";
    clarity_level: number;
  };
  do_not_store: boolean;
}

function validateResponse(response: TraceaResponse): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifications structurelles
  if (!response.mirror || response.mirror.trim() === "") {
    errors.push("mirror_empty");
  }

  if (response.risk_level !== "high") {
    if (!response.hypothesis || response.hypothesis.trim() === "") {
      errors.push("hypothesis_missing");
    }
    if (!response.question || response.question.trim() === "") {
      errors.push("question_missing");
    }
  }

  if (response.risk_level === "high" && (!response.safety_message || response.safety_message.trim() === "")) {
    errors.push("safety_message_missing");
  }

  // Vérifications de contenu
  const allText = [
    response.mirror,
    response.hypothesis,
    response.insight,
    response.question,
    response.micro_action,
    response.safety_message,
  ].filter(Boolean).join(" ").toLowerCase();

  const forbiddenPatterns = [
    /tu souffres de\b/,
    /tu as un trauma/,
    /ta blessure est\b/,
    /tu fais de l'anxiété/,
    /tu fais une dépression/,
    /tu es dans un schéma/,
    /la vraie raison/,
    /la cause est\b/,
    /ton problème vient de/,
    /cela vient de ton enfance/,
    /tu devrais faire une thérapie/,
    /voici ce que tu dois faire/,
    /tu as un trouble/,
    /je te diagnostique/,
    /tu es (un|une) (personne|individu) qui/,
    /cela signifie que\b/,
    /beaucoup de gens/,
    /en général\b/,
    /une partie de toi/,
    /tu évites\b/,
    /lâche prise/,
    /prends soin de toi/,
    /dans les jours à venir/,
    /tu identifies\b/,
    /tu cherches à\b/,
    /il est possible que\b/,
    /ton mécanisme/,
    /ton schéma/,
    /ta blessure/,
    /fenêtre de tolérance/,
    /système nerveux/,
    /régulation émotionnelle/,
    /hyperactivation/,
    /dissociation/,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(allText)) {
      errors.push("forbidden_pattern: " + pattern.source);
    }
  }

  // Max 1 question (tolérance pour "est-ce que... ?")
  const questionMarks = (response.question || "").split("?").length - 1;
  if (questionMarks > 1) {
    errors.push("too_many_questions");
  }

  // Longueur max ~100 mots (marge 30% = 130)
  const displayedText = [
    response.mirror,
    response.hypothesis,
    response.question,
    response.micro_action,
  ].filter(Boolean).join(" ");

  const wordCount = displayedText.split(/\s+/).length;
  if (wordCount > 130) {
    errors.push("response_too_long: " + wordCount + " mots");
  }

  return { valid: errors.length === 0, errors };
}

// ===================================================================
// SECTION 2.4 — FALLBACK JSON
// ===================================================================

function buildFallbackResponse(rawText: string, module: string): TraceaResponse {
  return {
    tone_level: "soft",
    risk_level: "low",
    module,
    mirror: rawText,
    hypothesis: "",
    insight: "",
    question: "",
    micro_action: "",
    pattern_observation: "",
    progress_signal: "",
    next_step_suggestion: "",
    safety_message: "",
    user_state_snapshot: {
      dominant_emotion: "indéterminée",
      tension_level: 5,
      regulation_state: "stable",
      clarity_level: 5,
    },
    do_not_store: false,
  };
}

function parseJsonResponse(rawText: string): TraceaResponse | null {
  try {
    // Nettoyer les backticks markdown
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    return parsed as TraceaResponse;
  } catch {
    return null;
  }
}

function ensureRequiredFields(response: TraceaResponse, module: string): TraceaResponse {
  if (!response.mirror) response.mirror = "";
  if (!response.hypothesis) response.hypothesis = "";
  if (!response.insight) response.insight = "";
  if (!response.question) response.question = "";
  if (!response.micro_action) response.micro_action = "";
  if (!response.pattern_observation) response.pattern_observation = "";
  if (!response.progress_signal) response.progress_signal = "";
  if (!response.next_step_suggestion) response.next_step_suggestion = "";
  if (!response.safety_message) response.safety_message = "";
  if (!response.module) response.module = module;
  if (!response.tone_level) response.tone_level = "soft";
  if (!response.risk_level) response.risk_level = "low";
  if (!response.user_state_snapshot) {
    response.user_state_snapshot = {
      dominant_emotion: "indéterminée",
      tension_level: 5,
      regulation_state: "stable",
      clarity_level: 5,
    };
  }
  if (response.do_not_store === undefined) response.do_not_store = false;
  return response;
}

// ===================================================================
// HISTORIQUE DE SESSIONS (pattern detection)
// ===================================================================

async function fetchSessionHistory(userId: string): Promise<string> {
  if (!userId) return "";

  try {
    const { data } = await getSupabase()
      .from("sessions")
      .select(
        "date, context, intensity_before, intensity_after, steps, emotion_primaire, verite_interieure, action_alignee"
      )
      .eq("user_id", userId)
      .eq("completed", true)
      .order("date", { ascending: false })
      .limit(8);

    if (!data || data.length === 0) return "";

    let history = `\n--- HISTORIQUE DES ${data.length} DERNIÈRES TRAVERSÉES ---\n`;
    history += `(Utilise cet historique pour repérer d'éventuels fils rouges émotionnels récurrents. Ne mentionne un pattern que s'il est clairement présent.)\n\n`;

    for (const session of data) {
      const date = new Date(session.date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
      });
      const recovery =
        session.intensity_after !== null
          ? session.intensity_before - session.intensity_after
          : null;

      history += `--- ${date} | ${session.context} | ${session.intensity_before}/10`;
      if (recovery !== null)
        history += ` -> ${session.intensity_after}/10 (${recovery > 0 ? "-" : ""}${Math.abs(recovery)})`;
      history += ` ---\n`;

      const steps = session.steps as Record<string, string> | null;
      if (steps) {
        if (steps.traverser)
          history += `  Vécu : "${steps.traverser.slice(0, 120)}"\n`;
        if (steps.reconnaitre)
          history += `  Émotion : "${steps.reconnaitre.slice(0, 80)}"\n`;
        if (steps.conscientiser)
          history += `  Message : "${steps.conscientiser.slice(0, 100)}"\n`;
        if (steps.emerger)
          history += `  Vérité : "${steps.emerger.slice(0, 100)}"\n`;
      }
      if (session.emotion_primaire)
        history += `  Émotion primaire : ${session.emotion_primaire}\n`;
      if (session.verite_interieure)
        history += `  Vérité intérieure : ${session.verite_interieure.slice(0, 120)}\n`;
      history += `\n`;
    }

    return history;
  } catch {
    return "";
  }
}

// ===================================================================
// SECTION 7 — ASSEMBLAGE COMPLET D'UN APPEL
// ===================================================================

async function generateTraceaResponse(
  module: string,
  userInput: string,
  sessionHistory: string,
  previousContext: string,
  intensity: number,
  context: string,
  userId: string,
): Promise<TraceaResponse & { showSafetyResources: boolean }> {

  // 1. Évaluer le risque
  const riskLevel = assessRiskLevel(userInput);

  // 2. Construire le prompt complet
  const moduleInstructions = MODULE_INSTRUCTIONS[module] || "";
  const riskInstruction = getRiskInstruction(riskLevel);

  // PHASE 2 : Récupérer et injecter la mémoire
  let memoryContext = "";
  try {
    const { profile, recentSummaries } = await getMemoryContext(userId);
    memoryContext = formatMemoryContext(profile, recentSummaries);
  } catch (err) {
    console.warn("[TRACEA API] Memory context fetch failed:", err);
  }

  const fullUserMessage = `${riskInstruction ? riskInstruction + "\n\n" : ""}${moduleInstructions}
${memoryContext}
Contexte de la traversée en cours : ${context} | Intensité émotionnelle : ${intensity}/10

${previousContext ? `--- Ce qui a déjà été traversé dans cette session ---\n${previousContext}\n` : ""}Réponse de l'utilisateur à cette étape :
"${userInput}"
${sessionHistory}`;

  // 3. Appeler l'API (runtime prompt court + developer prompt avec cache)
  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    temperature: 0.4,
    system: [
      { type: "text", text: RUNTIME_PROMPT },
      { type: "text", text: DEVELOPER_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: fullUserMessage }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";

  // 3b. Logger l'usage (fire-and-forget, ne bloque pas la réponse)
  const usage = message.usage as unknown as Record<string, number>;
  logAiUsage({
    userId,
    callType: "step-mirror",
    stepId: module,
    model: "claude-sonnet-4-20250514",
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheCreationTokens: usage.cache_creation_input_tokens || 0,
    cacheReadTokens: usage.cache_read_input_tokens || 0,
  }).catch(() => {});

  // 4. Parser le JSON
  let parsed = parseJsonResponse(rawText);

  // 5. Si le parsing échoue, utiliser le fallback
  if (!parsed) {
    parsed = buildFallbackResponse(rawText, module);
  }

  // 6. Valider la conformité
  const validation = validateResponse(parsed);

  // 6b. Si trop de questions, tronquer à la première phrase interrogative (pas de retry)
  if (validation.errors.includes("too_many_questions") && parsed.question) {
    const firstQuestionEnd = parsed.question.indexOf("?");
    if (firstQuestionEnd !== -1) {
      parsed.question = parsed.question.slice(0, firstQuestionEnd + 1).trim();
    }
  }

  // 7. Si non conforme (pattern interdit), retenter UNE fois
  if (!validation.valid && validation.errors.some(e => e.startsWith("forbidden_pattern"))) {
    console.warn("[TRACEA API] Forbidden pattern detected, retrying...", validation.errors);
    try {
      const retryMessage = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        temperature: 0.4,
        system: [
          { type: "text", text: RUNTIME_PROMPT },
          { type: "text", text: DEVELOPER_PROMPT, cache_control: { type: "ephemeral" } },
        ],
        messages: [{
          role: "user",
          content: fullUserMessage + "\n\nRAPPEL CRITIQUE : ta réponse précédente contenait une formulation interdite. Reformule en étant plus court, plus incarné, plus corporel. Zéro analyse. Zéro interprétation. Les mots de la personne uniquement.",
        }],
      });
      const retryRaw = retryMessage.content[0].type === "text" ? retryMessage.content[0].text : "";
      // Logger le retry (fire-and-forget)
      const retryUsage = retryMessage.usage as unknown as Record<string, number>;
      logAiUsage({
        userId,
        callType: "step-mirror",
        stepId: module,
        model: "claude-sonnet-4-20250514",
        inputTokens: retryUsage.input_tokens,
        outputTokens: retryUsage.output_tokens,
        cacheCreationTokens: retryUsage.cache_creation_input_tokens || 0,
        cacheReadTokens: retryUsage.cache_read_input_tokens || 0,
        isRetry: true,
      }).catch(() => {});
      const retryParsed = parseJsonResponse(retryRaw);
      if (retryParsed) {
        const retryValidation = validateResponse(retryParsed);
        if (retryValidation.valid) {
          parsed = retryParsed;
        }
      }
    } catch (retryErr) {
      console.error("[TRACEA API] Retry failed:", retryErr);
    }
  }

  // 7b. Nettoyage final : si un forbidden pattern persiste après retry, vider le champ fautif
  const finalValidation = validateResponse(parsed);
  if (!finalValidation.valid && finalValidation.errors.some(e => e.startsWith("forbidden_pattern"))) {
    // Identifier quel champ contient le pattern interdit et le vider
    const fieldsToCheck = ["hypothesis", "mirror", "question", "micro_action"] as const;
    for (const field of fieldsToCheck) {
      if (parsed[field]) {
        const fieldText = parsed[field].toLowerCase();
        for (const pattern of [
          /fenêtre de tolérance/, /système nerveux/, /régulation émotionnelle/,
          /hyperactivation/, /dissociation/, /tu souffres de\b/, /tu as un trauma/,
          /tu es dans un schéma/, /la vraie raison/, /ton problème vient de/,
        ]) {
          if (pattern.test(fieldText)) {
            console.warn(`[TRACEA API] Clearing ${field} due to forbidden pattern: ${pattern.source}`);
            parsed[field] = "";
            break;
          }
        }
      }
    }
  }

  // 8. Compléter les champs manquants
  parsed = ensureRequiredFields(parsed, module);

  // 9. Retourner
  return {
    ...parsed,
    showSafetyResources: parsed.risk_level === "high",
  };
}

// ===================================================================
// STEP_ORDER pour le contexte de session
// ===================================================================

const STEP_ORDER = [
  "traverser",
  "reconnaitre",
  "ancrer",
  "conscientiser",
  "emerger",
  "aligner",
];

const STEP_LABELS: Record<string, string> = {
  traverser: "Traverser",
  reconnaitre: "Reconnaître",
  ancrer: "Ancrer",
  conscientiser: "Conscientiser",
  emerger: "Émerger",
  aligner: "Aligner",
};

// ===================================================================
// ROUTES
// ===================================================================

// Étendre le timeout Vercel (60s Pro, 10s Hobby)
// L'appel Claude + mémoire prend 8-15s — le timeout Hobby (10s) est insuffisant
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    console.log("[TRACEA API] Request type:", type, "| stepId:", body.stepId || "n/a");

    // --- Rate Limiting : vérifier AVANT tout appel IA ---
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = await checkRateLimit({
      userId: body.userId || undefined,
      ip: clientIp,
    });

    if (!rateLimitResult.allowed) {
      console.warn(`[TRACEA API] Rate limited: ${rateLimitResult.reason} | user: ${body.userId || "anon"} | ip: ${clientIp || "unknown"}`);
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    if (type === "step-mirror") {
      return await handleStepMirror(body);
    } else if (type === "final-analysis") {
      return await handleFinalAnalysis(body);
    }

    return NextResponse.json(
      { error: "Type de requête invalide" },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[TRACEA API] Error:", errMsg);

    let userMessage = "Une erreur est survenue. Tu peux continuer ta session.";
    if (errMsg.includes("credit balance is too low")) {
      userMessage = "Le service d'analyse IA est temporairement indisponible (crédits API insuffisants). Tu peux continuer ta session normalement.";
    } else if (errMsg.includes("ANTHROPIC_API_KEY")) {
      userMessage = "Configuration API manquante. Contacte l'administratrice.";
    } else if (errMsg.includes("authentication")) {
      userMessage = "Erreur d'authentification API. Contacte l'administratrice.";
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}

// ===================================================================
// STEP MIRROR — Retour structuré JSON après chaque étape
// ===================================================================

async function handleStepMirror(body: {
  stepId: string;
  stepResponse: string;
  previousSteps: Record<string, string>;
  context: string;
  intensity: number;
  userId: string;
  entryContext?: string;
  mirrorNotes?: Record<string, string>;
}) {
  const { stepId, stepResponse, previousSteps, context, intensity, userId, entryContext, mirrorNotes } = body;

  // Build context from previous steps
  let previousContext = "";

  // Injecter la question d'entrée comme contexte initial (Section 3 Phase 4)
  if (entryContext && entryContext.trim() && stepId === "traverser") {
    previousContext += `L'utilisateur a décrit son état initial ainsi : "${entryContext}"\n\n`;
  }

  for (const sid of STEP_ORDER) {
    if (sid === stepId) break;
    if (previousSteps[sid]) {
      previousContext += `  ${STEP_LABELS[sid] || sid} : "${previousSteps[sid]}"\n\n`;
    }
  }

  // Injecter les notes intermédiaires (champs "Note-le") — PRIORITAIRES
  if (mirrorNotes && Object.keys(mirrorNotes).length > 0) {
    previousContext += `\n--- Notes libres de l'utilisateur (PRIORITAIRES — à utiliser dans les reformulations) ---\n`;
    for (const [noteStepId, noteText] of Object.entries(mirrorNotes)) {
      const label = STEP_LABELS[noteStepId] || noteStepId;
      previousContext += `  ${label} (note libre) : "${noteText}"\n`;
    }
    previousContext += `\n`;
  }

  // Utiliser le flux complet (section 7) — Phase 2 : userId pour la mémoire
  // Pas d'historique de sessions précédentes : l'IA répond uniquement à l'input actuel
  const result = await generateTraceaResponse(
    stepId,
    stepResponse,
    "",
    previousContext,
    intensity,
    context,
    userId,
  );

  return NextResponse.json(result);
}

// ===================================================================
// FINAL ANALYSIS — Analyse de fin de session
// ===================================================================

async function handleFinalAnalysis(body: {
  steps: Record<string, string>;
  context: string;
  intensityBefore: number;
  intensityAfter: number;
  userId: string;
}) {
  const { steps, context, intensityBefore, intensityAfter, userId } = body;
  const recovery = intensityBefore - intensityAfter;

  let stepsContent = "";
  for (const sid of STEP_ORDER) {
    if (steps[sid]) {
      stepsContent += `${STEP_LABELS[sid] || sid} :\n"${steps[sid]}"\n\n`;
    }
  }

  const userMessage = `Voici la traversée complète de cette personne.

Contexte : ${context}
Intensité avant : ${intensityBefore}/10
Intensité après : ${intensityAfter}/10
Mouvement d'intensité : ${recovery > 0 ? `baisse de ${recovery} points` : recovery === 0 ? "stable" : `hausse de ${Math.abs(recovery)} points`}

--- Les étapes de cette traversée ---
${stepsContent}
Génère un résumé COURT de cette traversée. Format obligatoire en 3 parties :

1. LE MOUVEMENT — 1 phrase. Ce qui a changé dans le corps. Ton incarné : "La tension est descendue à ${intensityAfter}/10" pas "Niveau de tension : ${intensityAfter}/10". Utilise les mots de la personne.

2. LA VÉRITÉ — 1 phrase. Ce qui est présent. Ce que la personne a nommé ou touché. Ses mots, pas les tiens. Ton incarné : "Tu viens de faire redescendre ton corps" pas "Émotion dominante : apaisement".

3. LE GESTE — 1 phrase. L'action choisie. Simple et concrète.

Règles absolues :
- Court. Simple. Incarné.
- Pas de narration longue. 3 phrases, c'est tout.
- Pas d'analyse psychologique. Pas de diagnostic. Pas de jargon.
- Pas de "bravo", pas de jugement.
- Pas de projection dans le futur.
- Pas de comparaison avec des sessions précédentes.
- Ton direct, sensoriel, humain. Les mots de la personne.
- Reprendre au moins 1 expression exacte utilisée par la personne dans ses réponses.
- L'ensemble fait 3 phrases maximum.`;

  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    temperature: 0.45,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Logger l'usage (fire-and-forget)
  const analysisUsage = message.usage as unknown as Record<string, number>;
  logAiUsage({
    userId,
    callType: "final-analysis",
    model: "claude-sonnet-4-20250514",
    inputTokens: analysisUsage.input_tokens,
    outputTokens: analysisUsage.output_tokens,
    cacheCreationTokens: analysisUsage.cache_creation_input_tokens || 0,
    cacheReadTokens: analysisUsage.cache_read_input_tokens || 0,
  }).catch(() => {});

  return NextResponse.json({ analysis: text });
}
