import { NextRequest, NextResponse } from "next/server";
import { getCercleStripe } from "@/lib/cercle/stripe";
import { actionEffacer } from "@/lib/cercle/gestion";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// =====================================================================
// GET /api/cron/cercle-effacement
//
// Tâche Vercel quotidienne du 15 au 31 décembre (08 h UTC). Efface le
// téléphone, la commune, le prénom et la façon de participer des paiements
// du Cercle une semaine après la dernière rencontre de chaque groupe
// (mardi : 15 décembre, vendredi : 18 décembre 2026), ainsi que l'adresse
// email des personnes qui n'ont pas coché « prochain cycle ». Les adresses
// gardées pour le prochain cycle sont supprimées un an plus tard (la tâche
// repasse chaque année du 15 au 31 décembre). Envoie un compte rendu par
// email à cercledeparole@ dès qu'elle a effacé quelque chose.
// Les tâches Vercel ne tournent qu'en PRODUCTION.
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

  const r = await actionEffacer(cs.stripe, cs.live, { manuel: false });
  return NextResponse.json(
    { ok: r.ok, effaces: r.effaces, emailsSupprimes: r.emailsSupprimes, emailsConserves: r.emailsConserves, echecs: r.echecs },
    { status: r.ok ? 200 : 500 }
  );
}
