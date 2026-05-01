import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  saveSessionSummary,
  updateMemoryProfile,
  type SessionSummary,
} from "@/lib/memory";

// ===================================================================
// API KEY
// ===================================================================

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquante");
  }
  return new Anthropic({ apiKey });
}

// ===================================================================
// PROMPTS POUR LE RÉSUMÉ DE SESSION
// ===================================================================

const SUMMARY_SYSTEM_PROMPT = `Tu es le module mémoire de TRACÉA.
Tu reçois l'historique complet d'une session TRACÉA (réponses de l'utilisateur à chaque étape et analyses IA correspondantes).

Ton rôle :
- produire une trace claire et utile de la session ;
- mettre de l'ordre dans ce qui a été traversé ;
- rendre la session relisible plus tard sans inventer ce qui n'y est pas ;
- conserver la voix de l'utilisateur quand il s'agit de ses propres mots.

Tu peux reformuler sobrement pour rendre la trace lisible. Tu ne dois jamais inventer un élément qui n'a pas été dit ou choisi par l'utilisateur.

RÈGLES ABSOLUES — toutes ont la même priorité, aucune ne peut être contournée :

1. Tu ne poses JAMAIS d'étiquette identitaire ("cette personne est anxieuse").
2. Tu ne formules JAMAIS de diagnostic, ni de cause certaine.
3. Tu ne formules JAMAIS de promesse de progrès. Tu ne dis jamais que l'utilisateur avance, progresse ou se transforme.
4. Tu n'utilises JAMAIS les formulations suivantes ni leurs équivalents :
   - "Tu es déjà en train de…"
   - "Ça se construit."
   - "Un mouvement se dessine." / "un mouvement vers…"
   - "Tu avances."
   - "Tu progresses."
   - "Un chemin s'ouvre."
   - "Une transformation est en cours."
   - "Tu apprends à…"
   - "Tu es en train de comprendre…"
5. Tu ne juges JAMAIS la situation décrite par l'utilisateur. Sont interdits sauf si l'utilisateur les a explicitement formulés : "injustice", "trahison", "abandon", "humiliation", "blessure".
6. Tu n'emploies JAMAIS de lecture psychologique ou de diagnostic implicite. Sont interdits : "schéma", "anxiété", "dépression", "burnout", ou toute autre catégorie clinique non formulée par l'utilisateur.
7. Tu n'inventes JAMAIS de besoin, d'action, d'émotion ou de vérité intérieure non formulés par l'utilisateur. Si un élément n'apparaît pas, retourne valeur vide ou liste vide.
8. Tu formules tout comme des OBSERVATIONS factuelles : phrases courtes, présent simple, verbes concrets. Pas d'adjectifs émotionnels ajoutés, pas de projection sur l'avenir.

Ton attendu :
- humain, sobre, précis ;
- utile à relire ;
- sans coaching, sans inspirationnel, sans métaphore vague.

Tu dois retourner UNIQUEMENT un objet JSON valide, sans texte avant ni après, sans backticks markdown.`;

