// ===================================================================
// TRACÉA — A-2-0b — Filtre du besoin en TEXTE LIBRE (capture seule)
// ===================================================================
// On ne persiste besoin_raw que si le texte libre passe TOUTES les vérifs ;
// sinon null. AUCUN affichage, AUCUN déclenchement 3114 (décision V1). Le
// texte continue d'aller à l'IA comme avant (hors périmètre de ce filtre).
//
// Ordre des vérifs (un seul échec = null) : §E PII/longueur → §D crise → §C
// émotion seule. normalize() replie déjà les accents (A-2-0b-i).

import { normalize } from "@/lib/memory";

// §D — crise (fragments accent-repliés, comparés sur normalize(raw)).
const CRISIS = [
  "suicid", "me tuer", "mourir", "en finir", "plus envie de vivre", "disparaitre",
  "me faire du mal", "automutil", "me punir", "en peux plus", "a bout", "plus la force",
  "desespoir", "detresse", "sans issue", "le tuer", "lui faire mal", "faire du mal a", "me venger",
];

// §C — émotions (accent-repliées). Rejet UNIQUEMENT si le texte EST exactement
// un wrapper trivial + une émotion (une émotion noyée dans une phrase plus
// longue n'est pas rejetée ici — laissée au juge en A-2-3).
const EMOTIONS = [
  "peur", "angoisse", "anxiete", "panique", "stress", "nervosite",
  "colere", "rage", "enervement", "frustration", "agacement", "irritation",
  "tristesse", "chagrin", "peine", "melancolie", "vide", "honte", "culpabilite", "gene", "embarras",
  "degout", "mepris", "amertume", "jalousie", "envie", "solitude", "abandon", "rejet",
  "confusion", "perdu", "perdue", "desorientee", "deception", "decouragement", "impuissance",
  "lassitude", "ras-le-bol", "epuisement",
];

// Majuscule (y compris accentuée) en première lettre d'un mot.
function startsWithUpper(word: string): boolean {
  if (!word) return false;
  const c = word[0];
  return c === c.toUpperCase() && c.toLowerCase() !== c;
}

export function filterBesoinLibre(raw: string): string | null {
  // ── §E — PII / longueur ──────────────────────────────────────
  // Sur le texte BRUT (avant minuscules) :
  if (/[0-9]/.test(raw)) return null;
  if (raw.includes("@")) return null;
  const low = raw.toLowerCase();
  if (low.includes("http") || low.includes("www.") || low.includes(".fr") || low.includes(".com")) {
    return null;
  }
  // Heuristique prénom : un mot APRÈS le premier qui commence par une majuscule.
  const words = raw.split(" ");
  for (let i = 1; i < words.length; i++) {
    if (startsWithUpper(words[i])) return null;
  }

  const n = normalize(raw);
  if (n.length < 3 || n.length > 50) return null;
  if (!/[a-z]/.test(n)) return null;

  // ── §D — crise ───────────────────────────────────────────────
  for (const frag of CRISIS) {
    if (n.includes(frag)) return null;
  }

  // ── §C — émotion seule (wrapper trivial + émotion, exact) ─────
  for (const e of EMOTIONS) {
    if (
      n === e ||
      n === "j'ai " + e ||
      n === "je suis " + e ||
      n === "je me sens " + e ||
      n === "trop de " + e ||
      n === "tellement de " + e
    ) {
      return null;
    }
  }

  return raw.trim();
}
