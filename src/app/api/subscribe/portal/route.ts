import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ===================================================================
// POST /api/subscribe/portal
//
// Crée une Stripe Billing Portal Session pour qu'un utilisateur
// abonné (ou ayant un stripe_customer_id) puisse :
//   - mettre à jour son moyen de paiement ;
//   - consulter son historique de factures ;
//   - résilier son abonnement (CGU §9 — résiliation en ligne).
//
// Mode dormant : tant que process.env.STRIPE_ENABLED !== "true", la
// route renvoie 403 "Paiement non encore activé." sans initialiser
// Stripe ni Supabase et sans lire la DB.
//
// Sécurité :
//   - userId issu uniquement du Bearer token Supabase ;
//   - stripe_customer_id lu uniquement depuis profiles via service role ;
//   - aucune écriture DB ; aucune modification de is_subscribed ou des
//     champs subscription_* (ces écritures sont la prérogative
//     exclusive du webhook /api/stripe/webhook).
// ===================================================================

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // 1. Drapeau dormant — court-circuit si Stripe pas encore activé.
  if (process.env.STRIPE_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Paiement non encore activé.", code: "stripe_disabled" },
      { status: 403 }
    );
  }

  try {
    // 2. Authentification — Bearer token Supabase.
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
    if (!token) {
      return NextResponse.json(
        { error: "Non authentifié.", code: "unauthenticated" },
        { status: 401 }
      );
    }

    // 3. Variables Supabase obligatoires.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
      console.error("[SUBSCRIBE PORTAL] Configuration Supabase manquante", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasSupabaseAnonKey: Boolean(supabaseAnonKey),
        hasServiceKey: Boolean(serviceKey),
      });
      return NextResponse.json(
        { error: "Configuration Supabase manquante.", code: "supabase_config_missing" },
        { status: 500 }
      );
    }

    // 4. Vérifier le token via Supabase Auth.
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseAnon.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Non authentifié.", code: "unauthenticated" },
        { status: 401 }
      );
    }
    const userId = authUser.id;

    // 5. Variables Stripe obligatoires.
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!stripeSecretKey || !appUrl) {
      console.error("[SUBSCRIBE PORTAL] Configuration Stripe manquante", {
        hasStripeSecret: Boolean(stripeSecretKey),
        hasAppUrl: Boolean(appUrl),
      });
      return NextResponse.json(
        { error: "Configuration Stripe manquante.", code: "stripe_config_missing" },
        { status: 500 }
      );
    }

    // 6. Lecture du profil via service role (bypass RLS).
    const supabaseService = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: profile, error: profileError } = await supabaseService
      .from("profiles")
      .select(
        "id, stripe_customer_id, is_subscribed, is_beta_tester, stripe_subscription_status"
      )
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.warn(
        "[SUBSCRIBE PORTAL] Profil introuvable pour:",
        userId.slice(0, 8),
        profileError?.message
      );
      return NextResponse.json(
        { error: "Profil introuvable.", code: "profile_not_found" },
        { status: 404 }
      );
    }

    // 7. Gate sur stripe_customer_id — couvre :
    //    - utilisateurs gratuits / bêta jamais souscrits (refus propre) ;
    //    - utilisateurs ayant souscrit puis annulé (autorisé pour
    //      consulter factures et historique).
    const stripeCustomerId =
      typeof profile.stripe_customer_id === "string" &&
      profile.stripe_customer_id.length > 0
        ? profile.stripe_customer_id
        : null;
    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error: "Aucun client Stripe associé à ce compte.",
          code: "no_stripe_customer",
        },
        { status: 403 }
      );
    }

    // 8. Initialisation Stripe (uniquement après toutes les validations).
    const stripe = new Stripe(stripeSecretKey);

    // 9. Création de la session Billing Portal.
    //    `configuration` est optionnel : sans STRIPE_PORTAL_CONFIG_ID,
    //    Stripe utilise la configuration par défaut du Dashboard.
    const portalConfigId = process.env.STRIPE_PORTAL_CONFIG_ID;
    const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: stripeCustomerId,
      return_url: `${appUrl}/app/profil`,
    };
    if (portalConfigId && portalConfigId.length > 0) {
      sessionParams.configuration = portalConfigId;
    }

    const session = await stripe.billingPortal.sessions.create(sessionParams);

    if (!session.url) {
      console.error(
        "[SUBSCRIBE PORTAL] Stripe a renvoyé une session sans URL pour:",
        userId.slice(0, 8)
      );
      return NextResponse.json(
        { error: "Impossible de créer la session portail.", code: "portal_session_failed" },
        { status: 500 }
      );
    }

    console.log(
      "[SUBSCRIBE PORTAL] Session portail créée pour:",
      userId.slice(0, 8)
    );

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[SUBSCRIBE PORTAL] Exception:", msg);
    return NextResponse.json(
      { error: "Erreur serveur.", code: "server_error" },
      { status: 500 }
    );
  }
}
