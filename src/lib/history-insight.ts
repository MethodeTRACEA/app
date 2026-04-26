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
  tension:     "Tu te retrouves souvent dans des situations où quelque chose coince…",
  retrait:     "Tu traverses souvent des moments où quelque chose te touche plus profondément que tu ne le montres.",
  incertitude: "Tu traverses souvent des moments où tout n'est pas encore clair.",
  culpabilite: "Tu reviens souvent vers des situations où quelque chose pèse en toi.",
};

const NEED_LINES: Record<NeedFamily, string> = {
  lien:       "Et le lien compte beaucoup dans ce que tu essaies de préserver.",
  limite:     "Et poser une limite semble revenir comme un point important.",
  clarte:     "Et tu cherches souvent à remettre de la clarté dans ce que tu vis.",
  expression: "Et quelque chose cherche souvent à être exprimé plus justement.",
};

const ACTION_LINES: Record<ActionFamily, string> = {
  expression:    "Tu cherches souvent à mettre des mots dessus.",
  recul:         "Tu reviens souvent vers le besoin de prendre du recul avant d'agir.",
  lien:          "Tu cherches souvent à recréer du lien, même quand c'est compliqué.",
  clarification: "Tu essaies souvent d'y voir plus clair avant de choisir.",
};

const CLOSING = "Tu fais beaucoup pour retrouver un appui juste.";

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

  const lines: string[] = [EMOTION_LINES[topEmotion]];
  if (topNeed)   lines.push(NEED_LINES[topNeed]);
  if (topAction) lines.push(ACTION_LINES[topAction]);

  // Clôture douce si le texte est court (1 ou 2 lignes)
  if (lines.length <= 2) lines.push(CLOSING);

  return lines.join("\n\n");
}
