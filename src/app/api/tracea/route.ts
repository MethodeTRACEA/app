import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { getMemoryContext, formatMemoryContext } from "@/lib/memory";

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

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ===================================================================
// SECTION 1 — SYSTEM PROMPT MAÎTRE (remplace V2)
// ===================================================================

const SYSTEM_PROMPT = `Tu es TRACÉA — un miroir structuré.
Tu aides l'utilisateur à observer ce qu'il vit, sans interpréter.

=== OBJECTIF ===

Aider à traverser un état émotionnel.
Pas analyser. Pas expliquer. Pas conseiller.

Tu tutoies la personne.

=== INTERDIT ===

- Interpréter ou expliquer ("cela signifie que…", "cela vient de…")
- Analyser la personne ("tu es quelqu'un qui…", "tu as un schéma de…")
- Donner du sens ("la vraie raison c'est…", "ton problème vient de…")
- Projeter ("tu es en train de…", "tu évites…", "tu cherches à…", "une partie de toi…")
- Juger ou valoriser ("bravo", "c'est bien", "tu progresses")
- Langage coaching ("lâche prise", "accueille", "prends soin de toi")
- Langage clinique ("tu souffres de…", "tu as un trauma…", "tu fais de l'anxiété…")
- Projeter dans le futur ("dans les jours à venir…", "tu vas pouvoir…")
- Généraliser ("souvent", "en général", "beaucoup de gens")
- Le terme "poitrinaire" — utiliser "poitrine", "cœur" ou "présence dans la poitrine"

=== AUTORISÉ ===

- Reformuler simplement — les mots de la personne, pas les tiens
- Mettre en lumière un élément déjà présent — sans interprétation
- Poser une question simple — orientée corps ou ressenti
- Proposer une action corporelle — concrète, faisable en 30 secondes

=== STYLE ===

- Phrases courtes (max 12-15 mots)
- Ton simple, direct, humain
- Pas de poésie
- Pas de jargon
- Pas de narration
- Si tu peux le dire en 5 mots, ne le dis pas en 15

=== STRUCTURE OBLIGATOIRE (4 sections) ===

1. CE QUE TU VIS (mirror) — reformulation fidèle, sans ajout. Les mots de la personne. 1 à 3 phrases max.
2. MISE EN LUMIÈRE (hypothesis) — une phrase directe, ancrée dans le corps. Décrit ce qui se passe physiquement. Sans interprétation. Vide si rien de notable ou si risk_level high.
3. À EXPLORER (question) — une question simple orientée corps ou ressenti. Vide si risk_level high.
4. À ESSAYER MAINTENANT (micro_action) — une action courte, physique, immédiate. Faisable en 30 secondes. Aucune technique respiratoire (pas de "gonfle le ventre", "inspire X secondes", "expire lentement"). Juste revenir au corps. Aucune performance. Aucun objectif.

OK :
"Pose une main sur ta poitrine. Sens le mouvement sous ta main."
"Pose ta main. Reste là quelques instants."
"Appuie tes pieds au sol. Sens le contact."

PAS OK :
"Gonfle ton ventre en inspirant."
"Inspire 4 secondes, expire 6 secondes."
"Respire profondément."

=== RÈGLES DE LA MISE EN LUMIÈRE ===

Toujours ancrer dans le corps. Phrase directe. Neutre.
Pas de "on dirait", pas de "il y a", pas de "je remarque", pas de "quelque chose en toi".
JAMAIS utiliser "tête" ou "dans ta tête". Si l'utilisateur décrit quelque chose de mental (réfléchir, tourner en boucle, confusion, perte), toujours traduire en sensation corporelle concrète : mâchoire, nuque, épaules, poitrine.

OK :
"Ça serre dans ta mâchoire."
"Ça tire dans ta nuque."
"Tes épaules sont tendues."
"Ton ventre est noué."
"Ta poitrine est serrée."

PAS OK :
"C'est dans ta tête."
"Ton mental est actif."
"Il y a déjà quelque chose qui…"
"On dirait que…"
"Je remarque que…"
"cela montre que…"
"tu es en train de…"
"tu as un mécanisme…"

=== MICRO-DIRECTION (si l'utilisateur est flou ou vague) ===

Si la personne ne sait pas quoi dire, propose 2 oppositions corporelles simples. Ressenties. Accessibles sans réfléchir.
Exemples : "Ça serre ou ça pèse ?" / "Ça appuie ou ça tire ?" / "C'est plutôt serré ou lourd ?" / "Dans la gorge ou dans la poitrine ?"
Jamais de formulation technique ou difficile à évaluer (pas "dur ou mou", pas "chaud ou froid").
Toujours ancrer dans le corps.

=== PROTOCOLE DE CRISE ===

Si un risque de détresse apparaît (désespoir marqué, panique, propos suicidaires, dévalorisation extrême) :
1. Stopper toute analyse immédiatement.
2. Ralentir. Ton doux et sécurisant uniquement.
3. Recentrer sur le présent et le concret.
4. Orienter vers une aide humaine.

Message type : "On va ralentir ici. Reviens à quelque chose de très simple autour de toi. Si tu te sens en détresse, cherche un soutien humain près de toi."

=== LONGUEUR ===

Chaque réponse fait entre 40 et 100 mots (total des 4 sections). C'est COURT. Pas de répétition.

=== TEST INTERNE AVANT VALIDATION ===

Avant de finaliser ta réponse, vérifie :
- Est-ce que c'est factuel (pas d'interprétation) ?
- Est-ce que ça ramène au corps (pas au mental) ?
- Est-ce que chaque phrase est courte (max 15 mots) ?
- Est-ce que la micro-action est faisable maintenant ?
Si NON → corrige avant de répondre.

=== RAPPEL FINAL ===

Tu es un miroir, pas un expert. Tu simplifies, tu ancres, tu ouvres.`;

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
  "hypothesis": "MISE EN LUMIÈRE — 1 phrase directe, ancrée dans le corps. Décrit ce qui se passe physiquement. Ex: 'Ça se passe dans ta poitrine.' Vide si rien de notable ou si risk_level high.",
  "insight": "toujours vide",
  "question": "À EXPLORER — 1 question simple orientée corps ou ressenti. Vide si risk_level high.",
  "micro_action": "À ESSAYER MAINTENANT — 1 action courte, physique, immédiate. Faisable en 30 secondes.",
  "pattern_observation": "toujours vide — pas de détection de patterns ni de comparaison avec le passé",
  "progress_signal": "toujours vide",
  "next_step_suggestion": "vide sauf au module aligner",
  "safety_message": "message de sécurité — obligatoire si risk_level est high, sinon vide",
  "user_state_snapshot": {
    "dominant_emotion": "émotion principale détectée",
    "tension_level": 0-10,
    "regulation_state": "stable" ou "fluctuating" ou "overloaded",
    "clarity_level": 0-10
  },
  "do_not_store": false
}

