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

- narrative_summary : 1 à 2 phrases MAXIMUM, adressées directement à l'utilisateur en "tu".
  Ce champ doit produire une phrase utile à relire, pas un compte rendu.

  Question centrale :
  "Qu'est-ce que cette traversée peut aider l'utilisateur à reconnaître, choisir ou retrouver la prochaine fois ?"

  Priorité :
  - Une seule idée forte.
  - Une phrase qui aide à se repérer.
  - Une formulation humaine, simple, incarnée.
  - Pas d'effet rapport, pas de fiche d'observation, pas d'énumération.

  Tu peux relier sobrement les éléments présents :
  - émotion explicitement nommée
  - situation décrite
  - besoin formulé
  - action choisie
  - flou reconnu
  - appui concret identifié

  Mais tu ne dois PAS tout répéter.
  Tu choisis l'angle le plus utile de la session.

  Style attendu :
  - phrases courtes
  - vocabulaire concret
  - pas de formulation administrative
  - pas de tournure clinique
  - pas de phrase décorative
  - pas de métaphore vague
  - pas de "l'utilisateur", "la personne", "cette personne", "il/elle"
  - pas de "la session part de"
  - pas de "l'étape de conscientisation"
  - pas de "a débouché sur"
  - pas de "l'action identifiée"
  - pas de "les besoins, les pistes"
  - pas de "le contexte, les besoins, les pistes"
  - pas de "ce que tu peux garder"
  - pas de "le repère ici est clair"
  - pas de "ici" sauf si la phrase devient vraiment plus naturelle avec ce mot
  - ne pas utiliser systématiquement les mots "trace" ou "repère"
  - ne pas commencer systématiquement par "Quand..."
  - varier naturellement la structure des phrases

  Interdits de fond :
  - ne jamais inventer une cause
  - ne jamais inventer un besoin
  - ne jamais inventer une action
  - ne jamais inventer une progression
  - ne jamais dire "tu progresses", "tu avances", "tu apprends à", "tu es en train de"
  - ne jamais donner de conseil
  - ne jamais écrire une phrase de coaching
  - ne jamais diagnostiquer
  - ne jamais interpréter une intention cachée

  Si la matière est complète, faire ressortir le lien utile entre émotion, besoin et action.
  Si la matière est incomplète, reconnaître sobrement ce qui a été nommé sans combler les blancs.
  Si l'action est claire, elle doit porter la phrase.
  Si le besoin est clair, il doit porter la phrase.
  Si tout est flou, le fait d'avoir nommé le flou peut être le point d'appui.

  Exemples autorisés :
  - "La colère signale une limite qui demande à être dite. L'appui choisi : dire ce que tu n'acceptes plus."
  - "Dans cette tristesse, ce qui ressort surtout, c'est le besoin d'être rejoint simplement."
  - "Quand la confusion prend toute la place, l'appui choisi est de laisser passer avant de répondre."
  - "Tu n'avais pas encore de mots précis, mais tu as nommé la solitude. Pour cette traversée, c'était déjà le point d'appui."
  - "Le besoin de ralentir apparaît clairement dans cette surcharge. L'action retenue : ne pas répondre tout de suite."
  - "Cette colère ramène à une limite concrète : dire ce qui n'est plus acceptable."

  Exemples interdits :
  - "La session part d'une tension avec quelqu'un, dans laquelle l'utilisateur nomme de la colère."
  - "L'utilisateur exprime un besoin de limite."
  - "L'étape de conscientisation fait apparaître l'idée de poser une limite."
  - "La tristesse ici est liée à un sentiment de solitude dans la coparentalité."
  - "Ce que tu as nommé comme besoin a débouché sur une action concrète."
  - "La solitude a été nommée, mais le reste est resté flou — le contexte, les besoins, les pistes."
  - "Quand la colère monte dans une tension avec quelqu'un, le repère ici est clair."
  - "Ce que tu peux garder : dire ce que tu n'acceptes plus."
  - "Tu apprends à poser tes limites."
  - "Cette traversée montre que tu progresses."
  - "Un mouvement apparaît."
  - "Tu peux accueillir ce qui est là."
  - "Tu peux te reconnecter à toi."`;

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
