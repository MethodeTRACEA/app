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
  | "frustration"
  | "culpabilité"
  | "solitude";

type Variant = "A" | "B" | "C" | "D" | "E";

// ── Tables de modulation ────────────────────────────────────────

const VALIDATIONS: Record<EmotionKey, [string, string]> = {
  "colère":      ["Tu peux t'appuyer là-dessus.", "Tu peux t'écouter."],
  "tristesse":   ["Tu peux prendre ce temps.", "Ça a sa place."],
  "peur":        ["Tu peux ralentir.", "Tu peux rester là."],
  "confusion":   ["Ça peut rester comme ça.", "Tu n'as pas besoin de savoir tout de suite."],
  "honte":       ["Tu peux y aller doucement.", "Tu peux rester avec toi."],
  "frustration": ["Tu peux le voir.", "C'est là."],
  "culpabilité": ["Tu peux y aller doucement.", "Tu peux rester avec toi."],
  "solitude":    ["Ça a sa place.", "Tu peux t'appuyer là-dessus."],
};

const VALIDATION_FALLBACK: [string, string] = ["Ça a du sens.", "Ça compte."];

const MICRO_PHRASES: Record<EmotionKey, [string, string]> = {
  "colère":      ["Ça pousse.", "Il y a quelque chose."],
  "tristesse":   ["C'est lourd.", "Ça touche."],
  "peur":        ["Il y a une tension.", "Ton corps réagit."],
  "confusion":   ["C'est flou.", "Quelque chose échappe."],
  "honte":       ["Ça se referme.", "C'est difficile à montrer."],
  "frustration": ["Ça bloque.", "Quelque chose résiste."],
  "culpabilité": ["Ça pèse.", "Tu le vois."],
  "solitude":    ["C'est seul là.", "Il manque quelque chose."],
};

const HUMAN_TOUCH: Record<string, [string, string]> = {
  "colère":       ["Ça a touché quelque chose.", "Ça ne passe pas."],
  "tristesse":    ["Ça compte pour toi.", "Ça fait quelque chose."],
  "peur":         ["Il y a une tension là.", "Ça serre un peu."],
  "honte":        ["C'est sensible.", "Ça te touche."],
  "culpabilité":  ["Ça pèse un peu.", "Tu le vois."],
  "confusion":    ["C'est flou.", "Ça ne se pose pas encore."],
  "frustration":  ["Ça bloque.", "Ça frotte."],
  "solitude":     ["C'est seul là.", "Il manque quelque chose."],
};

// Phrase de lien insérée entre situation et émotion (variante A uniquement)
const LINK_PHRASES: Record<string, [string, string]> = {
  "colère":       ["Ça ne passe pas.", "Ça touche quelque chose."],
  "tristesse":    ["Ça compte pour toi.", "Ça fait quelque chose."],
  "peur":         ["Il y a une tension là.", "Ça serre un peu."],
  "honte":        ["C'est sensible.", "C'est difficile à montrer."],
  "culpabilité":  ["Ça pèse un peu.", "Tu le vois."],
  "confusion":    ["C'est flou.", "Ça ne se pose pas encore."],
  "frustration":  ["Ça bloque.", "Ça frotte."],
  "solitude":     ["C'est seul là.", "Il manque quelque chose."],
};

// Toutes les phrases somatiques injectées (pour filtre doublons consécutifs — Rule C)
const ALL_SOMATIC_PHRASES = new Set<string>([
  ...Object.values(LINK_PHRASES).flat(),
  ...Object.values(HUMAN_TOUCH).flat(),
  ...Object.values(MICRO_PHRASES).flat(),
]);

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
// A — miroir classique     : sit | [lien] | emo | dir | valid  (max 4, lien si sit+emo présents)
// B — émotion d'abord      : emo | sit | dir | valid           (4 blocs)
// C — fusion douce         : sit, et emo | dir | valid         (3 blocs)
// D — avec micro-phrase    : sit | micro | dir | valid         (4 blocs, micro remplace emo)
// E — très sobre           : sit | dir | valid                 (3 blocs, sans emo)

function buildBlocks(
  variant: Variant,
  parts: IaParts,
  micro: string | null,
  validation: string,
  humanTouch: string | null = null,
  link: string | null = null
): string[] {
  const { situation, emotion, direction } = parts;
  const sit = situation.join("\n\n");
  const emo = emotion ?? "";
  const dir = direction ?? "";

  switch (variant) {
    case "A":
      if (link && emo) return [sit, link, emo, dir, validation].filter(Boolean);
      return [sit, emo, dir, validation].filter(Boolean);

    case "B":
      // Si pas d'émotion distincte, repli sur A
      if (!emo) return [sit, dir, validation].filter(Boolean);
      if (link) return [emo, sit, link, dir, validation].filter(Boolean);
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
      if (humanTouch) return [sit, micro, humanTouch, dir, validation].filter(Boolean);
      return [sit, micro, dir, validation].filter(Boolean);

    case "E":
      // Sobre : supprime la phrase d'émotion si une situation existe
      if (!sit) return [emo, dir, validation].filter(Boolean);
      if (humanTouch) return [sit, humanTouch, dir, validation].filter(Boolean);
      return [sit, dir, validation].filter(Boolean);
  }
}

// ===================================================================
// ÉCRÊTAGE PAR PRIORITÉ SÉMANTIQUE
// ===================================================================
//
// Ordre de suppression quand > 4 paragraphes visuels (plus haute = supprimé en premier) :
//   5 → micro injecté (phrase courte, non critique)
//   4 → paragraphes de situation surnuméraires / humanTouch
//   3 → validations connues
//   2 → émotion ou contenu non classifié
//   1 → phrase de lien (protégée après validation et émotion)
//   0 → direction + premier bloc de situation (jamais supprimés)

