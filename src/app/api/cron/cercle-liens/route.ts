import { NextRequest, NextResponse } from "next/server";
import { getCercleStripe } from "@/lib/cercle/stripe";
import { actionEnvoyerLiens } from "@/lib/cercle/gestion";
import { jourParis, rencontresDuJour } from "@/lib/cercle/rencontres";

// force-dynamic : jamais évaluée au build.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// =====================================================================
// GET /api/cron/cercle-liens
//
// Tâche Vercel quotidienne à 17 h UTC = 18 h à Paris (heure d'hiver, ce
// qui couvre tout le cycle de novembre-décembre 2026). S'il y a une
// rencontre demain, envoie le lien Zoom aux seules personnes dont le
// créneau a été confirmé et qui n'ont pas été remboursées.
// Les tâches Vercel ne tournent qu'en PRODUCTION (jamais sur un aperçu).
//
// Auth : Authorization: Bearer $CRON_SECRET (échec fermé).
// =====================================================================

export async function GET(request: NextRequest) {
  const attendu = process.env.CRON_SECRET;
  const fourni = request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  if (!attendu || !fourni || fourni !== attendu) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cs = getCercleStripe({ ignorerOuverture: true });
  if (!cs.ok) return NextResponse.json({ ok: true, ignore: cs.reason });

  const demain = jourParis(new Date(Date.now() + 24 * 3600 * 1000));
  const rencontres = rencontresDuJour(demain);
  if (rencontres.length === 0) return NextResponse.json({ ok: true, rencontres: 0 });

  const resultats = [];
  for (const r of rencontres) {
    const res = await actionEnvoyerLiens(cs.stripe, cs.live, r.creneau, r.numero, { manuel: false, rapport: true });
    resultats.push({ creneau: r.creneau, numero: r.numero, ok: res.ok, envoyes: res.envoyes, echecs: res.echecs.length });
  }
  const echec = resultats.some((r) => r.echecs > 0);
  return NextResponse.json({ ok: !echec, resultats }, { status: echec ? 500 : 200 });
}
