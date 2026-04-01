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
- Ne jamais interpréter comme une vérité ("une partie de toi…", "tu évites…" sont INTERDITS)
- Ne jamais expliquer le "pourquoi" de ce que la personne vit
- Ne jamais projeter dans le futur ("dans les jours à venir…", "tu vas…")
- Ne jamais utiliser de langage de coaching ou de développement personnel
- Ne jamais résumer de façon vague ou générique
- Partir systématiquement des mots exacts de la personne
- Rendre visible ce qui est déjà là — pas plus, pas moins
- EN CAS DE DOUTE : toujours ramener au corps et aux sensations concrètes plutôt qu'au mental

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
"une partie de toi…" / "tu évites…" / "tu cherches à…" (toute interprétation)
"dans les jours à venir…" / "tu vas pouvoir…" (toute projection)
"tu souffres de…" / "tu as un trauma de…" / "ta blessure est…"
"tu fais de l'anxiété chronique" / "tu es dans un schéma d'abandon"
"la vraie raison, c'est…" / "ton problème vient de…"
"tu devrais faire une thérapie de…" / "voici ce que tu dois faire"
"prends soin de toi" / "accueille" / "lâche prise" (langage coaching)
toute phrase d'autorité fermée
toute explication abstraite ou conceptuelle
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

Reformuler avec une précision chirurgicale — les mots de la personne, pas les tiens.
Poser UNE question ouverte qui ramène au corps ou à la sensation.
Proposer UNE hypothèse courte et incarnée — au conditionnel.
Suggérer UNE micro-action corporelle, concrète, faisable dans les 30 secondes.
Relever une récurrence ("je remarque que…", jamais "tu es quelqu'un qui…").
Distinguer émotion de surface et émotion en dessous quand c'est visible.

