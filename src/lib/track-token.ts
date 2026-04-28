// ===================================================================
// TRACK TOKEN — Utilitaire serveur uniquement
//
// Token HMAC-SHA256 horaire, stateless, compatible Vercel serverless.
// Ne jamais importer ce fichier côté client (contient crypto Node.js).
//
// Fonctionnement :
//   token = hmac_sha256(heure_courante, TRACK_TOKEN_SECRET).slice(0, 32)
//   Valide pour l'heure courante ET l'heure précédente (fenêtre ~2h max).
//   Rotation automatique toutes les heures côté serveur.
//   Le client renouvelle son token via GET /api/track-token.
// ===================================================================

import { createHmac } from "crypto";

function getSecret(): string {
  // En production : définir TRACK_TOKEN_SECRET dans les env vars Vercel.
  // En développement : fallback insécure acceptable (tracking non critique).
  return process.env.TRACK_TOKEN_SECRET ?? "tracea-dev-insecure-default";
}

/** Numéro de l'heure actuelle (UTC, incrémente toutes les 3600s). */
function currentHour(): number {
  return Math.floor(Date.now() / 3_600_000);
}

/** Génère le token HMAC pour une heure donnée. */
function makeToken(hour: number): string {
  return createHmac("sha256", getSecret())
    .update(String(hour))
    .digest("hex")
    .slice(0, 32);
}

/** Retourne le token valide pour l'heure courante. */
export function generateToken(): string {
  return makeToken(currentHour());
}

/**
 * Valide un token reçu depuis le client.
 * Accepte l'heure courante et l'heure précédente pour absorber
 * les décalages d'horloge et la rotation en fin d'heure.
 */
export function isValidToken(token: unknown): boolean {
  if (typeof token !== "string" || token.length !== 32) return false;
  const hour = currentHour();
  return token === makeToken(hour) || token === makeToken(hour - 1);
}
