import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CYCLE_ID } from "@/lib/cercle/config";
import { getCercleStripe } from "@/lib/cercle/stripe";
import { envoyerEmailsInscription } from "@/lib/cercle/inscriptions";

// ===================================================================
// POST /api/cercle/webhook — événements Stripe du Cercle
//
// Reçoit « checkout.session.completed » et envoie, une seule fois, la
// confirmation à la personne et la notification à Alyson. Séparé du
// webhook de l'application (/api/stripe/webhook), qui ignore déjà les
// paiements uniques ; aucune donnée Supabase.
//
// Réglage : CERCLE_STRIPE_WEBHOOK_SECRET (clé de signature « whsec_… » du
// point de terminaison créé dans Stripe pour cette adresse).
// Si le Cercle n'est pas réglé (secret ou clé Stripe absents), la route
// répond 503 : l'oubli se voit dans le tableau de bord Stripe.
// Filet de sécurité : la page /cercle/merci déclenche le même envoi (avec
// la même clé d'idempotence, donc sans doublon).
// ===================================================================

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.CERCLE_STRIPE_WEBHOOK_SECRET;
  const cs = getCercleStripe({ ignorerOuverture: true });
  if (!secret || !cs.ok) {
    // Cercle non réglé : refus net (503), pour qu'un oubli soit VISIBLE dans
    // Stripe (échecs de livraison du point de terminaison). Aucun traitement.
    console.warn(
      "[CERCLE] Webhook refusé, réglage manquant:",
      !secret ? "CERCLE_STRIPE_WEBHOOK_SECRET" : cs.ok ? "" : cs.reason
    );
    return NextResponse.json({ error: "Le Cercle n'est pas réglé." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = cs.stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.cercle !== CYCLE_ID) {
    // Paiement d'une autre activité (par exemple l'application) : ignoré.
    return NextResponse.json({ received: true, ignored: true }, { status: 200 });
  }

  const r = await envoyerEmailsInscription(cs.stripe, cs.live, session.id);
  if (!r.ok && r.raison === "erreur_email") {
    // 500 : Stripe rejouera l'événement (sans doublon grâce à l'idempotence).
    return NextResponse.json({ error: "Envoi impossible" }, { status: 500 });
  }
  return NextResponse.json({ received: true }, { status: 200 });
}
