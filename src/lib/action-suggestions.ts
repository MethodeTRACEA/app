// ════════════════════════════════════════════════════════════
// TRACÉA — Suggestions d'action de l'étape Aligner (flow long) — SOURCE UNIQUE
// ════════════════════════════════════════════════════════════
// Extrait de src/app/app/session/page.tsx au chantier 35-B / B-2 pour partager
// la LISTE CURÉE avec la carte « Le retour du geste ». Règle de sécurité :
// seul un geste issu de ce set (action_source = "suggestion") peut être
// ré-affiché verbatim dans la carte. Un geste en TEXTE LIBRE n'est jamais
// ré-affiché sans le softening « crise dans le miroir » (chantier 39).
// Ne pas dupliquer ces libellés ailleurs : importer depuis ce fichier.

// ── Suggestions d'action par besoin (flow long uniquement) ─────
// Interdit : gestes du flow court (respirer, boire, pause, ancrer…)
// Autorisé : clarification, communication, introspection, ajustement relationnel

export type ActionItem = { text: string; kind: "write" | "world" };
export type ActionEntry = { default: ActionItem[]; [emotion: string]: ActionItem[] };

export const ACTION_SUGGESTIONS: Record<string, ActionEntry> = {
  "qu'on me comprenne": {
    default: [
      { text: "écrire la première phrase que je pourrais dire", kind: "write" },
      { text: "écrire ce que j'aurais voulu dire", kind: "write" },
      { text: "choisir à qui en parler", kind: "world" },
    ],
    "solitude": [
      { text: "envoyer un message simple à quelqu'un", kind: "world" },
      { text: "choisir une personne à qui parler", kind: "world" },
      { text: "écrire ce que j'aurais besoin qu'on entende", kind: "write" },
    ],
    "tristesse": [
      { text: "choisir à qui en parler", kind: "world" },
      { text: "écrire ce que j'aurais aimé entendre", kind: "write" },
      { text: "demander une présence simple", kind: "world" },
    ],
  },
  "poser une limite": {
    default: [
      { text: "dire ce que je n'accepte plus", kind: "world" },
      { text: "écrire ma limite avant de la dire", kind: "write" },
      { text: "décider ce que je vais dire et quand", kind: "world" },
    ],
    "colère": [
      { text: "dire ce que je n'accepte plus", kind: "world" },
      { text: "dire ce que je ne veux plus", kind: "world" },
      { text: "écrire ma limite avant de la poser", kind: "write" },
    ],
    "peur": [
      { text: "choisir la limite la plus simple à poser", kind: "world" },
      { text: "écrire ce que je peux dire sans me justifier", kind: "write" },
      { text: "attendre un moment plus calme avant d'en parler", kind: "world" },
    ],
  },
  "y voir plus clair": {
    default: [
      { text: "me demander ce que je dirais à un proche dans la même situation", kind: "world" },
      { text: "écrire les deux côtés de la situation", kind: "write" },
      { text: "mettre au clair ce que je veux vraiment", kind: "world" },
    ],
    "confusion": [
      { text: "me demander ce que je dirais à quelqu'un d'autre dans cette situation", kind: "world" },
      { text: "écrire les deux côtés de la situation", kind: "write" },
      { text: "noter ce qui est clair et ce qui ne l'est pas", kind: "write" },
    ],
    "peur": [
      { text: "noter ce que je sais et ce que j'ignore encore", kind: "write" },
      { text: "écrire ce qui dépend de moi", kind: "write" },
      { text: "attendre avant de conclure", kind: "world" },
    ],
  },
  "mettre des mots dessus": {
    default: [
      { text: "trouver le mot le plus juste pour ce que je ressens", kind: "world" },
      { text: "écrire les premiers mots qui me viennent", kind: "write" },
      { text: "dire ce que j'ai gardé pour moi", kind: "world" },
    ],
    "colère": [
      { text: "mettre un mot juste sur ce que je ressens", kind: "world" },
      { text: "écrire ce qui m'a touché avant d'en parler", kind: "write" },
      { text: "poser les mots avant de parler", kind: "world" },
    ],
    "honte": [
      { text: "écrire ça juste pour moi", kind: "write" },
      { text: "noter ce que je ressens, simplement", kind: "write" },
      { text: "garder ça pour moi le temps d'y voir clair", kind: "world" },
    ],
  },
  "me rapprocher de quelqu'un": {
    default: [
      { text: "envoyer un message simple", kind: "world" },
      { text: "choisir le bon moment pour en parler", kind: "world" },
      { text: "écrire ce que j'ai envie de partager", kind: "write" },
    ],
    "solitude": [
      { text: "envoyer un message simple", kind: "world" },
      { text: "proposer un moment sans trop expliquer", kind: "world" },
      { text: "dire que j'aimerais ne pas être seul avec ça", kind: "world" },
    ],
  },
  "juste poser ça": {
    default: [
      { text: "laisser ça là pour aujourd'hui", kind: "world" },
      { text: "ne rien faire de plus maintenant", kind: "world" },
      { text: "y revenir plus tard si besoin", kind: "world" },
    ],
    "épuisement": [
      { text: "laisser ça là pour aujourd'hui", kind: "world" },
      { text: "me reposer un moment", kind: "world" },
      { text: "y revenir quand j'aurai un peu d'énergie", kind: "world" },
    ],
    "tristesse": [
      { text: "laisser ça là un moment", kind: "world" },
      { text: "écrire juste ce qui est là", kind: "write" },
      { text: "y revenir une autre fois", kind: "world" },
    ],
  },
  "qu'on me soutienne": {
    default: [
      { text: "demander une chose précise à une personne", kind: "world" },
      { text: "dire de quel soutien j'ai besoin : qu'on m'écoute, qu'on m'aide, ou juste qu'on soit là", kind: "world" },
      { text: "choisir une personne à qui je peux demander", kind: "world" },
    ],
    "solitude": [
      { text: "envoyer un message à une personne de confiance", kind: "world" },
      { text: "demander juste une présence", kind: "world" },
      { text: "dire à quelqu'un que j'aurais besoin d'un coup de main", kind: "world" },
    ],
    "épuisement": [
      { text: "demander de l'aide pour une seule chose, la plus lourde", kind: "world" },
      { text: "accepter qu'on m'aide, même un peu", kind: "world" },
      { text: "dire à quelqu'un ce qui pèse le plus", kind: "world" },
    ],
    "tristesse": [
      { text: "demander une présence, sans avoir à expliquer", kind: "world" },
      { text: "dire à quelqu'un que ça ne va pas", kind: "world" },
      { text: "choisir une personne douce à qui parler", kind: "world" },
    ],
  },
  "me sentir en sécurité": {
    default: [
      { text: "nommer 5 choses que je vois autour de moi", kind: "world" },
      { text: "sentir mes pieds au sol, le contact du siège", kind: "world" },
      { text: "poser une main sur quelque chose de stable", kind: "world" },
    ],
    "peur": [
      { text: "nommer 3 choses que j'entends maintenant", kind: "world" },
      { text: "sentir mes appuis : pieds, dos, mains", kind: "world" },
      { text: "regarder un point fixe et le décrire", kind: "world" },
    ],
  },
};

