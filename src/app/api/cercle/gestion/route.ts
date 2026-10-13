import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { verifierAcces } from "@/lib/cercle/auth";
import { FERMETURE } from "@/lib/cercle/config";
import { getCercleStripe } from "@/lib/cercle/stripe";
import {
  actionAnnulerCycle,
  actionConfirmer,
  actionEffacer,
  actionEnvoyerLiens,
  actionMarquerRemboursement,
  actionProposerAutre,
  destinatairesLiens,
  echeanceEffacement,
  estActive,
  listerPersonnes,
  premiereEcheance,
  remboursementDu,
  resteARembourser,
} from "@/lib/cercle/gestion";
import { lienZoom, toutesLesRencontres } from "@/lib/cercle/rencontres";

// ===================================================================
// /api/cercle/gestion — page privée de gestion du cycle
//
// Protégée par un code (en-tête « x-cercle-code », cf. lib/cercle/auth).
// GET  : liste des inscrites, rencontres, remboursements, effacement.
// POST : { action: "confirmer" | "proposer_autre" | "annuler_cycle" |
//          "envoyer_liens" | "effacer", … }
// Aucune donnée Supabase. Le téléphone et la commune ne sont jamais lus.
// ===================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reponse(status: number, message: string) {
  return NextResponse.json({ ok: false, message }, { status });
}

function acces(request: NextRequest) {
  const ip = getClientIp(request.headers) ?? "unknown";
  const v = verifierAcces(request, ip);
  if (!v.ok) return { erreur: reponse(v.status, v.message) };
  const cs = getCercleStripe({ ignorerOuverture: true });
  if (!cs.ok) {
    return {
      erreur: reponse(503, "Stripe n'est pas utilisable pour le Cercle (clé absente ou refusée) : voir la section « Réglages »."),
    };
  }
  return { cs };
}

export async function GET(request: NextRequest) {
  const a = acces(request);
  if (a.erreur) return a.erreur;
  const { stripe, live } = a.cs;
  try {
    const personnes = await listerPersonnes(stripe, live);
    const maintenant = new Date();
    return NextResponse.json({
      ok: true,
      mode: live ? "reel" : "test",
      fermeture: FERMETURE.toISOString(),
      zoom: { vendredi: !!lienZoom("vendredi"), mardi: !!lienZoom("mardi") },
      personnes: personnes.map((p) => ({
        reference: p.reference,
        prenom: p.prenom,
        email: p.email,
        creneau: p.creneau,
        participation: p.participation,
        prochainCycle: p.prochainCycle,
        payeLe: p.payeLe.toISOString(),
        paiementUrl: p.paiementUrl,
        montantCentimes: p.montantCentimes,
        rembourseCentimes: p.rembourseCentimes,
        creneauConfirme: p.creneauConfirme,
        groupeConfirmeLe: p.groupeConfirmeLe,
        autreProposeLe: p.autreProposeLe,
        remboursementDemandeLe: p.remboursementDemandeLe,
        cycleAnnuleLe: p.cycleAnnuleLe,
        retractationLe: p.retractationLe,
        retractationHorsDelai: p.retractationHorsDelai,
        du: remboursementDu(p),
        reste: resteARembourser(p),
        effaceLe: p.effaceLe,
        active: estActive(p),
        echeanceEffacement: echeanceEffacement(p).toISOString(),
      })),
      rencontres: toutesLesRencontres().map((r) => {
        const dest = destinatairesLiens(personnes, r.creneau);
        const cle = `${r.creneau}_${r.numero}`;
        return {
          creneau: r.creneau,
          numero: r.numero,
          libelle: r.libelle,
          passee: r.date.getTime() < maintenant.getTime(),
          destinataires: dest.length,
          dejaEnvoyes: dest.filter((p) => p.liensEnvoyes.includes(cle)).length,
        };
      }),
      effacement: {
        premiereEcheance: premiereEcheance().toISOString(),
        aEffacer: personnes.filter((p) => !p.effaceLe).length,
        effaces: personnes.filter((p) => p.effaceLe).length,
      },
    });
  } catch (err) {
    console.error("[CERCLE] Gestion, lecture impossible:", err instanceof Error ? err.message : err);
    return reponse(500, "Stripe ne répond pas pour le moment. Réessaie dans un instant.");
  }
}

export async function POST(request: NextRequest) {
  const a = acces(request);
  if (a.erreur) return a.erreur;
  const { stripe, live } = a.cs;

  const cl = request.headers.get("content-length");
  if (cl && parseInt(cl, 10) > 2_048) return reponse(413, "Requête trop grande.");
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return reponse(400, "Requête invalide.");
  }

  try {
    switch (body.action) {
      case "confirmer": {
        const r = await actionConfirmer(stripe, live, String(body.reference ?? ""), body.creneau);
        return NextResponse.json(r, { status: r.ok ? 200 : 409 });
      }
      case "proposer_autre": {
        const r = await actionProposerAutre(stripe, live, String(body.reference ?? ""));
        return NextResponse.json(r, { status: r.ok ? 200 : 409 });
      }
      case "marquer_remboursement": {
        const r = await actionMarquerRemboursement(stripe, live, String(body.reference ?? ""));
        return NextResponse.json(r, { status: r.ok ? 200 : 409 });
      }
      case "annuler_cycle": {
        const r = await actionAnnulerCycle(stripe, live);
        return NextResponse.json(r, { status: r.ok ? 200 : 409 });
      }
      case "envoyer_liens": {
        const r = await actionEnvoyerLiens(stripe, live, body.creneau, body.numero, { manuel: true, rapport: false });
        return NextResponse.json(r, { status: r.ok ? 200 : 409 });
      }
      case "effacer": {
        const r = await actionEffacer(stripe, live, { manuel: true, forcer: body.forcer === true });
        return NextResponse.json(r, { status: r.ok ? 200 : 409 });
      }
      default:
        return reponse(400, "Action inconnue.");
    }
  } catch (err) {
    console.error("[CERCLE] Gestion, action échouée:", err instanceof Error ? err.message : err);
    return reponse(500, "L'action n'a pas abouti. Réessaie dans un instant.");
  }
}
