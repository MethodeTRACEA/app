import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { verifierAcces } from "@/lib/cercle/auth";
import { typeCleStripe } from "@/lib/cercle/stripe";
import { diagnosticEtat } from "@/app/cercle/_landing/etat";

// ===================================================================
// GET /api/cercle/gestion/reglages : diagnostic des réglages du Cercle
//
// Derrière le code d'accès, et SANS dépendre de Stripe (il doit marcher
// justement quand un réglage manque). Ne renvoie JAMAIS une valeur :
// seulement « présent / absent », le type de la clé Stripe d'après son
// début, et la validité de forme de la clé Resend.
// ===================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOMS = [
  "CERCLE_INSCRIPTIONS_ACTIVES",
  "CERCLE_STRIPE_SECRET_KEY",
  "RESEND_API_KEY",
  "CERCLE_GESTION_CODE",
  "CERCLE_ZOOM_VENDREDI",
  "CERCLE_ZOOM_MARDI",
] as const;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers) ?? "unknown";
  const v = verifierAcces(request, ip);
  if (!v.ok) return NextResponse.json({ ok: false, message: v.message }, { status: v.status });

  const resend = process.env.RESEND_API_KEY;
  const etat = diagnosticEtat();
  return NextResponse.json({
    ok: true,
    variables: NOMS.map((nom) => ({ nom, present: !!process.env[nom] })),
    inscriptionsActivesExactementTrue: process.env.CERCLE_INSCRIPTIONS_ACTIVES === "true",
    typeCleStripe: typeCleStripe(), // « test » | « live » | « autre » | null (absente)
    resend: { present: !!resend, formatValide: !!resend && /^re_[A-Za-z0-9_-]{16,}$/.test(resend) },
    etat,
    // Informations non secrètes sur le déploiement qui répond.
    deploiement: {
      environnement: process.env.VERCEL_ENV ?? "local",
      branche: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    },
  });
}
