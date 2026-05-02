import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ===================================================================
// POST /api/subscribe
//
// Crée une Stripe Checkout Session pour souscrire à l'abonnement
// Premium TRACÉA (mensuel 9 €/mois ou annuel 78 €/an).
//
// Mode dormant : tant que process.env.STRIPE_ENABLED !== "true",
// la route renvoie 403 "Paiement non encore activé." sans initialiser
// Stripe, sans appeler la DB et sans écrire de données.
//
// Sécurité :
//   - prix sélectionné côté serveur uniquement à partir d'env vars ;
//   - jamais d'écriture de `is_subscribed` dans cette route :
//     l'activation Premium se fera plus tard via webhook Stripe ;
//   - `stripe_customer_id` est persisté via service role (bypass RLS),
//     mais reste protégé côté client par les policies RLS Stripe.
// ===================================================================

type Plan = "monthly" | "yearly";

function isValidPlan(value: unknown): value is Plan {
  return value === "monthly" || value === "yearly";
}

export async function POST(request: NextRequest) {
  // 1. Drapeau dormant — court-circuit si Stripe pas encore activé.
  if (process.env.STRIPE_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Paiement non encore activé.", code: "stripe_disabled" },
      { status: 403 }
    );
  }

  try {
    // 2. Authentification — Bearer token Supabase
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
    if (!token) {
      return NextResponse.json(
        { error: "Non authentifié", code: "unauthenticated" },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[SUBSCRIBE] Configuration Supabase manquante");
      return NextResponse.json(
        { error: "Configuration serveur incomplète.", code: "supabase_config_missing" },
        { status: 500 }
      );
    }

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseAnon.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Non authentifié", code: "unauthenticated" },
        { status: 401 }
      );
    }
    const userId = authUser.id;
    const userEmail = authUser.email ?? undefined;

    // 3. Validation du body
    let plan: Plan;
    try {
      const body = await request.json();
      if (!isValidPlan(body?.plan)) {
        return NextResponse.json(
          { error: "Plan invalide.", code: "invalid_plan" },
          { status: 400 }
        );
      }
      plan = body.plan;
    } catch {
      return NextResponse.json(
        { error: "Corps de requête invalide.", code: "invalid_body" },
        { status: 400 }
      );
    }

    // 4. Validation des variables Stripe + service role
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePriceMonthlyId = process.env.STRIPE_PRICE_MONTHLY_ID;
    const stripePriceYearlyId = process.env.STRIPE_PRICE_YEARLY_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !stripeSecretKey ||
      !stripePriceMonthlyId ||
      !stripePriceYearlyId ||
      !appUrl ||
      !serviceKey
    ) {
      console.error("[SUBSCRIBE] Variables Stripe ou service role manquantes", {
        hasSecret: !!stripeSecretKey,
        hasMonthly: !!stripePriceMonthlyId,
        hasYearly: !!stripePriceYearlyId,
        hasAppUrl: !!appUrl,
        hasServiceKey: !!serviceKey,
      });
      return NextResponse.json(
        { error: "Configuration serveur incomplète.", code: "stripe_config_missing" },
        { status: 500 }
      );
    }

    // 5. Sélection du price ID côté serveur (jamais d'après le client)
    const priceId =
      plan === "monthly" ? stripePriceMonthlyId : stripePriceYearlyId;

    // 6. Lecture du profil via service role (bypass RLS)
    const supabaseService = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: profile, error: profileError } = await supabaseService
      .from("profiles")
      .select("is_subscribed, is_beta_tester, stripe_customer_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.warn(
        "[SUBSCRIBE] Profil introuvable pour:",
        userId.slice(0, 8),
        profileError?.message
      );
      return NextResponse.json(
        { error: "Profil introuvable.", code: "profile_not_found" },
        { status: 404 }
      );
    }

    // 7. Court-circuit : déjà abonné ou bêta — pas de checkout
    if (profile.is_subscribed === true) {
      return NextResponse.json(
        { error: "Abonnement déjà actif.", code: "already_subscribed" },
        { status: 409 }
      );
    }
    if (profile.is_beta_tester === true) {
      return NextResponse.json(
        { error: "Accès bêta actif.", code: "already_beta" },
        { status: 409 }
      );
    }

    // 8. Initialisation Stripe (uniquement après validations)
    const stripe = new Stripe(stripeSecretKey);

    // 9. Réutilisation ou création du customer Stripe
    let stripeCustomerId: string | null =
      typeof profile.stripe_customer_id === "string" &&
      profile.stripe_customer_id.length > 0
        ? profile.stripe_customer_id
        : null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { user_id: userId },
      });
      stripeCustomerId = customer.id;

      // Persister stripe_customer_id côté DB (service role bypass RLS)
      const { error: updateError } = await supabaseService
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", userId);

      if (updateError) {
        console.error(
          "[SUBSCRIBE] Échec persistance stripe_customer_id pour:",
          userId.slice(0, 8),
          updateError.message
        );
        return NextResponse.json(
          { error: "Erreur serveur.", code: "customer_persist_failed" },
          { status: 500 }
        );
      }
    }

    // 10. Création de la Checkout Session — mode subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      metadata: { user_id: userId, plan },
      subscription_data: {
        metadata: { user_id: userId, plan },
      },
      success_url: `${appUrl}/app/subscribe?checkout=success`,
      cancel_url: `${appUrl}/app/subscribe?checkout=cancel`,
      locale: "fr",
      allow_promotion_codes: false,
    });

    if (!session.url) {
      console.error(
        "[SUBSCRIBE] Stripe a renvoyé une session sans URL pour:",
        userId.slice(0, 8)
      );
      return NextResponse.json(
        { error: "Erreur serveur.", code: "no_session_url" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[SUBSCRIBE] Exception:", msg);
    return NextResponse.json(
      { error: "Erreur serveur.", code: "server_error" },
      { status: 500 }
    );
  }
}