function trimByPriority(
  paragraphs: string[],
  direction: string,
  sitParagraphs: string[],
  micro: string | null,
  humanTouch: string | null,
  link: string | null,
  max: number
): string[] {
  const assignPriority = (p: string): number => {
    if (p === direction) return 0;
    if (sitParagraphs[0] && p === sitParagraphs[0]) return 0;
    if (link && p === link) return 1;
    if (micro && p === micro) return 5;
    if (sitParagraphs.slice(1).includes(p)) return 4;
    if (humanTouch && p === humanTouch) return 4;
    if (ALL_VALIDATIONS.has(p)) return 3;
    // Rule A: analytical emotion phrase ("Tu ressens de la X.") — lower priority than default content
    if (/^tu (as ressenti|ressens) de (la |le |du |l')\S+[.,]?\s*$/i.test(p)) return 3;
    return 2;
  };

  const result = [...paragraphs];
  while (result.length > max) {
    const maxPri = Math.max(...result.map(assignPriority));
    if (maxPri === 0) break; // ne peut plus supprimer sans toucher les éléments protégés
    for (let i = result.length - 1; i >= 0; i--) {
      if (assignPriority(result[i]) === maxPri) {
        result.splice(i, 1);
        break;
      }
    }
  }
  return result;
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

  // ── Human touch (variantes D et E, 30% déterministe) ────────
  // D : après micro. E : après situation (si émotion connue).
  // Priorité 4, retiré avant micro si >4 blocs.
  const humanTouchOptions = HUMAN_TOUCH[e] ?? null;
  const humanTouch =
    humanTouchOptions &&
    (variant === "D" || (variant === "E" && parts.situation.length > 0)) &&
    hashString(text + e + "humantouch") % 10 < 3
      ? pickFrom(humanTouchOptions, text + "humantouch")
      : null;

  // ── Phrase de lien (variantes A et B) ────────────────────────
  // A : entre situation et émotion. B : entre situation et direction.
  // Priorité 1, retirée en dernier (après validation et émotion).
  const linkOptions = LINK_PHRASES[e] ?? null;
  const link =
    linkOptions && (
      (variant === "A" && parts.situation.length > 0 && parts.emotion !== null) ||
      (variant === "B" && parts.situation.length > 0)
    )
      ? pickFrom(linkOptions, text + "link")
      : null;

  // ── Construction ─────────────────────────────────────────────
  const blocks = buildBlocks(variant, parts, micro, finalValidation, humanTouch, link);

  // Sécurité : si résultat trop court (parsing trop agressif),
  // repli sur variante A avec la validation émotionnelle uniquement
  if (blocks.filter(Boolean).length < 2) {
    const fallback = buildBlocks("A", parts, null, finalValidation);
    if (fallback.filter(Boolean).length < 2) return text;
    return fallback.slice(0, 4).join("\n\n");
  }

  // ── Expansion visuelle ────────────────────────────────────────
  // situation.join("\n\n") peut contenir plusieurs sous-paragraphes.
  // On travaille sur les paragraphes visuels individuels pour les étapes suivantes.
  let visual = blocks.join("\n\n").split(/\n\n+/).filter(Boolean);

  // ── 1. Déduplication des paragraphes consécutifs identiques ──
  // Ex : micro injecté identique à un paragraphe de situation → garder 1 seul.
  visual = visual.filter(
    (p, i) => i === 0 || p.trim() !== visual[i - 1].trim()
  );

  // ── 1b. Rule C : pas deux phrases somatiques consécutives ────
  // Évite LINK + MICRO ou MICRO + HUMAN_TOUCH côte à côte (surchauffe sensorielle).
  visual = visual.filter(
    (p, i) =>
      i === 0 ||
      !(ALL_SOMATIC_PHRASES.has(p) && ALL_SOMATIC_PHRASES.has(visual[i - 1]))
  );

  // ── 2. Garantie de présence minimale ─────────────────────────
  // Si direction ou premier bloc de situation ont disparu (cas extrême),
  // repli sur variante A qui garantit les deux.
  const hasDirection = visual.some((p) => p === parts.direction);
  const hasSituation =
    parts.situation.length === 0 ||
    visual.some((p) => parts.situation.includes(p));

  if (!hasDirection || !hasSituation) {
    const fb = buildBlocks("A", parts, null, finalValidation);
    if (fb.filter(Boolean).length >= 2) {
      visual = fb.join("\n\n").split(/\n\n+/).filter(Boolean);
      visual = visual.filter(
        (p, i) => i === 0 || p.trim() !== visual[i - 1].trim()
      );
    }
  }

  // ── 3. Écrêtage à 4 avec priorité sémantique ─────────────────
  // Supprime micro en premier, puis sit surnuméraires, validation, émotion.
  // Ne supprime jamais direction ni premier bloc de situation.
  if (visual.length > 4) {
    visual = trimByPriority(
      visual,
      parts.direction,
      parts.situation,
      micro,
      humanTouch,
      link,
      4
    );
  }

  // ── 4. Rule D : validation unique — garder la première, supprimer les suivantes ──
  // Couvre les doublons consécutifs ET non-consécutifs.
  {
    let seen = false;
    visual = visual.filter((p) => {
      if (!ALL_VALIDATIONS.has(p)) return true;
      if (seen) return false;
      seen = true;
      return true;
    });
  }

  return visual.join("\n\n");
}