const SUMMARY_DEVELOPER_PROMPT = `Analyse l'historique de session ci-dessous et produis un résumé JSON avec cette structure exacte :

{
  "dominant_emotions": ["émotion1", "émotion2"],
  "trigger_context": "description courte du contexte déclencheur exprimé",
  "expressed_needs": ["besoin1", "besoin2"],
  "suggested_actions": ["action1", "action2"],
  "themes": ["thème1", "thème2"],
  "avg_tension_level": 0-10,
  "end_clarity_level": 0-10,
  "regulation_state": "stable" ou "fluctuating" ou "overloaded",
  "inner_truth": "vérité intérieure formulée par l'utilisateur si elle existe, sinon chaîne vide",
  "narrative_summary": "2 phrases maximum — trace utile à retenir"
}

Règles par champ :

- dominant_emotions : reprendre les émotions explicitement nommées par l'utilisateur dans la session (étape Reconnaître ou ailleurs). Maximum 3, en français, en minuscules. Si aucune émotion explicite n'est nommée, retourner [].

- trigger_context : une phrase maximum. Reprendre uniquement le contexte décrit par l'utilisateur (étape Traverser). Ne jamais qualifier ni juger la situation. Ne pas employer "injustice", "trahison", "abandon" ou tout terme analogue.

- expressed_needs : reprendre les besoins exprimés par l'utilisateur. Maximum 3, formulés simplement. Ne jamais inventer un besoin. Si aucun besoin clair n'est formulé, retourner [].

- suggested_actions : reprendre UNIQUEMENT les actions effectivement décrites par l'utilisateur dans les étapes Émerger ou Aligner. Maximum 3. Ne jamais ajouter une action que l'utilisateur n'a pas formulée, même si elle paraît utile. Sont interdits sauf si l'utilisateur les a réellement formulés : "méditer", "respirer", "écrire", "marcher", "appeler quelqu'un", "prendre du recul", "se reposer", "poser une limite". Si aucune action n'est décrite, retourner [].

  Tu peux reformuler grammaticalement l'action pour qu'elle soit affichable directement dans une liste, à la deuxième personne du singulier ("tu...") ou à l'infinitif. Le sens doit rester strictement identique aux mots de l'utilisateur. Privilégier une formulation courte, naturelle, lisible.

  Exemples autorisés (reformulation grammaticale fidèle) :
  - "dire ce que je n'accepte plus" → "dire ce que tu n'acceptes plus"
  - "je peux écrire avant de répondre" → "écrire avant de répondre"
  - "je m'éloigne quelques minutes" → "t'éloigner quelques minutes"
  - "poser une limite" → "poser une limite"
  - "je respire avant d'envoyer le message" → "respirer avant d'envoyer le message"

  Exemples interdits (interprétation, conseil ou coaching) :
  - transformer "dire ce que je n'accepte plus" en "oser poser mes limites"
  - transformer une action en conseil
  - écrire une phrase de coaching
  - reformuler en y ajoutant un sens absent du texte utilisateur

- themes : maximum 3 thèmes descriptifs, mots-clés simples. Catégories autorisées :
  - situation : "travail", "famille", "couple", "argent", "santé"
  - sensation : "tension", "fatigue", "agitation", "lourdeur"
  - besoin formulé : "ralentir", "limite", "espace", "lien"
  - appui formulé : "respiration", "marche", "écriture"
  Interdits : "injustice", "trahison", "abandon", "humiliation", "blessure", "schéma", "anxiété", "dépression", "burnout", ou toute lecture psychologique. Si aucun thème descriptif clair n'apparaît, retourner [].

- avg_tension_level : entier 0-10, estimé depuis la session.

- end_clarity_level : entier 0-10, estimé en fin de session.

- regulation_state : exactement une des trois valeurs : "stable", "fluctuating", "overloaded".

- inner_truth : reprendre STRICTEMENT une phrase réellement formulée par l'utilisateur (typiquement étape Conscientiser ou Aligner). Ne jamais reformuler, ne jamais paraphraser, ne jamais transformer une idée en phrase plus jolie. Si aucune phrase de l'utilisateur ne correspond clairement à une vérité intérieure, retourner chaîne vide.

- narrative_summary : 1 à 2 phrases MAXIMUM, ADRESSÉES DIRECTEMENT À L'UTILISATEUR EN "TU". Cette ligne n'est pas un résumé de la session : c'est une TRACE À RETENIR.

  Question pivot que doit répondre la trace :
  « Qu'est-ce que l'utilisateur peut garder de cette traversée pour mieux se repérer la prochaine fois ? »

  Principes :
  - Ne redis pas tout. Extrais le repère utile à cette session-là.
  - Tu peux relier émotion, besoin et action quand ils sont explicitement présents, mais sans les énumérer mécaniquement.
  - Aide l'utilisateur à se reconnaître sans l'enfermer.
  - Forme simple, directe, mémorisable. Varie la formulation entre les sessions, ne suis pas un format figé.

  Règles de ton (en plus des règles générales) :
  - Adresse directe en "tu". Jamais la 3e personne.
  - Sont interdits : "l'utilisateur", "la personne", "cette personne", "il/elle", "iel".
  - Sont interdites les tournures de rapport : "La session montre que…", "La session part de…", "L'étape de conscientisation…", "L'action retenue…", "L'émotion nommée est…", "La session met en lumière…".
  - Sont interdites les formulations vagues : "quelque chose bouge", "un mouvement apparaît", "un chemin s'ouvre", "tu peux accueillir", "tu peux te reconnecter".
  - Sont interdites les promesses : "tu progresses", "tu avances", "ça se construit", "tu es en train de…", "tu apprends à…".
  - Pas de conclusion forcée positive. Pas de coaching. Pas de conseil ajouté. Pas d'interprétation psychologique.
  - Pas d'invention de cause, de besoin, d'action ou de vérité intérieure absente de la session.
  - PAS de template systématique du type "Dans [situation], [émotion] était là avec [besoin]". Trouve l'angle utile propre à cette session.

  Exemples autorisés (varier la forme) :
  - "Quand la colère monte dans une tension avec quelqu'un, le repère ici est clair : poser une limite. Ce que tu peux garder : dire ce que tu n'acceptes plus."
  - "Cette traversée te laisse un repère simple : la colère signalait un besoin de limite. L'appui concret, ici, c'est dire ce que tu n'acceptes plus."
  - "Dans la surcharge, le repère à garder est le besoin de ralentir. Rien n'a besoin d'être forcé pour que cette trace soit utile."
  - "Quand tout est confus, ton repère ici est de ne pas répondre trop vite. L'appui concret : écrire avant de répondre."
  - "Tu as au moins posé ce qui était là. Cette trace peut servir de point d'appui si la situation revient."

  Exemples interdits :
  - "Dans cette tension avec quelqu'un, la colère était là avec un besoin clair : poser une limite. Le repère à garder : dire ce que tu n'acceptes plus." (template figé, énumération)
  - "Tu as nommé une tension avec quelqu'un. La colère était présente. L'action retenue était de dire ce que tu n'acceptes plus." (énumération plate)
  - "L'émotion nommée est la peur, avec un besoin de relâcher la pression." (formulation rapport)
  - "La session part d'une tension avec quelqu'un, dans laquelle l'utilisateur nomme de la colère."
  - "L'utilisateur exprime un besoin de limite."
  - "L'étape de conscientisation fait apparaître l'idée de poser une limite."
  - "Cette personne semble chercher à…"
  - "Tu es déjà en train de te reconnecter à toi."
  - "Ça se construit."
  - "Un mouvement apparaît."
  - "Cette traversée montre que tu progresses."
  - "Tu apprends à t'écouter."
  - "Tu peux accueillir ce qui est là."
  - "Tu peux te reconnecter à toi."
  - "Cela révèle un schéma." (interprétation)
  - "C'est une blessure qui se rejoue." (interprétation)
  - "Tu dois apprendre à poser tes limites." (conseil)
  - "Tu peux maintenant avancer avec plus de confiance." (promesse)`;

