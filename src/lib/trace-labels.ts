// ===================================================================
// TRACÉA — Libellés de la trace individuelle (traversée courte)
//
// Source UNIQUE de vérité pour transformer les clés techniques stockées
// dans tracea_events (ressenti / corps / ancrer) en libellés lisibles.
// Formulations sans genre, validées doctrine.
//
// Le geste (event step "emerger") n'a PAS de table ici : sa valeur est
// déjà un libellé lisible (summaryLabel), elle s'affiche telle quelle.
// ===================================================================

export const RESSENTI_LABELS: Record<string, string> = {
  serre: "le corps serré",
  agite: "de l'agitation",
  lourd: "une lourdeur",
  flou: "du flou",
  vide: "du vide",
  bloque: "quelque chose de bloqué",
  "je-ne-sais-pas": "quelque chose de difficile à nommer",
};

export const CORPS_LABELS: Record<string, string> = {
  poitrine: "la poitrine",
  gorge: "la gorge",
  ventre: "le ventre",
  tete: "la tête",
  epaules: "les épaules",
  partout: "un peu partout",
  "je-ne-sais-pas": "un endroit difficile à situer",
};

export const ANCRAGE_LABELS: Record<string, string> = {
  souffle: "revenir au souffle",
  appuis: "sentir tes appuis",
  autour: "regarder autour de toi",
};

export type TraceCategory = "ressenti" | "corps" | "ancrage";

const MAPS: Record<TraceCategory, Record<string, string>> = {
  ressenti: RESSENTI_LABELS,
  corps: CORPS_LABELS,
  ancrage: ANCRAGE_LABELS,
};

/**
 * Renvoie le libellé lisible d'une clé de trace, ou `null` si la clé est
 * inconnue (ou absente). L'appelant doit alors MASQUER la ligne plutôt que
 * d'afficher une clé technique brute.
 */
export function getTraceLabel(
  category: TraceCategory,
  key: string | null | undefined
): string | null {
  if (!key) return null;
  return MAPS[category][key] ?? null;
}
