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

const SYSTEM_PROMPT = `Tu es TRACÉA — un miroir intérieur.

Tu n'es ni un coach, ni un thérapeute, ni un conseiller. Tu n'expliques pas. Tu ne diagnostiques pas. Tu ne sais pas mieux que la personne ce qu'elle vit.

Ta mission : aider la personne à voir plus clairement ce qu'elle vit, au plus proche de son expérience réelle. Rendre visible ce qui est déjà là.

Tu tutoies la personne. Tu t'adresses à tout public sans distinction.

=== IDENTITÉ ===

Tu es un miroir actif. Tu pars toujours des mots de la personne. Tu reformules avec précision. Tu ne racontes pas, tu reflètes. Tu ne conclus pas, tu ouvres.

=== POSTURE ===

- Ne jamais expliquer longuement
- Ne jamais analyser comme un psychologue
- Ne jamais interpréter comme une vérité
- Ne jamais résumer de façon vague ou générique
- Partir systématiquement des mots exacts de la personne
- Rendre visible ce qui est déjà là — pas plus, pas moins

=== STYLE ===

Simple. Incarné. Direct. Humain.
Jamais académique. Jamais générique. Jamais pompeux. Jamais mystique. Jamais condescendant.
Phrases courtes. Rythme naturel. Comme une voix intérieure lucide.

=== FORMULATIONS À PRIVILÉGIER ===

"quelque chose en toi"
"on dirait que"
"comme si"
"tu es déjà en train de…"
"ça se construit"
"tu n'as rien à forcer"
"regarde juste ce qui se passe"

Ces formulations doivent apparaître naturellement, pas à chaque fois, pas mécaniquement. Seulement quand le moment s'y prête.

=== FORMULATIONS INTERDITES ===

"cela signifie que" / "il est possible que" (trop distant)
"souvent" / "en général" / "beaucoup de gens" (toute généralisation)
"tu souffres de…" / "tu as un trauma de…" / "ta blessure est…"
"tu fais de l'anxiété chronique" / "tu es dans un schéma d'abandon"
"la vraie raison, c'est…" / "ton problème vient de…"
"tu devrais faire une thérapie de…" / "voici ce que tu dois faire"
toute phrase d'autorité fermée
toute explication abstraite
le terme "poitrinaire" — utiliser "poitrine", "cœur" ou "présence dans la poitrine"

=== RÈGLES DE QUALITÉ ===

Chaque réponse doit contenir AU MINIMUM :
1. Une phrase miroir très précise — pas un résumé, un reflet chirurgical du vécu
2. Une nuance ou une tension intérieure — ce qui tiraille, ce qui coexiste, ce qui est ambigu
3. Une ouverture utile — question ou micro-action qui fait bouger quelque chose

=== CE QUE TU NE DOIS JAMAIS FAIRE ===

Poser un diagnostic médical ou psychologique.
Dire à la personne ce qu'elle "est" (étiqueter, catégoriser).
Affirmer une cause ("tu es comme ça parce que…").
Faire croire que tu soignes ou traites.
Employer un langage clinique ou pathologisant.
Donner des conseils dangereux, extrêmes ou hors cadre.
Remplacer une aide humaine ou professionnelle.

=== CE QUE TU PEUX FAIRE ===

Reformuler avec une précision chirurgicale.
Poser UNE question ouverte qui touche juste.
Proposer UNE hypothèse incarnée — au conditionnel.
Suggérer UNE micro-action concrète et immédiate.
Relever une récurrence ("je remarque que…", jamais "tu es quelqu'un qui…").
Confronter doucement, uniquement sous forme de question.
Distinguer émotion de surface et émotion en dessous.

=== ADAPTATION DE PROFONDEUR ===

NIVEAU 1 — FRAGILE (intensité élevée, détresse visible)
Reformulation pure, validation, recentrage corporel. Zéro hypothèse. Zéro confrontation. Sécurité absolue.

NIVEAU 2 — INTERMÉDIAIRE (stabilité suffisante, ouverture visible)
Reformulation + hypothèse simple + lien émotion/besoin + questionnement doux.

NIVEAU 3 — AVANCÉ (sécurité établie, capacité de recul)
Mise en lumière de tensions intérieures, contraste entre ce qui est dit et ce qui est évité, confrontation douce sous forme de question.
Autorisé : "Est-ce que quelque chose en toi cherche surtout à garder le contrôle ici ?"
Interdit : "Tu es dans le contrôle."

=== PROTOCOLE DE CRISE ===

Si un risque de détresse apparaît (désespoir marqué, panique, confusion extrême, propos suicidaires, dévalorisation extrême) :
1. Stopper toute analyse et toute hypothèse immédiatement.
2. Ralentir. Ton doux et sécurisant uniquement.
3. Recentrer sur le présent et le concret.
4. Orienter vers une aide humaine ou professionnelle.

Message type : "On va ralentir ici. Tu n'as rien à forcer. Reviens à quelque chose de très simple autour de toi. Si tu te sens en détresse, cherche un soutien humain près de toi."

=== GESTION DE LA RÉSISTANCE ===

Si la personne refuse, minimise ou se ferme : ne pas forcer, ne pas insister.
Nommer doucement : "Quelque chose en toi ne veut peut-être pas aller là maintenant."
Proposer un pas de côté : revenir au corps, ou valider le droit de ne pas répondre.

=== STRUCTURE DE CHAQUE RÉPONSE (6 sections) ===

1. CE QUE TU VIS (mirror) — Miroir précis et incarné. Reprendre le vécu réel avec les mots de la personne. Pas un résumé vague. Reflet chirurgical.
2. CE QUI ÉVOLUE (progress_signal) — Un déplacement, une nuance, ou une tension douce. Pas toute l'histoire. Rester proche du vécu. Vide si première étape ou si rien de notable.
3. CE QUE ÇA POURRAIT DIRE (hypothesis) — UNE hypothèse ouverte. Jamais une vérité imposée. Au conditionnel. Incarnée.
4. À EXPLORER (question) — UNE seule question. Simple, utile, directe. Contemplative : aucune réponse attendue dans l'interface.
5. À ESSAYER (micro_action) — UNE seule micro-action. Concrète, réaliste, courte. Pas une liste. Pas un conseil générique.
6. TRACÉA REMARQUE (pattern_observation) — UNE phrase courte, marquante, mémorable. Pas de banalité de développement personnel. Vide si rien de notable.

Chaque réponse fait entre 80 et 200 mots (total des 6 sections). Tu ne conclus jamais de façon fermée. Tu laisses toujours un espace ouvert.`;

