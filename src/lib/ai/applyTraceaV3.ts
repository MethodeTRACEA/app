// ===================================================================
// TRACÉA — Module post-traitement V3
// Applique des micro-variations de forme APRÈS génération IA.
// Ne modifie jamais le sens, le contenu, ni les informations.
// ===================================================================

type EmotionKey =
  | "colère"
  | "tristesse"
  | "peur"
  | "confusion"
  | "honte"
  | "frustration";

// ── Validations par émotion ─────────────────────────────────────
const VALIDATIONS: Record<EmotionKey, string[]> = {
  "colère":      ["Tu peux t'écouter.", "Tu peux t'appuyer là-dessus."],
  "tristesse":   ["Tu peux prendre ce temps.", "Tu peux rester avec ça."],
  "peur":        ["Tu peux ralentir.", "Tu peux rester là."],
  "confusion":   ["Ça peut rester comme ça.", "Tu n'as pas besoin de savoir tout de suite."],
  "honte":       ["Tu peux y aller doucement.", "Tu peux rester avec toi."],
  "frustration": ["Tu peux le voir.", "C'est là."],
};

// ── Micro-phrases par émotion ───────────────────────────────────
const MICRO_PHRASES: Record<EmotionKey, string[]> = {
  "colère":      ["Ça pousse.", "Il y a quelque chose."],
  "tristesse":   ["C'est lourd.", "Ça touche."],
  "peur":        ["Il y a une tension.", "Ton corps réagit."],
  "confusion":   ["C'est flou.", "Quelque chose échappe."],
  "honte":       ["Ça se referme.", "C'est difficile à montrer."],
  "frustration": ["Ça bloque.", "Quelque chose résiste."],
};

// ── Validations génériques (V2.0/V2.1) — candidats au remplacement
const GENERIC_VALIDATIONS = new Set([
  "Ça compte.", "Ça compte vraiment.", "C'est important.",
  "Tu l'as vu.", "Tu ne l'as pas laissé passer.", "Tu as fait ce qu'il fallait.",
  "Ça a sa place.", "Tu ne fais pas ça pour rien.", "Ce n'est pas anodin.",
  "Ça a du sens.", "C'est juste pour toi.", "Tu peux t'y fier.",
]);

// ── Hash déterministe pour la sélection ─────────────────────────
function hashString(s: string): number {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function pickFrom<T>(arr: T[], seed: string): T {
  return arr[hashString(seed) % arr.length];
}

// ===================================================================
// FONCTION PRINCIPALE
// ===================================================================

/**
 * Applique des micro-variations de forme au texte généré par l'IA.
 *
 * Étape 1 — Swap validation générique → validation émotionnelle
 *   Si la dernière phrase est une validation générique et que l'émotion
 *   a une validation spécifique, remplace par la version incarnée.
 *
 * Étape 2 — Injection micro-phrase (optionnelle)
 *   Si le texte est court (≤ 3 paragraphes), que l'émotion a des
 *   micro-phrases, et qu'aucune n'est déjà présente : en ajoute une
 *   avant la validation, de façon déterministe (≈ 1 fois sur 2).
 *
 * Étape 3 — Normalisation des sauts de ligne
 *   Chaque paragraphe séparé par une ligne vide.
 *
 * Jamais :
 *   - modification du sens
 *   - ajout d'information
 *   - reformulation du contenu
 */
export function applyTraceaV3(text: string, emotion: string): string {
  const e = emotion.toLowerCase().trim() as EmotionKey;

  const emotionValidations = VALIDATIONS[e] ?? null;
  const emotionMicros = MICRO_PHRASES[e] ?? null;

  // Découper en paragraphes
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return text;

  const result = [...paragraphs];
  const lastP = result[result.length - 1];

  // ── Étape 1 : swap validation générique → émotionnelle ─────────
  if (emotionValidations && GENERIC_VALIDATIONS.has(lastP)) {
    result[result.length - 1] = pickFrom(emotionValidations, text);
  }

  // ── Étape 2 : injection micro-phrase avant validation ──────────
  // Condition : texte court (≤ 3 § ), émotion connue, micro absente.
  if (emotionMicros && result.length <= 3) {
    const alreadyPresent = emotionMicros.some((m) =>
      text.includes(m.replace(/\.$/, ""))
    );
    if (!alreadyPresent && hashString(text) % 2 === 0) {
      const micro = pickFrom(emotionMicros, text + "micro");
      result.splice(result.length - 1, 0, micro);
    }
  }

  // ── Étape 3 : normalisation ─────────────────────────────────────
  return result.join("\n\n");
}
