import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ===================================================================
// POST /api/stripe/webhook
//
// Endpoint serveur destiné UNIQUEMENT à Stripe. Reçoit les événements
// de paiement / abonnement, vérifie la signature et synchronise la
// table `profiles` via le service role Supabase (bypass RLS).
//
// Mode dormant : tant que process.env.STRIPE_ENABLED !== "true", la
// route renvoie 200 avec { received:true, ignored:true } pour éviter
// que Stripe accumule des retries pendant la phase de préparation.
// Aucune écriture DB, aucune initialisation Stripe, aucun calcul.
//
// Sécurité :
//   - signature Stripe vérifiée AVANT toute lecture du body en JSON ;
//   - service role utilisé exclusivement côté serveur ;
//   - jamais de secret loggué ;
//   - cette route est le SEUL endroit qui peut activer
//     `is_subscribed = true`. /api/subscribe ne touche pas à ce champ.
//
// Idempotence V1 :
//   - les updates écrivent les mêmes valeurs si l'event est rejoué ;
//   - aucun incrément ni création multiple ;
//   - en cas de besoin avant lancement public large, prévoir une
//     table `stripe_processed_events (event_id PK)` pour dédupliquer
//     strictement (cf. TODO ci-dessous).
// ===================================================================

export const runtime = "nodejs";

type SubscriptionPlan = "monthly" | "yearly";

// ─── Helpers locaux ────────────────────────────────────────────────

function unixToIso(seconds: number | null | undefined): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  return new Date(seconds * 1000).toISOString();
}

function isActiveSubscriptionStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}

function getCustomerIdFromSession(
  customer:
    | string
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | null
    | undefined
): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  return customer.id ?? null;
}

function getCustomerIdFromSubscription(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer
): string | null {
  if (typeof customer === "string") return customer;
  return customer?.id ?? null;
}

function getPriceIdFromSubscription(
  subscription: Stripe.Subscription
): string | null {
  const item = subscription.items?.data?.[0];
  return item?.price?.id ?? null;
}

function getPlanFromMetadataOrPriceId(
  metadataPlan: string | undefined,
  priceId: string | null,
  monthlyId: string | undefined,
  yearlyId: string | undefined
): SubscriptionPlan | null {
  if (metadataPlan === "monthly" || metadataPlan === "yearly") {
    return metadataPlan;
  }
  if (priceId && monthlyId && priceId === monthlyId) return "monthly";
  if (priceId && yearlyId && priceId === yearlyId) return "yearly";
  return null;
}

// Compat Stripe API : `current_period_end` est sur la subscription dans
// les anciennes versions API et sur le premier item dans les plus
// récentes. On lit prudemment les deux.
function getCurrentPeriodEnd(subscription: Stripe.Subscription): number | null {
  const sub = subscription as unknown as {
    current_period_end?: number;
    items?: { data?: Array<{ current_period_end?: number }> };
  };
  if (typeof sub.current_period_end === "number") {
    return sub.current_period_end;
  }
  const item = sub.items?.data?.[0];
  if (item && typeof item.current_period_end === "number") {
    return item.current_period_end;
  }
  return null;
}

async function resolveUserId(
  supabase: SupabaseClient,
  metadataUserId: string | undefined,
  customerId: string | null
): Promise<string | null> {
  if (typeof metadataUserId === "string" && metadataUserId.length > 0) {
    return metadataUserId;
  }
  if (!customerId) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  const id = (data as { id?: string } | null)?.id;
  return typeof id === "string" ? id : null;
}

