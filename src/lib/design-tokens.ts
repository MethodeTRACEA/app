// ═══════════════════════════════════════════════════════════
// TRACÉA — Design Tokens (valeurs JS)
// Source de vérité : docs/TRACEA_design_system_complet.md
// Les classes Tailwind correspondantes sont dans globals.css
// préfixées par `t-` (t-screen, t-card, t-chip, t-btn-primary…)
// ═══════════════════════════════════════════════════════════

/**
 * Palette TRACÉA — à utiliser en JS uniquement quand les classes
 * Tailwind ne suffisent pas (ex. style inline dynamique, canvas, SVG…).
 * Pour le CSS normal, préférer les classes `text-t-dore`, `bg-t-nuit`, etc.
 */
export const colors = {
  // Fonds
  brunNuit: "#231916",
  terracottaSombre: "#6E4332",
  brunBrume: "#4B352D",

  // Lumière
  doreDoux: "#D6A56A",
  beigeLumiere: "#E8D8C7",
  cremeFumee: "#CDB9A4",

  // Soutien
  saugeProfond: "#6E7D6D",
  bronzeDoux: "#A7774F",

  // Dégradé principal
  gradientStart: "#1F1715",
  gradientMid: "#3A2923",
  gradientEnd: "#6B4636",
} as const;
