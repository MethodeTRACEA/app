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

- narrative_summary : 1 à 2 phrases MAXIMUM, adressées directement à l'utilisateur en "tu" quand c'est naturel.
  Ce champ N'EST PAS un résumé. C'est une PHRASE-MÉMOIRE utile à relire dans plusieurs semaines.

  Question pivot :
  "Quand l'utilisateur relira cette trace dans plusieurs semaines, qu'est-ce qui sera utile à retrouver en une phrase ?"
  Le repère doit l'aider à : reconnaître quelque chose, choisir, refaire, ne pas forcer, ou retrouver quel flou avait été nommé.

  HIÉRARCHIE DE DÉCISION (obligatoire — applique dans cet ordre) :
  1. Si une action concrète est formulée par l'utilisateur, la phrase doit montrer où cette action peut servir, ou ce qu'elle permet de poser. L'action ne doit JAMAIS être affichée comme un simple libellé commenté. Elle doit être replacée dans un usage concret, sans inventer de contexte absent.
     (ex de matière utilisateur : "dire ce que tu n'acceptes plus", "ne pas répondre tout de suite", "écrire avant de répondre")
  2. Sinon, si un besoin clair est formulé, le besoin porte la phrase.
     (ex : besoin de ralentir, besoin d'être compris, besoin de poser une limite)
  3. Sinon, si une émotion claire est formulée, elle devient un signal à reconnaître.
     ATTENTION : ne dis JAMAIS qu'une émotion "signale une limite" (ou autre concept) sauf si ce concept est explicitement présent dans les mots de l'utilisateur.
  4. Sinon (matière pauvre ou floue), la trace reconnaît le flou nommé sans combler.
     (ex : "Tu n'avais pas encore les mots, mais tu as nommé que c'était flou.")

  SYNTAXE D'USAGE > SYNTAXE DE LIBELLÉ (règle structurelle prioritaire) :
  Évite la syntaxe de libellé, qui sonne comme un compte rendu :
  - "[action] : c'est ce que…"
  - "[action] : c'est ce qui…"
  - "c'est ce que tu peux faire…"
  - "tu sais ce que tu peux dire : …"
  - "l'action retenue…"
  - "l'appui choisi…"
  - "ce que tu as nommé…"
  - "ce que tu as posé…"

  Préfère une syntaxe d'usage :
  - l'action replacée dans une situation de retour (ex : "quand cette tension revient, …" — sans en faire un template fixe),
  - l'action présentée comme un geste concret porté par la phrase elle-même,
  - le besoin formulé comme un repère, pas comme un libellé commenté,
  - le flou reconnu sans le combler quand la matière est pauvre.

  Style attendu :
  - 1 à 2 phrases max, sobres, humaines, utiles.
  - Une seule idée forte.
  - Pas d'énumération situation + émotion + besoin + action.
  - Pas de structure mécanique avec deux-points systématiques.
  - Pas de début systématique en "Quand…". Varie les formulations : préfère parfois une phrase directe (ex : "La colère pointe ici une limite à dire.").
  - VARIE LA FORME des phrases d'une session à l'autre. Ne produis pas toujours le pattern "Quand X, le geste/appui/pas est Y." Privilégie aussi : l'action placée en début de phrase ; une phrase directe ; une formulation proche des mots utilisateur ; une phrase sans "appui", "repère", "geste" ou "trace utile" quand ce n'est pas nécessaire.
  - Pas d'usage automatique des mots "trace" ou "repère".
  - Ne répète pas tout ce que l'utilisateur a dit. Choisis UNE idée forte.

  Cas particuliers :
  - Actions hésitantes : si l'action contient "peut-être", "je ne sais pas", "à voir", "je pourrais", ou une hésitation équivalente, NE LA TRANSFORME PAS en action ferme. Traite la session comme partiellement floue (niveau 4 de la hiérarchie). N'amplifie jamais une action fragile.
  - Sessions banales ou simples : si la matière est simple ("mal dormi → bain"), ne produis pas un compte rendu. Extrais un petit repère concret sans surinterpréter, sans inventer de symbolique ni de cause.
    (ex pour "prendre un bain, se coucher tôt" : "Bain le soir, coucher tôt : le soin minimum quand le corps lâche.")

  Formulations INTERDITES dans la sortie (elles produisent un compte rendu, pas une trace) :
  - "L'action retenue :"
  - "L'appui choisi :"
  - "L'appui concret est :"
  - "L'appui simple est :"
  - "Le geste utile est nommé :"
  - "Le pas concret reste simple :"
  - "Pour cette [émotion], …" (en début de phrase systématique)
  - "La session part de"
  - "L'utilisateur exprime"
  - "L'émotion nommée est"
  - "Ce qui en est sorti :"
  - "Ce qui reste :"
  - "Le repère ici est clair"
  - "Ce que tu peux garder"
  - "Tu progresses", "tu apprends à", "tu es en train de"
  - "Tu peux te reconnecter à toi"
  - "Tu sais au fond de toi"
  - "Le flou cache…"
  - "est déjà nommé" / "le geste est déjà nommé" (formule mécanique)
  - "ce que tu as retenu" / "pour la prochaine fois" si la phrase sonne comme un bilan scolaire
  - usage répétitif de "Quand [émotion] revient…" comme template
  - "ce que tu as nommé" (formule méta — sauf cas pauvre/flou, cf. règle dédiée)
  - "tu as nommé …" (formule méta — sauf cas pauvre/flou, cf. règle dédiée)
  - "tu l'as posé" / "ce que tu as posé" (formule méta — sauf cas pauvre/flou, cf. règle dédiée)
  - "origine clairement identifiée", "sans origine", "cause clairement identifiée" (vocabulaire froid de rapport)
  - "ce qui s'est passé" quand la phrase sonne comme un résumé
  - "face à cette tension" quand utilisé comme formule générique de résumé
  - "c'est ce que tu peux faire …"
  - "tu sais ce que tu peux dire …"
  - "l'action retenue"
  - "l'appui choisi"
  - "le geste utile est nommé"
  - "le pas concret reste simple"
  - "ce qui en est sorti"
  - "ce qui reste"
  - "ce que tu peux garder"
  - "Le besoin formulé est …"
  - "L'action envisagée est …"
  - "La session met en lumière …"
  - "dans un contexte relationnel / familial / professionnel" si ce contexte n'est pas explicitement écrit par l'utilisateur
  - "laisse souvent plus que …" (généralisation)
  - "peut aider à …" (conseil déguisé)
  - "ce que ça a réveillé" (psychologisation, sauf si écrit par l'utilisateur)
  - "démêler ce qui appartient …" (vocabulaire thérapeutique)
  - "démêler …" (vocabulaire thérapeutique, même hors de la phrase complète)
  - "ce qui appartient …" (vocabulaire thérapeutique, même hors de la phrase complète)
  - "rend difficile à voir" / "rend X difficile à voir" (interprétation ajoutée)

  Règles de style supplémentaires (ton non-méta, non-clinique, non-constat) :
  - Les formulations "tu as nommé" / "tu as posé" / "ce que tu as nommé" / "ce que tu as posé" sont autorisées UNIQUEMENT dans les cas pauvres, flous ou incomplets, quand le fait d'avoir nommé quelque chose est réellement le repère utile (niveau 4 de la hiérarchie). Dans une session complète où il existe une action, un besoin ou une émotion claire, NE COMMENTE PAS le fait que l'utilisateur a nommé quelque chose : transforme la matière en repère utilisable directement.
  - N'utilise JAMAIS un vocabulaire d'analyse froide ou clinique ("origine", "cause", "identifié", "identifiée", "clairement identifié", "clairement identifiée") sauf si l'utilisateur a lui-même employé ces mots. Préfère des formulations vivantes, proches de l'expérience ("les mots n'étaient pas encore là", "c'était flou", "tu cherches encore").
  - Quand une action concrète est formulée par l'utilisateur, la phrase doit aider à retrouver cette action comme appui concret directement utilisable, sans dire "ce que tu as nommé", "l'action retenue", "l'appui choisi" ou équivalent. L'action doit apparaître en contexte d'usage, pas comme un libellé commenté.

  Garde-fous à conserver :
  - Ne jamais inventer une cause, un besoin, une action, ou une vérité intérieure absente des mots utilisateur.
  - Ne jamais ajouter un conseil.
  - Ne jamais transformer une émotion en diagnostic.
  - Ne jamais promettre une progression.
  - Ne jamais psychologiser.
  - Ne jamais écrire comme un thérapeute.
  - Si un mot-clé ("limite", "ralentir", "répondre", "dire", "écrire", "solitude", "honte"…) n'est pas présent dans les données utilisateur, NE PAS l'introduire.
  - Ne JAMAIS transformer une action simple en une action différente, plus précise, ou plus jolie. Si l'action est vague, la garder vague et sobre. Exemples : "me rapprocher de quelqu'un" ne devient PAS "dire que tu aimerais ne pas rester seul(e)" ; "exprimer ce que j'ai ressenti" ne devient PAS "écrire ce que tu aurais voulu dire" — sauf si ces idées exactes sont explicitement formulées par l'utilisateur.
  - Si la matière est pauvre, rester pauvre mais utile.

  Exemples positifs (formes variées, jamais comme template fixe — varient en début de phrase, en présence/absence de deux-points, et sans usage automatique de "appui", "repère", "trace", "geste") :
  - "Dire ce qui n'est plus acceptable devient le geste concret quand cette tension revient."
  - "Cette colère ramène à une limite simple : quelque chose ne peut plus rester comme avant."
  - "Écrire avant de répondre peut t'aider à ne pas laisser la confusion décider trop vite."
  - "Quand la solitude pèse, te rapprocher de quelqu'un reste l'action la plus simple."
  - "La tristesse indique surtout un besoin d'être entendu sans devoir te justifier."
  - "Prendre du recul avant de répondre, c'est ce qui protège la suite quand la confusion monte."
  - "Tu n'avais pas encore tous les mots. La seule chose claire, ici, c'était la solitude."
  - "Si tout reste flou, ne pas forcer une réponse est déjà une manière de rester avec ce qui est là."
  - "Tu n'as pas encore les mots pour ce qui se passe. Et tu l'as posé. C'est suffisant pour l'instant."
  - "Bain le soir, coucher tôt : le soin minimum quand le corps lâche."

  Attention : ces exemples montrent la FORME attendue. Ils n'autorisent jamais l'invention. Si "limite", "être entendu", "prendre du recul", "solitude", "répondre", "dire", "écrire" ne sont pas présents dans les données utilisateur, NE PAS LES INTRODUIRE.

  Exemples interdits (à ne jamais produire) :
  - "Quand cette colère revient, le geste utile est nommé : …" (template mécanique)
  - "Pour cette tristesse, l'appui concret est : …" (template mécanique)
  - "Le pas concret reste simple : …" (template mécanique)
  - "L'action retenue : …" (compte rendu)
  - "Ce qui en est sorti : …" (compte rendu)
  - "La colère est apparue dans une tension avec quelqu'un. L'action retenue : dire ce que tu n'acceptes plus." (formule procès-verbal)
  - "L'émotion nommée est la peur, avec un besoin de relâcher la pression." (compte rendu)
  - "La session part d'une tension avec quelqu'un, dans laquelle l'utilisateur nomme de la colère."
  - "L'utilisateur exprime un besoin de limite."
  - "L'étape de conscientisation fait apparaître l'idée de poser une limite."
  - "Ce que tu peux garder : dire ce que tu n'acceptes plus."
  - "Tu apprends à poser tes limites."
  - "Cette traversée montre que tu progresses."
  - "Tu peux te reconnecter à toi."
  - "Tu sais au fond de toi ce qui se passe."
  - "Le flou cache un besoin de sécurité."
  - "Ce que tu as retenu pour la prochaine fois : …" (bilan scolaire)
  - Transformer "me rapprocher de quelqu'un" en "dire que tu aimerais ne pas rester seul(e)" si cette phrase n'a pas été formulée (reformulation trop libre).

  Origine de l'action (lue dans la section "Métadonnées utiles" de l'historique) :
  - Si l'action vient d'une suggestion sélectionnée dans l'interface, ne la traite pas comme une phrase personnelle profonde de l'utilisateur. Elle indique une direction choisie, pas forcément les mots exacts de l'utilisateur.
  - Si l'action vient d'un texte libre, tu peux davantage t'appuyer sur ses mots exacts.
  - Dans tous les cas, ne transforme jamais l'action en une formulation plus intime, plus précise ou plus psychologique que ce qui est présent.

  Richesse contextuelle :
  - Quand le texte de Traverser contient un contexte explicite, tu dois t'en servir pour produire une vraie synthèse utile.
  - Ne reste pas au niveau générique ("une tension avec quelqu'un", "quelque chose m'a blessé", "une situation m'a dépassé") si l'utilisateur a écrit un contexte plus précis.
  - Tu peux nommer sobrement le contexte UNIQUEMENT s'il est explicitement écrit par l'utilisateur : famille, coparentalité, père des enfants, mère, collègue, travail, couple, amitié, solitude, surcharge, conflit, sécurité des enfants, etc.
  - Le rôle de narrative_summary n'est pas de faire un résumé administratif. C'est de relier en une phrase humaine : ce qui s'est passé + ce que l'émotion signale + le besoin ou l'action utile.
  - Le contexte doit enrichir la phrase, pas devenir un diagnostic.
  - Ne jamais inventer un contexte absent.
  - Ne jamais déduire une cause psychologique.
  - Ne jamais transformer une situation en étiquette identitaire.
  - Si le contexte précis est écrit, l'utiliser. Si le contexte est vague, rester vague.

  Exemples (à lire avec la règle de Richesse contextuelle) :
  - Mauvais : "La session part d'une colère nommée dans un contexte familial, liée au comportement du père des enfants."
  - Bon : "Cette colère touche la coparentalité et la sécurité des enfants. La limite à garder en vue : dire ce qui n'est plus acceptable."
  - Bon : "Dans cette tension avec le père de tes enfants, la colère ramène à une limite concrète : dire ce qui n'est plus acceptable."
  - Bon : "Ce qui pèse ici, ce n'est pas seulement la colère : c'est la coparentalité quand elle laisse les enfants en insécurité."
  - Bon : "Dans cette situation au travail, écrire avant de répondre peut t'aider à sortir de la confusion sans réagir trop vite."
  - Bon : "Quand la solitude apparaît après ce conflit, le besoin de lien est déjà nommé : te rapprocher de quelqu'un."

  Note importante : ces exemples ne lèvent aucun garde-fou existant. Pas de promesse de progrès, pas de conseil nouveau, pas de diagnostic, pas de mots inventés ("avance", "progresse", "apprend", "guérit", "se reconnecte" restent interdits). Les mots de contexte (famille, coparentalité, travail, conflit, etc.) doivent être présents dans la matière utilisateur — sinon NE PAS les introduire.

  Anti-généralisation / anti-conseil :
  - Ne jamais formuler une vérité générale à partir d'une situation singulière.
  - Éviter les formulations du type : "laisse souvent plus que…", "peut aider à…", "ce que ça a réveillé", "démêler ce qui appartient à…", sauf si ces mots ont été écrits explicitement par l'utilisateur.
  - narrative_summary ne donne pas de conseil, ne propose pas d'exercice, ne suggère pas une lecture psychologique.
  - La phrase doit rester une trace : contexte explicite + émotion/besoin/action choisi(e), sans ajouter de couche cachée.

  Anti-conseil / anti-thérapeutique :
  - narrative_summary ne doit JAMAIS expliquer ce qu'une action pourrait aider à comprendre, ressentir ou démêler.
  - Ne pas utiliser de formulations du type : "peut aider à…", "démêler…", "ce que ça a réveillé", "ce qui appartient…", "rend difficile à voir", "laisse souvent plus que…". Cette interdiction est stricte, même en variante (ex : "démêler ce que la confusion rend difficile à voir" reste interdit).
  - Ne pas transformer l'action choisie en conseil thérapeutique.
  - Reprendre l'action comme un repère choisi par l'utilisateur, pas comme une méthode pour analyser ou comprendre.
  - La phrase doit rester une trace : contexte explicite + émotion/besoin/action choisi(e), sans promesse d'effet.

  Exemples (à lire avec la règle Anti-conseil / anti-thérapeutique) :
  - Mauvais : "Écrire la situation depuis l'extérieur peut aider à démêler ce que la confusion rend difficile à voir."
  - Bon : "Dans cette confusion, le repère choisi est simple : écrire la situation depuis l'extérieur."

  - Mauvais : "Écrire ce que ça a réveillé peut aider à démêler ce qui appartient à cette décision."
  - Bon : "Dans cette décision liée au travail, la tristesse est là. Le repère choisi : écrire ce qui a été ressenti, sans devoir tout comprendre maintenant."

  Note : ces exemples ne lèvent aucun garde-fou (pas de promesse de progrès, pas de diagnostic, pas de mots inventés, pas de retour au style rapport "La session montre…", "Le besoin formulé est…", "L'action envisagée est…").

  Test final avant de produire narrative_summary :
  - Est-ce que cette phrase pourrait aider l'utilisateur à se repérer plus tard ?
  - Ou est-ce qu'elle ressemble à un compte rendu de ce qu'il a fait dans la session ?
  Si elle ressemble à un compte rendu, recommencer en plaçant l'action, le besoin ou l'émotion dans un usage concret.
  Si la matière est trop pauvre, rester simple et ne pas combler.`;

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
// AI USAGE LOGGING — mirrors logAiUsage in /api/tracea/route.ts
// ===================================================================

// Tarifs Claude Sonnet (claude-sonnet-4-6) — mai 2025
const COST_PER_INPUT_TOKEN = 3.0 / 1_000_000;
const COST_PER_OUTPUT_TOKEN = 15.0 / 1_000_000;
const COST_PER_CACHE_WRITE_TOKEN = 3.75 / 1_000_000;
const COST_PER_CACHE_READ_TOKEN = 0.30 / 1_000_000;

function getSupabaseServiceForLogs() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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

  try {
    const supabase = getSupabaseServiceForLogs();
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
    console.error("[AI LOG ERROR] Exception:", err);
  }
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
      actionSource,
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

    // Métadonnées utiles
    const actionSourceLabel =
      actionSource === "suggestion"
        ? "suggestion sélectionnée dans l'interface"
        : actionSource === "free_text"
        ? "phrase écrite librement par l'utilisateur"
        : "inconnue";
    sessionHistory += `\nOrigine de l'action :\n- ${actionSourceLabel}\n`;

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

    // Logger l'usage IA (fire-and-forget — ne bloque pas la suite)
    const summarizeUsage = message.usage as unknown as Record<string, number>;
    logAiUsage({
      userId,
      callType: "summarize",
      model: "claude-sonnet-4-6",
      inputTokens: summarizeUsage.input_tokens,
      outputTokens: summarizeUsage.output_tokens,
      cacheCreationTokens: summarizeUsage.cache_creation_input_tokens || 0,
      cacheReadTokens: summarizeUsage.cache_read_input_tokens || 0,
    }).catch(() => {});

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
