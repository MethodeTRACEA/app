// ===================================================================
// TRACÉA — Module post-traitement V3
// Micro-variations invisibles : structure, validation, micro-phrase.
//
// Principe :
//   - Parse le texte IA en blocs sémantiques
//   - Choisit une des 5 structures (A–E) de façon déterministe
//   - Remplace la validation par la version émotionnelle
//   - Injecte éventuellement une micro-phrase (variante D uniquement)
//
// Jamais : ajout d'idée, interprétation, enrichissement.
// Max : 4 phrases. Si le parsing échoue, retour du texte original.
// ===================================================================

// ── Types ───────────────────────────────────────────────────────

type EmotionKey =
  | "colère"
  | "tristesse"
  | "peur"
  | "confusion"
  | "honte"
  | "frustration";

type Variant = "A" | "B" | "C" | "D" | "E";

// ── Tables de modulation ────────────────────────────────────────

const VALIDATIONS: Record<EmotionKey, [string, string]> = {
  "colère":      ["Tu peux t'appuyer là-dessus.", "Tu peux t'écouter."],
  "tristesse":   ["Tu peux prendre ce temps.", "Ça a sa place."],
  "peur":        ["Tu peux ralentir.", "Tu peux rester là."],
  "confusion":   ["Ça peut rester comme ça.", "Tu n'as pas besoin de savoir tout de suite."],
  "honte":       ["Tu peux y aller doucement.", "Tu peux rester avec toi."],
  "frustration": ["Tu peux le voir.", "C'est là."],
};

const VALIDATION_FALLBACK: [string, string] = ["Ça a du sens.", "Ça compte."];

const MICRO_PHRASES: Record<EmotionKey, [string, string]> = {
  "colère":      ["Ça pousse.", "Il y a quelque chose."],
  "tristesse":   ["C'est lourd.", "Ça touche."],
  "peur":        ["Il y a une tension.", "Ton corps réagit."],
  "confusion":   ["C'est flou.", "Quelque chose échappe."],
  "honte":       ["Ça se referme.", "C'est difficile à montrer."],
  "frustration": ["Ça bloque.", "Quelque chose résiste."],
};

// Toutes les validations connues (pour détection dans le texte IA)
const ALL_VALIDATIONS = new Set([
  "Tu peux t'appuyer là-dessus.", "Tu peux t'écouter.",
  "Tu peux prendre ce temps.", "Ça a sa place.",
  "Tu peux ralentir.", "Tu peux rester là.",
  "Ça peut rester comme ça.", "Tu n'as pas besoin de savoir tout de suite.",
  "Tu peux y aller doucement.", "Tu peux rester avec toi.",
  "Tu peux le voir.", "C'est là.",
  "Ça a du sens.", "Ça compte.", "Ça compte vraiment.",
  "C'est important.", "Tu l'as vu.", "Tu ne l'as pas laissé passer.",
  "Tu as fait ce qu'il fallait.", "Tu ne fais pas ça pour rien.",
  "Ce n'est pas anodin.", "C'est juste pour toi.", "Tu peux t'y fier.",
  "Ça aide à y voir plus clair.",
]);

// Marqueurs de la phrase de direction/intention
const DIRECTION_MARKERS = [
  "Ce qui te semble juste",
  "Tu as repéré que",
  "Tu vois qu'un premier pas",
];

