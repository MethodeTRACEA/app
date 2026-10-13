import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { CRENEAUX, type CreneauId } from "@/lib/cercle/config";
import { getCercleStripe } from "@/lib/cercle/stripe";
import { traiterRetractation } from "@/lib/cercle/inscriptions";

// ===================================================================
// POST /api/cercle/retractation — « Renoncer au contrat ici »
//
// Reçoit le petit formulaire de /cercle/renoncer. Notifie Alyson (avec le
// lien du paiement dans Stripe et le montant à rembourser) et envoie
// l'accusé de réception à la personne. Aucun remboursement automatique :
// Alyson le fait elle-même dans Stripe. Aucune donnée Supabase.
//
// La route reste disponible même quand les inscriptions sont fermées.
// Elle répond toujours « ok » à une demande bien formée, qu'un paiement
// ait été retrouvé ou non (on ne révèle pas qui est inscrit).
// ===================================================================

export const runtime = "nodejs";

const ipWindows = new Map<string, number[]>();
const IP_MAX = 8;
const IP_WIN = 10 * 60_000;

function fenetre(key: string): boolean {
  const now = Date.now();
  const ts = (ipWindows.get(key) ?? []).filter((t) => t > now - IP_WIN);
  if (ts.length >= IP_MAX) {
    ipWindows.set(key, ts);
    return false;
  }
  ts.push(now);
  ipWindows.set(key, ts);
  if (ipWindows.size > 5_000) ipWindows.clear();
  return true;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function texte(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().replace(/\s+/g, " ");
  return t.length > 0 && t.length <= max ? t : null;
}

export async function POST(request: NextRequest) {
  const cs = getCercleStripe({ ignorerOuverture: true });
  if (!cs.ok) {
    console.warn("[CERCLE] Rétractation impossible, réglage:", cs.reason);
    return NextResponse.json({ error: "Service momentanément indisponible. Écris-moi à cercledeparole@methodetracea.fr.", code: "indisponible" }, { status: 503 });
  }

  const ip = getClientIp(request.headers) ?? "unknown";
  if (!fenetre(ip)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie dans quelques minutes.", code: "rate_limited" }, { status: 429 });
  }

  const cl = request.headers.get("content-length");
  if (cl && parseInt(cl, 10) > 2_048) {
    return NextResponse.json({ error: "Formulaire invalide.", code: "too_large" }, { status: 413 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide.", code: "invalid_body" }, { status: 400 });
  }

  const prenom = texte(body.prenom, 60);
  const email = texte(body.email, 254)?.toLowerCase() ?? null;
  const creneau = CRENEAUX.find((c) => c.id === body.creneau)?.id as CreneauId | undefined;
  if (!prenom || !email || !EMAIL_REGEX.test(email) || !creneau) {
    return NextResponse.json({ error: "Certaines réponses manquent ou sont incomplètes.", code: "invalid_fields" }, { status: 400 });
  }

  try {
    await traiterRetractation(cs.stripe, cs.live, { prenom, email, creneau });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[CERCLE] Échec traitement rétractation:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Ta demande n'a pas pu partir. Écris-moi à cercledeparole@methodetracea.fr.", code: "erreur" },
      { status: 500 }
    );
  }
}
