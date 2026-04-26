// ===================================================================
// TRACÉA — History Insight Engine V1
//
// Miroir longitudinal déterministe.
// Aucun appel IA, aucun appel réseau.
// Entrée : SessionData[] — Sortie : string | null
//
// Logique :
//   1. Filtrer sur les traversées approfondies (context === "autre")
//   2. Classifier chaque session par famille (émotion, besoin, action)
//   3. Détecter la famille dominante (≥ 50% des sessions classifiées)
//   4. Assembler 2–3 lignes depuis des templates pré-écrits
// ===================================================================

import type { SessionData } from "./types";

// ── Types familles ──────────────────────────────────────────────

type EmotionFamily = "tension" | "retrait" | "incertitude" | "culpabilite";
type NeedFamily    = "lien" | "limite" | "clarte" | "expression";
type ActionFamily  = "expression" | "recul" | "lien" | "clarification";

// ── Classification ───────────────────────────────────────────────

function classifyEmotion(e: string): EmotionFamily | null {
  const v = e.toLowerCase().trim();
  if (v.includes("colère") || v.includes("frustration")) return "tension";
  if (v.includes("tristesse") || v.includes("honte") || v.includes("solitude")) return "retrait";
  if (v.includes("peur") || v.includes("confusion")) return "incertitude";
  if (v.includes("culpabilité")) return "culpabilite";
  return null;
}

function classifyNeed(n: string): NeedFamily | null {
  const v = n.toLowerCase().trim();
  if (v.includes("compris") || v.includes("rapprocher") || v.includes("lien")) return "lien";
  if (v.includes("limite")) return "limite";
  if (v.includes("clarif") || v.includes("clair") || v.includes("recul") || v.includes("distance")) return "clarte";
  if (v.includes("exprimer") || v.includes("ressenti") || v.includes("dire")) return "expression";
  return null;
}

function classifyAction(a: string): ActionFamily | null {
  const v = a.toLowerCase().trim();
  if (v.includes("écrire") || v.includes("exprimer") || v.includes("mots")) return "expression";
  if (v.includes("recul") || v.includes("distance") || v.includes("observer") || v.includes("attendre")) return "recul";
  if (v.includes("rapprocher") || v.includes("parler") || v.includes("lien") || v.includes("conversation")) return "lien";
  if (v.includes("clarif") || v.includes("clair") || v.includes("nommer")) return "clarification";
  return null;
}

// ── Détection de dominance ───────────────────────────────────────

function dominant<T extends string>(
  counts: Partial<Record<T, number>>,
  total: number,
  threshold: number
): T | null {
  if (total === 0) return null;
  const entries = (Object.entries(counts) as [T, number][]).filter(([, n]) => n > 0);
  if (entries.length === 0) return null;
  const [top, count] = entries.sort(([, a], [, b]) => b - a)[0];
  return count / total >= threshold ? top : null;
}

// ── Templates ────────────────────────────────────────────────────

const EMOTION_LINES: Record<EmotionFamily, string> = {
  tension:     "Tu te retrouves souvent dans des situations où quelque chose ne circule pas vraiment…",
  retrait:     "Tu traverses souvent des moments où quelque chose se referme ou se retire…",
  incertitude: "Tu passes souvent par des moments où tu ne sais pas encore clairement…",
  culpabilite: "Tu te retrouves souvent avec quelque chose qui pèse intérieurement…",
};

const NEED_LINES: Record<NeedFamily, string> = {
  lien:       "Et le lien avec l'autre reste important pour toi, même quand c'est compliqué.",
  limite:     "Et tu sens souvent que quelque chose dépasse ce que tu peux accepter.",
  clarte:     "Et tu cherches à remettre de la clarté dans ce que tu vis.",
  expression: "Et quelque chose en toi cherche à être dit ou exprimé.",
};

const ACTION_LINES: Record<ActionFamily, string> = {
  expression:    "Tu cherches souvent à mettre des mots dessus pour que ça bouge.",
  recul:         "Tu prends souvent un temps pour ne pas réagir immédiatement.",
  lien:          "Tu fais souvent un pas vers l'autre, même quand ce n'est pas simple.",
  clarification: "Tu essaies souvent de nommer ce qui se passe pour y voir plus clair.",
};

const FALLBACK_EMOTION = "Tu traverses des choses qui te demandent de t'arrêter un peu.";
const FALLBACK_NEED    = "Et quelque chose en toi cherche à s'ajuster.";
const FALLBACK_ACTION  = "Tu fais déjà des mouvements pour essayer d'y voir plus clair.";

// ── Fonction principale ──────────────────────────────────────────

export function buildHistoryInsight(sessions: SessionData[]): string | null {
  const deep = sessions.filter((s) => s.context === "autre");
  if (deep.length < 5) return null;

  // Comptage émotion
  const emotionCounts: Partial<Record<EmotionFamily, number>> = {};
  let emotionTotal = 0;
  for (const s of deep) {
    if (!s.emotionPrimaire) continue;
    const f = classifyEmotion(s.emotionPrimaire);
    if (!f) continue;
    emotionCounts[f] = (emotionCounts[f] ?? 0) + 1;
    emotionTotal++;
  }

  // Comptage besoin
  const needCounts: Partial<Record<NeedFamily, number>> = {};
  let needTotal = 0;
  for (const s of deep) {
    if (!s.veriteInterieure) continue;
    const f = classifyNeed(s.veriteInterieure);
    if (!f) continue;
    needCounts[f] = (needCounts[f] ?? 0) + 1;
    needTotal++;
  }

  // Comptage action
  const actionCounts: Partial<Record<ActionFamily, number>> = {};
  let actionTotal = 0;
  for (const s of deep) {
    const a = s.actionAlignee || s.steps.emerger;
    if (!a) continue;
    const f = classifyAction(a);
    if (!f) continue;
    actionCounts[f] = (actionCounts[f] ?? 0) + 1;
    actionTotal++;
  }

  const topEmotion = dominant(emotionCounts, emotionTotal, 0.5);
  if (!topEmotion) return null;

  const topNeed   = dominant(needCounts,   needTotal,   0.5);
  const topAction = dominant(actionCounts, actionTotal, 0.5);

  const emotionLine = EMOTION_LINES[topEmotion];
  const needLine    = topNeed   ? NEED_LINES[topNeed]
                    : needTotal > 0 ? FALLBACK_NEED
                    : null;
  const actionLine  = topAction   ? ACTION_LINES[topAction]
                    : actionTotal > 0 ? FALLBACK_ACTION
                    : null;

  // Supprime le FALLBACK_EMOTION (défini, non utilisé dans ce build — réservé)
  void FALLBACK_EMOTION;

  return [emotionLine, needLine, actionLine].filter(Boolean).join("\n\n");
}