// ─── Handler ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Drapeau dormant — court-circuit propre pour Stripe.
  if (process.env.STRIPE_ENABLED !== "true") {
    return NextResponse.json(
      { received: true, ignored: true, code: "stripe_disabled" },
      { status: 200 }
    );
  }

  // 2. Validation des variables nécessaires.
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY_ID;
  const yearlyPriceId = process.env.STRIPE_PRICE_YEARLY_ID;

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    console.error("[STRIPE WEBHOOK] Configuration manquante", {
      hasStripeSecret: !!stripeSecretKey,
      hasWebhookSecret: !!webhookSecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!serviceKey,
    });
    return NextResponse.json(
      { error: "Configuration serveur incomplète." },
      { status: 500 }
    );
  }

  // 3. Lire signature et body brut AVANT tout JSON.parse.
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.warn("[STRIPE WEBHOOK] En-tête stripe-signature manquant");
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const rawBody = await request.text();

  // 4. Vérifier la signature Stripe.
  const stripe = new Stripe(stripeSecretKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[STRIPE WEBHOOK] Signature invalide:", msg);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  // 5. Initialiser Supabase service role (bypass RLS — webhook signé).
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // TODO : ajouter une table stripe_processed_events (event_id PK) pour
  // une idempotence stricte avant lancement public large si nécessaire.

  // 6. Dispatcher selon event.type.
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") {
          console.log(
            "[STRIPE WEBHOOK] checkout.session.completed ignoré (mode:",
            session.mode,
            ") event:",
            event.id
          );
          break;
        }
        const userId =
          (typeof session.client_reference_id === "string" &&
            session.client_reference_id) ||
          (typeof session.metadata?.user_id === "string" &&
            session.metadata.user_id) ||
          null;
        if (!userId) {
          console.warn(
            "[STRIPE WEBHOOK] checkout.session.completed sans user_id, event:",
            event.id
          );
          break;
        }
        const customerId = getCustomerIdFromSession(session.customer ?? null);
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;

        const update: Record<string, unknown> = {};
        if (customerId) update.stripe_customer_id = customerId;
        if (subscriptionId) update.stripe_subscription_id = subscriptionId;

        if (Object.keys(update).length > 0) {
          const { error } = await supabase
            .from("profiles")
            .update(update)
            .eq("id", userId);
          if (error) {
            console.error(
              "[STRIPE WEBHOOK] Update échec checkout.session.completed user:",
              userId.slice(0, 8),
              "event:",
              event.id,
              "err:",
              error.message
            );
          }
        }
        console.log(
          "[STRIPE WEBHOOK] checkout.session.completed traité, user:",
          userId.slice(0, 8),
          "event:",
          event.id
        );
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerIdFromSubscription(subscription.customer);
        const metadataUserId =
          typeof subscription.metadata?.user_id === "string"
            ? subscription.metadata.user_id
            : undefined;
        const userId = await resolveUserId(
          supabase,
          metadataUserId,
          customerId
        );
        if (!userId) {
          console.warn(
            "[STRIPE WEBHOOK]",
            event.type,
            "sans user_id résolvable, event:",
            event.id
          );
          break;
        }

        const priceId = getPriceIdFromSubscription(subscription);
        const plan = getPlanFromMetadataOrPriceId(
          subscription.metadata?.plan,
          priceId,
          monthlyPriceId,
          yearlyPriceId
        );
        const status = subscription.status;
        const isActive = isActiveSubscriptionStatus(status);

        // Annulation programmée — Stripe peut la représenter de deux
        // façons sémantiquement équivalentes :
        //   - cancel_at_period_end === true (API directe legacy)
        //   - cancel_at = <unix timestamp> avec cancel_at_period_end
        //     === false (Billing Portal "Cancel at end of period")
        // On reconnaît les deux pour mettre à jour le flag DB
        // `subscription_cancel_at_period_end`.
        const isCancelScheduled =
          subscription.cancel_at_period_end === true ||
          (typeof subscription.cancel_at === "number" &&
            subscription.cancel_at > 0);

        // Préserver subscribed_at si déjà défini.
        const { data: existing } = await supabase
          .from("profiles")
          .select("subscribed_at")
          .eq("id", userId)
          .single();
        const existingSubscribedAt =
          (existing as { subscribed_at?: string | null } | null)
            ?.subscribed_at ?? null;

        const update: Record<string, unknown> = {
          is_subscribed: isActive,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: status,
          stripe_price_id: priceId,
          subscription_plan: plan,
          subscription_current_period_end: unixToIso(
            getCurrentPeriodEnd(subscription)
          ),
          subscription_cancel_at_period_end: isCancelScheduled,
          subscription_canceled_at: unixToIso(subscription.canceled_at),
        };
        if (customerId) update.stripe_customer_id = customerId;
        if (isActive && !existingSubscribedAt) {
          update.subscribed_at = new Date().toISOString();
        }
        if (!isActive) {
          update.unsubscribed_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from("profiles")
          .update(update)
          .eq("id", userId);
        if (error) {
          console.error(
            "[STRIPE WEBHOOK] Update échec",
            event.type,
            "user:",
            userId.slice(0, 8),
            "event:",
            event.id,
            "err:",
            error.message
          );
        } else {
          console.log(
            "[STRIPE WEBHOOK]",
            event.type,
            "traité, user:",
            userId.slice(0, 8),
            "status:",
            status,
            "event:",
            event.id
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerIdFromSubscription(subscription.customer);
        const metadataUserId =
          typeof subscription.metadata?.user_id === "string"
            ? subscription.metadata.user_id
            : undefined;
        const userId = await resolveUserId(
          supabase,
          metadataUserId,
          customerId
        );
        if (!userId) {
          console.warn(
            "[STRIPE WEBHOOK] customer.subscription.deleted sans user_id résolvable, event:",
            event.id
          );
          break;
        }

        const update: Record<string, unknown> = {
          is_subscribed: false,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: "canceled",
          subscription_cancel_at_period_end: false,
          subscription_canceled_at:
            unixToIso(subscription.canceled_at) ??
            new Date().toISOString(),
          unsubscribed_at: new Date().toISOString(),
        };
        if (customerId) update.stripe_customer_id = customerId;

        const { error } = await supabase
          .from("profiles")
          .update(update)
          .eq("id", userId);
        if (error) {
          console.error(
            "[STRIPE WEBHOOK] Update échec customer.subscription.deleted user:",
            userId.slice(0, 8),
            "event:",
            event.id,
            "err:",
            error.message
          );
        } else {
          console.log(
            "[STRIPE WEBHOOK] customer.subscription.deleted traité, user:",
            userId.slice(0, 8),
            "event:",
            event.id
          );
        }
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        // V1 : log uniquement. Le statut effectif sera synchronisé par
        // customer.subscription.updated qui suit nécessairement.
        console.log(
          "[STRIPE WEBHOOK]",
          event.type,
          "reçu (log only en V1), event:",
          event.id
        );
        break;
      }

      default: {
        console.log(
          "[STRIPE WEBHOOK] Event ignoré:",
          event.type,
          "event:",
          event.id
        );
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(
      "[STRIPE WEBHOOK] Exception traitement event:",
      event.type,
      "event:",
      event.id,
      "err:",
      msg
    );
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