// ===================================================================
// STEP_ORDER pour construire l'historique
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
// PARSING
// ===================================================================

interface SummaryData {
  dominant_emotions: string[];
  trigger_context: string;
  expressed_needs: string[];
  suggested_actions: string[];
  themes: string[];
  avg_tension_level: number;
  end_clarity_level: number;
  regulation_state: string;
  inner_truth: string;
  narrative_summary: string;
}

function parseSummaryJson(rawText: string): SummaryData | null {
  try {
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
    return parsed as SummaryData;
  } catch {
    return null;
  }
}

function ensureSummaryFields(data: SummaryData): SummaryData {
  return {
    dominant_emotions: Array.isArray(data.dominant_emotions) ? data.dominant_emotions.slice(0, 3) : [],
    trigger_context: typeof data.trigger_context === "string" ? data.trigger_context : "",
    expressed_needs: Array.isArray(data.expressed_needs) ? data.expressed_needs.slice(0, 3) : [],
    suggested_actions: Array.isArray(data.suggested_actions) ? data.suggested_actions.slice(0, 3) : [],
    themes: Array.isArray(data.themes) ? data.themes.slice(0, 3) : [],
    avg_tension_level: typeof data.avg_tension_level === "number" ? Math.min(10, Math.max(0, data.avg_tension_level)) : 5,
    end_clarity_level: typeof data.end_clarity_level === "number" ? Math.min(10, Math.max(0, data.end_clarity_level)) : 5,
    regulation_state: ["stable", "fluctuating", "overloaded"].includes(data.regulation_state) ? data.regulation_state : "stable",
    inner_truth: typeof data.inner_truth === "string" ? data.inner_truth : "",
    narrative_summary: typeof data.narrative_summary === "string" ? data.narrative_summary : "",
  };
}