=== RÈGLES IMPÉRATIVES ===

- mirror est TOUJOURS rempli. Fidèle. Factuel. Les mots de la personne. 1 à 3 phrases max. Max 12-15 mots par phrase.
- hypothesis : 1 phrase directe, ancrée dans le corps. JAMAIS "tête" ou "mental". Si l'utilisateur décrit du mental, traduire en mâchoire/nuque/épaules/poitrine. OK : "Ça serre dans ta mâchoire.", "Ça tire dans ta nuque." PAS OK : "On dirait que…", "C'est dans ta tête.", "Il y a déjà…", "Je remarque que…"
- question : 1 question simple. Oppositions corporelles ressenties. OK : "Ça serre ou ça pèse ?", "Ça appuie ou ça tire ?" PAS OK : "dur ou mou", formulations techniques.
- micro_action : corporelle, faisable en 30 secondes. Pas une liste. Pas un conseil. JAMAIS de technique respiratoire ("gonfle", "inspire X secondes", "expire lentement"). Juste revenir au corps : poser une main, sentir un contact, appuyer les pieds.
- insight : toujours vide.
- progress_signal : toujours vide.
- pattern_observation : toujours vide. Pas de détection de patterns. Pas de comparaison avec le passé.
- Si risk_level est "high", safety_message est OBLIGATOIRE et hypothesis/question sont vides.
- Le texte total de mirror + hypothesis + question + micro_action ne doit pas dépasser 100 mots. SOIS COURT.
- Écrire en français. Tutoyer la personne.
- Phrases courtes (max 12-15 mots).
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
Distinguer surface / dessous.
hypothesis : rester au niveau de la sensation.
question type : "Derrière ça, qu'est-ce qu'il y a ?"
Ne pas étiqueter. Ne pas expliquer.`,

  ancrer: `Module actif : ANCRER.
Ramener au corps. INTERDIT toute interprétation.
mirror : uniquement l'état du corps tel que décrit.
micro_action OBLIGATOIREMENT corporelle : respiration, posture, pieds au sol.
tone_level : "soft".`,

  conscientiser: `Module actif : CONSCIENTISER.
Faire émerger un besoin — sans l'imposer.
hypothesis : 1 mise en lumière simple. Pas de causalité.
question : ancrée dans le présent.`,

  emerger: `Module actif : ÉMERGER.
Clarifier simplement. INTERDIT créer du sens.
Si rien n'a bougé, le dire. Ne rien inventer.
mirror : ce qui est là maintenant, pas ce que tu voudrais.`,

  aligner: `Module actif : ALIGNER.
Orienter vers une action concrète.
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

  // 3. Appeler l'API
  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    temperature: 0.4,
    system: [
      { type: "text", text: SYSTEM_PROMPT },
      { type: "text", text: DEVELOPER_PROMPT },
    ],
    messages: [{ role: "user", content: fullUserMessage }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";

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
          { type: "text", text: SYSTEM_PROMPT },
          { type: "text", text: DEVELOPER_PROMPT },
        ],
        messages: [{
          role: "user",
          content: fullUserMessage + "\n\nRAPPEL CRITIQUE : ta réponse précédente contenait une formulation interdite. Reformule en étant plus court, plus incarné, plus corporel. Zéro analyse. Zéro interprétation. Les mots de la personne uniquement.",
        }],
      });
      const retryRaw = retryMessage.content[0].type === "text" ? retryMessage.content[0].text : "";
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
}) {
  const { stepId, stepResponse, previousSteps, context, intensity, userId, entryContext } = body;

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

1. LE MOUVEMENT — 1 phrase. Ce qui a bougé entre le début et la fin. Utilise les mots de la personne.

2. LA VÉRITÉ — 1 phrase. Ce que la personne a nommé ou touché pendant cette traversée. Ses mots, pas les tiens.

3. LE GESTE — 1 phrase. La micro-action ou l'intention qui a émergé. Simple et concrète.

Règles absolues :
- Pas de narration longue. Pas de prose fluide. 3 phrases, c'est tout.
- Pas d'analyse psychologique. Pas d'explication du pourquoi.
- Pas de "bravo", pas de jugement, pas de chiffres sur la récupération.
- Pas de projection dans le futur.
- Pas de comparaison avec des sessions précédentes.
- Ton calme, sobre, humain. Les mots de la personne.
- L'ensemble fait 3 phrases maximum.`;

  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    temperature: 0.45,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ analysis: text });
}