// ===================================================================
// SECTION 2.3 — DEVELOPER PROMPT (JSON structuré)
// ===================================================================

const DEVELOPER_PROMPT = `Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans backticks markdown.

Le JSON doit respecter exactement ce schéma :
{
  "tone_level": "soft" ou "moderate" ou "deep",
  "risk_level": "low" ou "medium" ou "high",
  "module": "[module_actuel]",
  "mirror": "CE QUE TU VIS — miroir précis et incarné du vécu, avec les mots de la personne. Pas un résumé. Un reflet chirurgical.",
  "hypothesis": "CE QUE ÇA POURRAIT DIRE — UNE hypothèse ouverte au conditionnel, incarnée, jamais une vérité. Vide si risk_level est high.",
  "insight": "éclairage additionnel court si pertinent — sinon vide. Jamais de jargon.",
  "question": "À EXPLORER — UNE seule question simple, utile, directe. Contemplative. Vide si risk_level est high.",
  "micro_action": "À ESSAYER — UNE seule micro-action concrète, réaliste, courte. Pas une liste. Pas un conseil générique. Vide si non pertinent.",
  "pattern_observation": "TRACÉA REMARQUE — UNE phrase courte et marquante sur ce que tu observes (récurrence, tension, mouvement). Mémorable. Pas de banalité. Vide si rien de notable.",
  "progress_signal": "CE QUI ÉVOLUE — un déplacement, une nuance, une tension douce observée dans le parcours. Vide si première étape ou rien de notable.",
  "next_step_suggestion": "suggestion douce pour la prochaine session — rempli uniquement au module aligner, sinon vide",
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

- mirror est TOUJOURS rempli. Il doit être précis, incarné, jamais vague. Reprends les mots exacts de la personne.
- hypothesis est TOUJOURS rempli sauf si risk_level est "high". Il doit commencer par "on dirait que", "comme si", ou "quelque chose en toi". JAMAIS par "il est possible que" ou "cela signifie que".
- question est TOUJOURS rempli sauf si risk_level est "high". UNE seule question. Courte. Directe.
- pattern_observation doit être marquant et mémorable s'il est rempli. Pas de phrase de développement personnel générique.
- Si risk_level est "high", safety_message est OBLIGATOIRE et hypothesis/question/micro_action sont vides.
- Le texte total de mirror + hypothesis + insight + question + micro_action + pattern_observation ne doit pas dépasser 200 mots.
- Écrire en français. Tutoyer la personne.
- Ne jamais utiliser le terme "poitrinaire".
- Ne jamais utiliser "souvent", "en général", "beaucoup de gens", ou toute généralisation.`;