// ===================================================================
// AI LIMIT — mirrors the check in /api/tracea/route.ts
// ===================================================================

async function checkAiLimit(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // TODO: replace with Stripe subscription check when payment is integrated
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_subscribed, is_beta_tester")
      .eq("id", userId)
      .single();
    if (profile?.is_subscribed === true || profile?.is_beta_tester === true) return false; // subscribed or beta → unlimited

    const { count } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);

    return (count ?? 0) >= 1;
  } catch {
    return false;
  }
}

// ===================================================================
// ROUTE POST
// ===================================================================

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // --- Authentification : vérifier le token JWT ---
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user: authUser }, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const userId = authUser.id;

    const body = await request.json();
    const {
      sessionId,
      steps,
      context,
      hadDoNotStore,
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId requis" },
        { status: 400 }
      );
    }

    // Skip AI summarization for free users past the first session
    const aiLimited = await checkAiLimit(userId);
    if (aiLimited) {
      console.log("[TRACEA SUMMARIZE] AI limited for user:", userId.slice(0, 8));
      return NextResponse.json({ success: true, ai_limited: true });
    }

    console.log("[TRACEA SUMMARIZE] Generating summary for session:", sessionId);

    // Construire l'historique de la session
    let sessionHistory = `Contexte de la traversée : ${context}\n\n`;
    sessionHistory += `Étapes de la session :\n`;

    for (const sid of STEP_ORDER) {
      if (steps[sid] && steps[sid].trim()) {
        sessionHistory += `\n${STEP_LABELS[sid] || sid} :\n"${steps[sid]}"\n`;
      }
    }

    // Appeler Claude pour générer le résumé
    const message = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      temperature: 0.3,
      system: SUMMARY_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: SUMMARY_DEVELOPER_PROMPT + "\n\nHistorique de la session :\n" + sessionHistory,
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    console.log("[TRACEA SUMMARIZE] Raw response length:", rawText.length);

    // Parser le JSON
    let summaryData = parseSummaryJson(rawText);

    if (!summaryData) {
      console.warn("[TRACEA SUMMARIZE] Failed to parse summary JSON, using defaults");
      summaryData = {
        dominant_emotions: [],
        trigger_context: "",
        expressed_needs: [],
        suggested_actions: [],
        themes: [],
        avg_tension_level: 5,
        end_clarity_level: 5,
        regulation_state: "stable",
        inner_truth: "",
        narrative_summary: "",
      };
    }

    // Normaliser les champs
    summaryData = ensureSummaryFields(summaryData);

    // Sauvegarder dans session_summaries
    const excludedFromMemory = hadDoNotStore === true;

    await saveSessionSummary(userId, sessionId, summaryData, excludedFromMemory);

    console.log(
      "[TRACEA SUMMARIZE] Summary saved. excluded_from_memory:",
      excludedFromMemory
    );

    // Mettre à jour le profil mémoire
    await updateMemoryProfile(userId);

    console.log("[TRACEA SUMMARIZE] Memory profile updated.");

    return NextResponse.json({
      success: true,
      summary: summaryData,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : "";
    console.error("[TRACEA SUMMARIZE] Error:", errMsg);
    console.error("[TRACEA SUMMARIZE] Stack:", errStack);

    // Retourner success: false au lieu d'un 500
    // pour que le client ne reste pas bloqué
    return NextResponse.json({
      success: false,
      error: errMsg,
    });
  }
}