export const ACTION_FALLBACK: ActionItem[] = [
  { text: "écrire ce qui compte pour moi", kind: "write" },
  { text: "laisser passer avant de répondre", kind: "world" },
  { text: "écrire ce que je veux garder en tête", kind: "write" },
];

export function getActionSuggestions(besoin: string, emotion?: string): ActionItem[] {
  const entry = ACTION_SUGGESTIONS[besoin];
  if (!entry) return ACTION_FALLBACK;
  if (emotion && entry[emotion]) return entry[emotion];
  return entry.default;
}

// Ensemble plat de TOUS les libellés curés (suggestions contextuelles + fallback).
// Dérivé des données ci-dessus : aucune duplication, aucun risque de dérive.
// Sert de filtre « geste curé vs texte libre » pour B-2 : un action_alignee
// présent dans cet ensemble est un geste curé, ré-affichable verbatim.
// Concordance vérifiée à 100 % avec action_traces.action_source sur données
// réelles (2026-07-08 : 0 désaccord).
export const CURATED_ACTION_TEXTS: ReadonlySet<string> = new Set<string>([
  ...Object.values(ACTION_SUGGESTIONS).flatMap((entry) =>
    Object.values(entry).flatMap((items) => items.map((i) => i.text))
  ),
  ...ACTION_FALLBACK.map((i) => i.text),
]);