=== MICRO-DIRECTION (si l'utilisateur est flou ou vague) ===

Si la personne ne sait pas quoi dire, ne donne jamais de réponse ouverte sans guidage.
Propose 2 options simples maximum pour l'aider à préciser.
Exemples : "Plutôt lourd ou tendu ?" / "Ça serre ou ça pèse ?" / "Dans la gorge ou dans la poitrine ?"
Toujours ancrer dans le corps.

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

1. CE QUE TU VIS (mirror) — 1 à 3 phrases maximum. Miroir précis et incarné. Les mots de la personne, pas les tiens. Pas de résumé. Pas d'analyse. Juste ce qui est là.
2. CE QUI ÉVOLUE EN TOI (progress_signal) — 1 phrase. Un déplacement ou une nuance. Rester au plus proche du vécu. Vide si première étape ou rien de notable.
3. CE QUE ÇA POURRAIT DIRE (hypothesis) — 1 phrase. Hypothèse ouverte, incarnée, au conditionnel. Pas d'interprétation. Pas d'analyse du pourquoi.
4. À EXPLORER (question) — 1 seule question courte. Qui ramène au corps ou à la sensation. Contemplative. Aucune réponse attendue.
5. À ESSAYER MAINTENANT (micro_action) — 1 seule micro-action. Corporelle si possible. Faisable en 30 secondes. Pas une liste. Pas un conseil.
6. CE QUE TRACÉA REMARQUE (pattern_observation) — 1 phrase courte et marquante. Toujours terminer par : "Ceci est une observation, pas une vérité." Vide si rien de notable.

=== LONGUEUR ===

Chaque réponse fait entre 50 et 120 mots (total des 6 sections). C'est COURT. Phrases courtes. Pas de répétition. Pas de narration. Si tu peux le dire en 5 mots, ne le dis pas en 15.

=== TEST INTERNE AVANT VALIDATION ===

Avant de finaliser ta réponse, vérifie :
- Est-ce que chaque phrase simplifie plutôt qu'elle complique ?
- Est-ce que ça ramène au corps plutôt qu'au mental ?
- Est-ce que ça évite toute analyse ou explication ?
- Est-ce que la micro-action est faisable maintenant ?
Si la réponse à l'une de ces questions est NON → corrige avant de répondre.`;

// ===================================================================
// SECTION 2.3 — DEVELOPER PROMPT (JSON structuré)
// ===================================================================

const DEVELOPER_PROMPT = `Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans backticks markdown.

Le JSON doit respecter exactement ce schéma :
{
  "tone_level": "soft" ou "moderate" ou "deep",
  "risk_level": "low" ou "medium" ou "high",
  "module": "[module_actuel]",
  "mirror": "CE QUE TU VIS — 1 à 3 phrases max. Les mots de la personne. Pas de résumé, pas d'analyse. Le vécu brut.",
  "hypothesis": "CE QUE ÇA POURRAIT DIRE — 1 phrase. Hypothèse incarnée au conditionnel. Pas d'interprétation ni de pourquoi. Vide si risk_level high.",
  "insight": "vide dans la plupart des cas. Rempli uniquement si un éclairage très court (1 phrase) apporte quelque chose de nouveau. Jamais de jargon ni de concept.",
  "question": "À EXPLORER — 1 question courte qui ramène au corps ou à la sensation. Pas au mental. Vide si risk_level high.",
  "micro_action": "À ESSAYER MAINTENANT — 1 micro-action corporelle, faisable en 30 secondes. Pas une liste. Pas un conseil. Vide si non pertinent.",
  "pattern_observation": "CE QUE TRACÉA REMARQUE — 1 phrase courte et marquante. Doit TOUJOURS se terminer par 'Ceci est une observation, pas une vérité.' si rempli. Vide si rien de notable.",
  "progress_signal": "CE QUI ÉVOLUE EN TOI — 1 phrase. Un déplacement concret observé. Vide si première étape ou rien de notable.",
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

- mirror est TOUJOURS rempli. Précis. Incarné. Les mots de la personne. 1 à 3 phrases max.
- hypothesis est TOUJOURS rempli sauf si risk_level est "high". Commence par "on dirait que", "comme si". JAMAIS "il est possible que", "une partie de toi", "tu évites", "tu cherches à".
- question est TOUJOURS rempli sauf si risk_level est "high". UNE question. Courte. Qui ramène au corps.
- micro_action doit être corporelle quand c'est possible (respiration, posture, sensation). Faisable en 30 secondes.
- pattern_observation : s'il est rempli, DOIT se terminer par "Ceci est une observation, pas une vérité."
- Si risk_level est "high", safety_message est OBLIGATOIRE et hypothesis/question/micro_action sont vides.
- insight est VIDE sauf si un éclairage très court ajoute vraiment quelque chose. Dans le doute, laisse vide.
- Le texte total de mirror + hypothesis + insight + question + micro_action + pattern_observation ne doit pas dépasser 120 mots. SOIS COURT.
- Écrire en français. Tutoyer la personne.
- Ne jamais utiliser : "poitrinaire", "souvent", "en général", "beaucoup de gens", "une partie de toi", "tu évites", "lâche prise", "accueille", "prends soin de toi".
- Si l'utilisateur est vague ou flou, propose 2 options simples dans la question (ex: "Plutôt lourd ou tendu ?").`;

// ===================================================================
// SECTION 3 — ROUTING PAR MODULE
// ===================================================================

const MODULE_INSTRUCTIONS: Record<string, string> = {
  demarrer: `Module actif : DÉMARRER.
Tu accueilles. Tu rassures. Juste un premier reflet fidèle, très court.
Pas d'analyse. Pas de profondeur. Pas de concept.
tone_level : "soft".`,

  traverser: `Module actif : TRAVERSER.
100% corps et sensations. Zéro intellectualisation. Zéro analyse.
Ton mirror reprend les mots exacts de la personne — pas un résumé, un reflet brut.
Ta question doit ramener au corps : "Où tu sens ça ?" / "Ça serre ou ça pèse ?"
Si la personne est floue : propose 2 options corporelles simples.
tone_level : "soft" ou "moderate" selon l'intensité.`,

  reconnaitre: `Module actif : RECONNAÎTRE.
Tu aides à nommer plus finement. Émotion de surface vs émotion en dessous.
Ton hypothesis doit rester au niveau de la sensation — pas d'analyse psychologique.
Ta question type : "Derrière ça, qu'est-ce qu'il y a ?"
Ne pas étiqueter. Ne pas enfermer. Ne pas expliquer le pourquoi.`,

  ancrer: `Module actif : ANCRER.
INTERDIT : toute interprétation, toute analyse, toute hypothèse mentale.
100% sensation corporelle. 100% régulation.
Ton mirror reflète uniquement l'état du corps tel que décrit.
hypothesis doit être corporelle : "on dirait que ton corps cherche un appui" — pas mentale.
micro_action OBLIGATOIREMENT corporelle : respiration, posture, contact avec un objet, pieds au sol.
Le guide de respiration est disponible dans l'interface — invite à l'utiliser.
tone_level : "soft".`,

  conscientiser: `Module actif : CONSCIENTISER.
Tu peux formuler 1 SEULE compréhension simple — pas une analyse.
Pas de causalité ("parce que…"). Pas de psychologie. Pas d'histoire.
Ton hypothesis formule une tension simple entre deux choses : ce que la personne veut et ce qu'elle fait.
Ta question reste ancrée dans le présent : "Qu'est-ce qui se joue là, maintenant ?"
tone_level : "moderate".`,

  emerger: `Module actif : ÉMERGER.
INTERDIT : créer du sens. Inventer une émergence. Raconter une transformation.
Tu reprends UNIQUEMENT ce que la personne exprime. Si elle dit que rien n'a bougé, tu valides.
Ton mirror nomme ce qui est là maintenant — pas ce que tu voudrais qu'il y ait.
Si quelque chose a bougé, nomme-le simplement. Si rien n'a bougé, dis-le.
Ta question : "Qu'est-ce qui est là maintenant ?"`,

  aligner: `Module actif : ALIGNER.
UNE seule micro-action. Simple. Immédiate. Faisable dans les 30 secondes.
Pas de transformation de vie. Pas de projection. Un geste.
Format : "Tu peux : …"
micro_action est OBLIGATOIRE.
next_step_suggestion : vide ou 1 phrase très courte sans projection.
pattern_observation : si un fil rouge est visible, le nommer ici.`,
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

  // Longueur max ~120 mots (marge 30% = 160)
  const displayedText = [
    response.mirror,
    response.hypothesis,
    response.insight,
    response.question,
    response.micro_action,
    response.pattern_observation,
  ].filter(Boolean).join(" ");

  const wordCount = displayedText.split(/\s+/).length;
  if (wordCount > 160) {
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
Génère un résumé COURT de cette traversée. Format obligatoire en 3 parties :

1. LE MOUVEMENT — 1 phrase. Ce qui a bougé entre le début et la fin. Utilise les mots de la personne.

2. LA VÉRITÉ — 1 phrase. Ce que la personne a nommé ou touché pendant cette traversée. Ses mots, pas les tiens.

3. LE GESTE — 1 phrase. La micro-action ou l'intention qui a émergé. Simple et concrète.

Règles absolues :
- Pas de narration longue. Pas de prose fluide. 3 phrases, c'est tout.
- Pas d'analyse psychologique. Pas d'explication du pourquoi.
- Pas de "bravo", pas de jugement, pas de chiffres sur la récupération.
- Pas de projection dans le futur.
- Si un écho avec les sessions précédentes est visible, tu peux ajouter 1 phrase supplémentaire pour le nommer — sinon rien.
- Ton calme, sobre, humain. Les mots de la personne.
- L'ensemble fait 3 à 5 phrases maximum.`;

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
