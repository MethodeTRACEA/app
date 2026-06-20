// ===================================================================
// TRACÉA — A-2-2 — Gate de la phrase de continuité (validation déterministe)
// ===================================================================
// Valide la PHRASE PRODUITE par l'IA (l'unité après ⟦CONT⟧), PAS la note
// d'entrée. Module isolé, non branché ici (branchement = A-2-2-2).
// normalize() replie déjà accents + apostrophes courbes (A-2-0b).

import { normalize } from "@/lib/memory";

// §B — table FIGÉE. Clés = libellés de chips. Ne rien inventer.
const BESOIN_SYNONYMS: Record<string, string[]> = {
  "qu'on me comprenne": ["être compris", "être entendu", "être écouté", "qu'on m'écoute", "qu'on m'entende"],
  "me rapprocher de quelqu'un": ["me rapprocher", "aller vers quelqu'un", "aller vers l'autre", "retrouver du lien", "renouer le lien"],
  "qu'on me soutienne": ["être soutenu", "avoir du soutien", "être épaulé", "qu'on soit là pour moi"],
  "poser une limite": ["poser mes limites", "poser des limites", "mettre une limite", "tenir ma limite", "dire non"],
  "y voir plus clair": ["y voir clair", "clarifier les choses", "mettre au clair", "prendre du recul", "prendre de la distance"],
  "mettre des mots dessus": ["mettre des mots dessus", "mettre des mots sur ce que je vis", "dire ce que j'ai à dire", "exprimer ce que je vis"],
  "juste poser ça": ["poser ça", "déposer ça", "juste déposer", "poser ce qui est là"],
};

// Forme d'ancrage : normalize + neutralisation des pronoms/possessifs 2e→1re
// personne (sur limites de mots). Sert UNIQUEMENT à l'ancrage, pas à l'affichage.
function matchForm(s: string): string {
  return normalize(s)
    .replace(/\bt'/g, "m'")
    .replace(/\btu\b/g, "je")
    .replace(/\btoi\b/g, "moi")
    .replace(/\bton\b/g, "mon")
    .replace(/\btes\b/g, "mes")
    .replace(/\bta\b/g, "ma")
    .replace(/\bte\b/g, "me");
}

export function gateContinuity(
  unit: string,
  besoin: string,
  source: "chip" | "libre"
): { pass: boolean; reason: string } {
  // a. STRUCTURE
  if (!unit || !unit.trim()) return { pass: false, reason: "vide" };
  const phrases = unit.split(/[.!?]/).map((p) => p.trim()).filter(Boolean);
  if (phrases.length > 1) return { pass: false, reason: "plusieurs phrases" };
  if (unit.length > 200) return { pass: false, reason: "trop long" };

  // b. LEXIQUE DUR (sur normalize(unit))
  const n = normalize(unit);
  if (/[0-9]/.test(n)) return { pass: false, reason: "chiffre" };
  if (n.includes("%")) return { pass: false, reason: "pourcentage" };
  if (
    /\bfois\b/.test(n) ||
    n.includes("de plus en plus") ||
    n.includes("de mieux en mieux") ||
    n.includes("progress")
  ) {
    return { pass: false, reason: "progression/fréquence" };
  }

  // c. ANCRAGE (matchForm des deux côtés)
  const mu = matchForm(unit);
  if (source === "chip") {
    const key = Object.keys(BESOIN_SYNONYMS).find(
      (k) => normalize(k) === normalize(besoin)
    );
    if (!key) return { pass: false, reason: "chip inconnu" };
    const ancres = [key, ...BESOIN_SYNONYMS[key]];
    const ancre = ancres.some((a) => mu.includes(matchForm(a)));
    if (!ancre) return { pass: false, reason: "ancrage chip" };
  } else {
    if (!mu.includes(matchForm(besoin))) return { pass: false, reason: "ancrage libre" };
  }

  // d. OK
  return { pass: true, reason: "ok" };
}