// ════════════════════════════════════════════════════════════
// P2 backlog — harmonisation voix « Tes gestes » (chantier 35-B, noté
// cosmétique, jamais traité). Les libellés ci-dessus sont volontairement en
// "je" (choix fait par la personne, verbatim pendant la session). Dans
// "Tes gestes" (relecture, espace/page.tsx), on relit à la 2e personne pour
// la même raison que le reflet ("tu") — jamais dans l'écran de session
// lui-même, jamais dans la carte "Le retour du geste" (GesteRetourCard,
// wordings figés B-0, hors périmètre).
//
// Table STATIQUE écrite et relue à la main (Alyson, 2026-07-11), pas dérivée
// par transformation automatique : un simple remplacement de pronom casse la
// conjugaison sur les verbes en -er ("j'accepte" → "tu acceptes", pas "tu
// accepte") et sur avoir/aller ("j'ai" → "tu as", "je vais" → "tu vas",
// "j'aurai" → "tu auras"). N'inclut QUE les 37 libellés dont la voix change
// réellement — les 30 autres (aucun pronom je/moi/me/ma/mes) sont absents
// exprès : le repli `ACTION_TEXTS_TU.get(x) ?? x` au point d'appel renvoie
// alors le texte tel quel, déjà neutre en personne. Vérifié : union des deux
// ensembles = CURATED_ACTION_TEXTS (67 libellés) à 100 %.
export const ACTION_TEXTS_TU: ReadonlyMap<string, string> = new Map<string, string>([
  ["écrire la première phrase que je pourrais dire", "écrire la première phrase que tu pourrais dire"],
  ["écrire ce que j'aurais voulu dire", "écrire ce que tu aurais voulu dire"],
  ["écrire ce que j'aurais besoin qu'on entende", "écrire ce que tu aurais besoin qu'on entende"],
  ["écrire ce que j'aurais aimé entendre", "écrire ce que tu aurais aimé entendre"],
  ["dire ce que je n'accepte plus", "dire ce que tu n'acceptes plus"],
  ["écrire ma limite avant de la dire", "écrire ta limite avant de la dire"],
  ["décider ce que je vais dire et quand", "décider ce que tu vas dire et quand"],
  ["dire ce que je ne veux plus", "dire ce que tu ne veux plus"],
  ["écrire ma limite avant de la poser", "écrire ta limite avant de la poser"],
  ["écrire ce que je peux dire sans me justifier", "écrire ce que tu peux dire sans te justifier"],
  ["me demander ce que je dirais à un proche dans la même situation", "te demander ce que tu dirais à un proche dans la même situation"],
  ["mettre au clair ce que je veux vraiment", "mettre au clair ce que tu veux vraiment"],
  ["me demander ce que je dirais à quelqu'un d'autre dans cette situation", "te demander ce que tu dirais à quelqu'un d'autre dans cette situation"],
  ["noter ce que je sais et ce que j'ignore encore", "noter ce que tu sais et ce que tu ignores encore"],
  ["écrire ce qui dépend de moi", "écrire ce qui dépend de toi"],
  ["trouver le mot le plus juste pour ce que je ressens", "trouver le mot le plus juste pour ce que tu ressens"],
  ["écrire les premiers mots qui me viennent", "écrire les premiers mots qui te viennent"],
  ["dire ce que j'ai gardé pour moi", "dire ce que tu as gardé pour toi"],
  ["mettre un mot juste sur ce que je ressens", "mettre un mot juste sur ce que tu ressens"],
  ["écrire ce qui m'a touché avant d'en parler", "écrire ce qui t'a touché avant d'en parler"],
  ["écrire ça juste pour moi", "écrire ça juste pour toi"],
  ["noter ce que je ressens, simplement", "noter ce que tu ressens, simplement"],
  ["garder ça pour moi le temps d'y voir clair", "garder ça pour toi le temps d'y voir clair"],
  ["écrire ce que j'ai envie de partager", "écrire ce que tu as envie de partager"],
  ["dire que j'aimerais ne pas être seul avec ça", "dire que tu aimerais ne pas être seul avec ça"],
  ["me reposer un moment", "te reposer un moment"],
  ["y revenir quand j'aurai un peu d'énergie", "y revenir quand tu auras un peu d'énergie"],
  ["dire de quel soutien j'ai besoin : qu'on m'écoute, qu'on m'aide, ou juste qu'on soit là", "dire de quel soutien tu as besoin : qu'on t'écoute, qu'on t'aide, ou juste qu'on soit là"],
  ["choisir une personne à qui je peux demander", "choisir une personne à qui tu peux demander"],
  ["dire à quelqu'un que j'aurais besoin d'un coup de main", "dire à quelqu'un que tu aurais besoin d'un coup de main"],
  ["accepter qu'on m'aide, même un peu", "accepter qu'on t'aide, même un peu"],
  ["nommer 5 choses que je vois autour de moi", "nommer 5 choses que tu vois autour de toi"],
  ["sentir mes pieds au sol, le contact du siège", "sentir tes pieds au sol, le contact du siège"],
  ["nommer 3 choses que j'entends maintenant", "nommer 3 choses que tu entends maintenant"],
  ["sentir mes appuis : pieds, dos, mains", "sentir tes appuis : pieds, dos, mains"],
  ["écrire ce qui compte pour moi", "écrire ce qui compte pour toi"],
  ["écrire ce que je veux garder en tête", "écrire ce que tu veux garder en tête"],
]);
