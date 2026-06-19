// ===================================================================
// TRACÉA — Chantier 36 — Accompagnement présent de la sécurité
// ===================================================================
// Phrase FIXE, déterministe, ajoutée à la clôture du miroir quand le besoin
// de la traversée est « me sentir en sécurité ». AUCUNE génération IA, AUCUNE
// récurrence. N'entre JAMAIS dans le prompt : ajoutée à la string finale
// APRÈS applyTraceaV3. Module isolé pour réutilisation (chantier 37 — flow court).

import { normalize } from "@/lib/memory";

const SECURITY_NEED = "me sentir en sécurité";

// VERBATIM — ne pas reformuler.
const SECURITY_CLOSINGS = [
  "Tu peux poser un appui ici, simplement. Et tu pourras y revenir quand tu veux.",
  "Tu n'as rien à réussir ici. Tu peux poser un appui — le sol sous tes pieds — et revenir quand tu veux.",
];

export function appendSecurityClosing(text: string, besoin: string | undefined): string {
  if (normalize(besoin || "") !== normalize(SECURITY_NEED)) return text;
  const line = SECURITY_CLOSINGS[Math.floor(Math.random() * SECURITY_CLOSINGS.length)];
  return text ? `${text}\n\n${line}` : line;
}
