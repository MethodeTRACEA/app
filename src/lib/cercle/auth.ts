import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

// ===================================================================
// Le Cercle TRACÉA en ligne — accès à la page de gestion (/cercle/gestion)
//
// Un code (CERCLE_GESTION_CODE, au moins 12 caractères) protège la page et
// ses routes. Le code est saisi dans la page, gardé dans l'onglet
// (sessionStorage, effacé à sa fermeture) et envoyé dans l'en-tête
// « x-cercle-code » : aucun cookie. Comparaison à temps constant, limite
// de tentatives par adresse.
// ===================================================================

export const LONGUEUR_MIN_CODE = 12;

function empreinte(s: string): Buffer {
  return createHash("sha256").update(s, "utf8").digest();
}

export function codeValide(fourni: string | null, attendu: string | undefined): boolean {
  if (!attendu || attendu.length < LONGUEUR_MIN_CODE || !fourni) return false;
  return timingSafeEqual(empreinte(fourni), empreinte(attendu));
}

export function configurationCodeOk(): boolean {
  const c = process.env.CERCLE_GESTION_CODE;
  return !!c && c.length >= LONGUEUR_MIN_CODE;
}

const echecs = new Map<string, number[]>();
const MAX_ECHECS = 8;
const FENETRE_MS = 10 * 60_000;

export function tropDEchecs(ip: string): boolean {
  const now = Date.now();
  const ts = (echecs.get(ip) ?? []).filter((t) => t > now - FENETRE_MS);
  echecs.set(ip, ts);
  return ts.length >= MAX_ECHECS;
}

export function noterEchec(ip: string): void {
  const now = Date.now();
  const ts = (echecs.get(ip) ?? []).filter((t) => t > now - FENETRE_MS);
  ts.push(now);
  echecs.set(ip, ts);
  if (echecs.size > 2_000) echecs.clear();
}

export type VerifAcces = { ok: true } | { ok: false; status: 401 | 429 | 503; message: string };

export function verifierAcces(request: NextRequest, ip: string): VerifAcces {
  if (!configurationCodeOk()) {
    return { ok: false, status: 503, message: "Le code d'accès n'est pas encore réglé." };
  }
  if (tropDEchecs(ip)) {
    return { ok: false, status: 429, message: "Trop d'essais. Réessaie dans quelques minutes." };
  }
  if (!codeValide(request.headers.get("x-cercle-code"), process.env.CERCLE_GESTION_CODE)) {
    noterEchec(ip);
    return { ok: false, status: 401, message: "Code incorrect." };
  }
  return { ok: true };
}