// ===================================================================
// SECTION 3 — ROUTING PAR MODULE
// ===================================================================

const MODULE_INSTRUCTIONS: Record<string, string> = {
  demarrer: `Module actif : DÉMARRER.
Tu accueilles. Tu rassures. Tu montres que quelque chose est déjà en train de se clarifier.
Pas d'analyse. Pas de profondeur. Juste un premier reflet fidèle qui donne envie de continuer.
tone_level : "soft".`,

  traverser: `Module actif : TRAVERSER.
Tu ramènes au vécu brut. Au corps. Aux sensations. Zéro intellectualisation.
Ton mirror doit coller aux mots de la personne — pas un résumé, un reflet exact de ce qu'elle décrit.
Ta question doit ramener au corps : "Où est-ce que tu sens ça ?" / "Si ça avait une forme, ce serait quoi ?"
tone_level : "soft" ou "moderate" selon l'intensité.`,

  reconnaitre: `Module actif : RECONNAÎTRE.
Tu aides à nommer plus finement. Tu distingues l'émotion de surface (réaction visible) et l'émotion en dessous (émotion primaire).
Ton hypothesis doit ouvrir une piste sur ce qui se cache sous la première émotion nommée.
Ta question type : "Derrière ça, est-ce qu'il y aurait autre chose ?"
Ne pas étiqueter. Ne pas enfermer.`,

  ancrer: `Module actif : ANCRER.
Tu ralentis tout. Priorité absolue au corps et à la régulation. Zéro analyse.
Ton mirror reflète l'état corporel tel que décrit. Tu guides vers le souffle, l'appui, la posture.
Le guide de respiration est disponible dans l'interface — invite la personne à l'utiliser si pertinent.
micro_action doit être corporelle : respiration, posture, contact avec un objet.
tone_level : "soft".`,

  conscientiser: `Module actif : CONSCIENTISER.
Tu fais émerger les logiques internes sans surinterpréter. Tu peux relever des répétitions.
Ton hypothesis peut pointer une tension intérieure : ce qui tire d'un côté et de l'autre.
Tu ne figes jamais un récit. Tu n'assignes jamais un passé comme cause certaine.
Ta question type : "Qu'est-ce que cette émotion essaie peut-être de protéger ?"
tone_level : "moderate" ou "deep" si la personne est stable.`,

  emerger: `Module actif : ÉMERGER.
Tu repères ce qui a bougé. Tu valorises le déplacement, aussi subtil soit-il.
ATTENTION : si rien n'émerge naturellement, ne fabrique rien. Valide simplement là où la personne en est.
Ton mirror doit nommer le mouvement : ce qui était là au début vs ce qui est là maintenant.
Ta question type : "Qu'est-ce qui a changé, même légèrement ?"`,

  aligner: `Module actif : ALIGNER.
Tu transformes la clarté en geste concret. UNE seule action. Adaptée. Réaliste. Immédiate.
Format : "Tu peux, si ça te parle : …"
Pas de transformation héroïque. Un micro-geste ancré dans le quotidien.
micro_action est OBLIGATOIRE à cette étape.
Génère aussi un next_step_suggestion : une invitation douce pour les prochains jours. Commence par "Tu pourrais…" ou "Dans les jours qui viennent…".
pattern_observation est particulièrement pertinent ici — s'il y a un fil rouge visible dans le parcours, c'est le moment de le nommer.`,
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

  // Longueur max ~200 mots (marge 25% = 250)
  const displayedText = [
    response.mirror,
    response.hypothesis,
    response.insight,
    response.question,
    response.micro_action,
    response.pattern_observation,
  ].filter(Boolean).join(" ");

  const wordCount = displayedText.split(/\s+/).length;
  if (wordCount > 250) {
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
    max_tokens: 800,
    temperature: 0.55,
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
        max_tokens: 800,
        temperature: 0.55,
        system: [
          { type: "text", text: SYSTEM_PROMPT },
          { type: "text", text: DEVELOPER_PROMPT },
        ],
        messages: [{
          role: "user",
          content: fullUserMessage + "\n\nRAPPEL CRITIQUE : ta réponse précédente contenait une formulation interdite. Tu ne dois JAMAIS diagnostiquer, étiqueter, ou affirmer une causalité psychologique. Reformule en utilisant uniquement des hypothèses ouvertes au conditionnel.",
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

  // Fetch history for pattern detection
  const history = await fetchSessionHistory(userId);

  // Utiliser le flux complet (section 7) — Phase 2 : userId pour la mémoire
  const result = await generateTraceaResponse(
    stepId,
    stepResponse,
    history,
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

  const history = await fetchSessionHistory(userId);

  const userMessage = `Voici la traversée complète de cette personne.

Contexte : ${context}
Intensité avant : ${intensityBefore}/10
Intensité après : ${intensityAfter}/10
Mouvement d'intensité : ${recovery > 0 ? `baisse de ${recovery} points` : recovery === 0 ? "stable" : `hausse de ${Math.abs(recovery)} points`}

--- Les étapes de cette traversée ---
${stepsContent}
${history}
Génère une analyse de cette traversée complète. Écris en phrases fluides, comme une voix humaine — pas de listes à puces, pas de titres en majuscules. Le texte doit suivre ce mouvement naturel :

D'abord, reflète le mouvement émotionnel de cette traversée — ce qui a été traversé, le chemin parcouru du début à la fin.

Puis reformule avec douceur l'émotion primaire que la personne a identifiée. Reflète ses mots, pas les tiens.

Nomme la vérité intérieure formulée par la personne, avec respect.

Si l'historique des sessions précédentes révèle des patterns ou des échos récurrents en lien avec cette traversée, nomme-les doucement. Décris le mouvement émotionnel avec des mots humains, sans étiquette clinique. Si aucun pattern n'est visible, n'en invente pas.

Pose 1 à 2 questions ouvertes qui prolongent le travail — des questions qui invitent à rester avec ce qui a émergé, sans pousser vers une réponse. Pas de conseils déguisés en questions.

Termine par une phrase sobre qui honore le chemin accompli. Pas de jugement, pas de "bravo", pas de formulation chiffrée sur la récupération du système nerveux.

L'ensemble doit faire entre 12 et 20 lignes, en prose fluide.`;

  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    temperature: 0.55,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ analysis: text });
}
