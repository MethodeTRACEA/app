import Stripe from "stripe";
import { CYCLE_ID, calculerPlaces, type PlacesState } from "./config";

// ===================================================================
// Le Cercle TRACÉA en ligne — accès Stripe (SERVEUR UNIQUEMENT)
//
// Réglages propres au Cercle, indépendants des abonnements de l'app
// (STRIPE_ENABLED / STRIPE_SECRET_KEY ne sont ni lus ni modifiés ici) :
//   CERCLE_INSCRIPTIONS_ACTIVES = "true"   ouvre le formulaire
//   CERCLE_STRIPE_SECRET_KEY    = sk_test_… (mode test)
//   CERCLE_STRIPE_LIVE          = "true"   seul moyen d'accepter une clé
//                                          live (vrais paiements)
//
// Aucune base de données : Stripe est le seul registre des inscriptions.
// ===================================================================

const PRICE_LOOKUP_KEY = "cercle_pilote_2026_12eur";
const PRODUCT_NAME = "Cercle TRACÉA en ligne";
const PRICE_CENTS = 1200;

// Début du cycle d'inscriptions : on ne compte que les paiements créés
// après cette date (évite de relire tout l'historique Stripe).
const CYCLE_START_UNIX = Math.floor(
  new Date("2026-10-13T00:00:00+02:00").getTime() / 1000
);

export type CercleStripeStatus =
  | { ok: true; stripe: Stripe; live: boolean }
  | { ok: false; reason: "inactive" | "missing_key" | "live_refused" };

// `ignorerOuverture` : pour la rétractation et les emails, qui doivent
// continuer à fonctionner même si les inscriptions sont fermées (le
// droit de se rétracter ne dépend pas de l'interrupteur d'ouverture).
// Le garde-fou contre les vraies clés reste le même.
export function getCercleStripe(
  opts: { ignorerOuverture?: boolean } = {}
): CercleStripeStatus {
  if (!opts.ignorerOuverture && process.env.CERCLE_INSCRIPTIONS_ACTIVES !== "true") {
    return { ok: false, reason: "inactive" };
  }
  const key = process.env.CERCLE_STRIPE_SECRET_KEY;
  if (!key) return { ok: false, reason: "missing_key" };

  const isTest = key.startsWith("sk_test_") || key.startsWith("rk_test_");
  // Garde-fou : une clé live n'est acceptée que si le mode live est
  // explicitement activé. Sans cela, aucun vrai paiement possible.
  if (!isTest && process.env.CERCLE_STRIPE_LIVE !== "true") {
    return { ok: false, reason: "live_refused" };
  }
  return { ok: true, stripe: new Stripe(key), live: !isTest };
}

// Retrouve le prix « Cercle TRACÉA en ligne » à 12 €, ou le crée au
// premier passage (une fois en mode test, une fois en mode live).
export async function getCerclePriceId(stripe: Stripe): Promise<string> {
  const existing = await stripe.prices.list({
    lookup_keys: [PRICE_LOOKUP_KEY],
    active: true,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0].id;

  const product = await stripe.products.create({
    name: PRODUCT_NAME,
    metadata: { activite: "cercle" },
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: PRICE_CENTS,
    currency: "eur",
    lookup_key: PRICE_LOOKUP_KEY,
    metadata: { activite: "cercle" },
  });
  return price.id;
}

// Compte les places prises par créneau :
//   - paiements réussis et non remboursés en totalité ;
//   - paiements en cours (page Stripe ouverte, 30 min max), pour ne
//     jamais vendre plus de places qu'il n'en existe.
export async function compterPlaces(stripe: Stripe): Promise<PlacesState> {
  const counts = { vendredi: 0, mardi: 0, deux: 0 };

  const sessions = stripe.checkout.sessions.list({
    created: { gte: CYCLE_START_UNIX },
    limit: 100,
    expand: ["data.payment_intent.latest_charge"],
  });

  for await (const s of sessions) {
    if (s.metadata?.cercle !== CYCLE_ID) continue;
    const creneau = s.metadata?.creneau;
    if (creneau !== "vendredi" && creneau !== "mardi" && creneau !== "deux") {
      continue;
    }

    let compte = false;
    if (s.status === "open") {
      compte = true;
    } else if (s.status === "complete" && s.payment_status === "paid") {
      const pi = s.payment_intent;
      const charge =
        pi && typeof pi !== "string" ? pi.latest_charge : null;
      const rembourseEnTotalite =
        charge && typeof charge !== "string" ? charge.refunded : false;
      compte = !rembourseEnTotalite;
    }
    if (compte) counts[creneau] += 1;
  }

  return calculerPlaces(counts);
}