// Marqueurs de la phrase d'émotion
const EMOTION_PATTERN = /tu (as ressenti|t'es senti)/i;

// ── Utilitaires ─────────────────────────────────────────────────

/** Hash djb2-style — même entrée = même sortie. Varie selon le texte IA. */
function hashString(s: string): number {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function pickFrom<T>(arr: readonly T[], seed: string): T {
  return arr[hashString(seed) % arr.length];
}

function isDirection(p: string): boolean {
  return DIRECTION_MARKERS.some((m) => p.includes(m));
}

function isEmotion(p: string): boolean {
  return EMOTION_PATTERN.test(p);
}

// ── Parsing ─────────────────────────────────────────────────────

interface IaParts {
  situation: string[];   // 0–2 phrases de contexte
  emotion:   string | null;  // 1 phrase d'émotion
  direction: string | null;  // phrase d'intention
  validation: string | null; // dernière courte phrase
}

function parseIaOutput(text: string): IaParts {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  let direction: string | null = null;
  let emotion: string | null = null;
  const remaining: string[] = [];

  // Passe 1 : identifier direction et émotion
  for (const p of paragraphs) {
    if (!direction && isDirection(p)) {
      direction = p;
    } else if (!emotion && isEmotion(p)) {
      emotion = p;
    } else {
      remaining.push(p);
    }
  }

  // Passe 2 : le dernier "remaining" est la validation s'il est court
  let validation: string | null = null;
  const situation: string[] = [];

  for (let i = 0; i < remaining.length; i++) {
    const r = remaining[i];
    const isLast = i === remaining.length - 1;
    const isKnown = ALL_VALIDATIONS.has(r);
    const isShort = r.split(/\s+/).length <= 6 && r.length < 55;

    if (isLast && (isKnown || isShort)) {
      validation = r;
    } else {
      situation.push(r);
    }
  }

  return { situation, emotion, direction, validation };
}

// ── Sélection de variante ────────────────────────────────────────

const VARIANT_TABLE: Variant[] = ["A", "B", "C", "D", "E"];

function selectVariant(seed: string): Variant {
  return pickFrom(VARIANT_TABLE, seed + "v3variant");
}

// ── Construction par variante ────────────────────────────────────
//
// A — miroir classique     : sit | emo | dir | valid           (4 blocs)
// B — émotion d'abord      : emo | sit | dir | valid           (4 blocs)
// C — fusion douce         : sit, et emo | dir | valid         (3 blocs)
// D — avec micro-phrase    : sit | micro | dir | valid         (4 blocs, micro remplace emo)
// E — très sobre           : sit | dir | valid                 (3 blocs, sans emo)

function buildBlocks(
  variant: Variant,
  parts: IaParts,
  micro: string | null,
  validation: string
): string[] {
  const { situation, emotion, direction } = parts;
  const sit = situation.join("\n\n");
  const emo = emotion ?? "";
  const dir = direction ?? "";

  switch (variant) {
    case "A":
      return [sit, emo, dir, validation].filter(Boolean);

    case "B":
      // Si pas d'émotion distincte, repli sur A
      if (!emo) return [sit, dir, validation].filter(Boolean);
      return [emo, sit, dir, validation].filter(Boolean);

    case "C": {
      // Fusion de la dernière phrase de situation avec l'émotion
      if (!emo || situation.length === 0) {
        return [sit || emo, dir, validation].filter(Boolean);
      }
      const prefix = situation.slice(0, -1); // tout sauf le dernier
      const lastSit = situation[situation.length - 1].replace(/\.\s*$/, "");
      const emoLower = emo.charAt(0).toLowerCase() + emo.slice(1);
      const fused = `${lastSit}, et ${emoLower}`;
      return [...prefix, fused, dir, validation].filter(Boolean);
    }

    case "D":
      // Micro-phrase remplace l'émotion distincte pour rester à 4 blocs max
      if (!micro) return [sit, emo, dir, validation].filter(Boolean);
      return [sit, micro, dir, validation].filter(Boolean);

    case "E":
      // Sobre : supprime la phrase d'émotion si une situation existe
      if (!sit) return [emo, dir, validation].filter(Boolean);
      return [sit, dir, validation].filter(Boolean);
  }
}

// ===================================================================
// FONCTION PRINCIPALE
// ===================================================================

export function applyTraceaV3(text: string, emotion: string): string {
  const e = emotion.toLowerCase().trim() as EmotionKey;

  // ── Parse le texte IA ─────────────────────────────────────────
  const parts = parseIaOutput(text);

  // Sécurité : si pas de direction détectée, retour du texte original
  if (!parts.direction) return text;

  // ── Validation émotionnelle ───────────────────────────────────
  const validationOptions = VALIDATIONS[e] ?? VALIDATION_FALLBACK;
  const finalValidation = pickFrom(validationOptions, text);

  // ── Variante structurelle ─────────────────────────────────────
  const variant = selectVariant(text + e);

  // ── Micro-phrase (variante D uniquement) ──────────────────────
  const microOptions = MICRO_PHRASES[e] ?? null;
  const micro =
    variant === "D" && microOptions
      ? pickFrom(microOptions, text + "micro")
      : null;

  // ── Construction ─────────────────────────────────────────────
  const blocks = buildBlocks(variant, parts, micro, finalValidation);

  // Sécurité : si résultat trop court (parsing trop agressif),
  // repli sur variante A avec la validation émotionnelle uniquement
  if (blocks.filter(Boolean).length < 2) {
    const fallback = buildBlocks("A", parts, null, finalValidation);
    if (fallback.filter(Boolean).length < 2) return text;
    return fallback.join("\n\n");
  }

  return blocks.join("\n\n");
}
