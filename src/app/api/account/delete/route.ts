import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ===================================================================
// POST /api/account/delete
//
// Suppression de compte utilisateur, avec garde-fou Stripe :
//   - bloque la suppression si un abonnement Stripe actif ou à
//     traiter est détecté (active, trialing, past_due, unpaid,
//     incomplete) ou si is_subscribed est true ;
//   - sinon supprime les 8 tables utilisateur via service role,
//     puis l'enregistrement auth.users via auth.admin.deleteUser.
//
// Sécurité :
//   - userId issu uniquement du Bearer token vérifié ;
//   - service role utilisé exclusivement côté serveur (bypass RLS,
//     accès aux tables sensibles et à auth.admin) ;
//   - aucune annulation Stripe automatique : la résiliation reste
//     un acte explicite de l'utilisateur via le Billing Portal,
//     conforme aux CGU §11 (pas de remboursement automatique).
// ===================================================================

export const runtime = "nodejs";

// Statuts Stripe considérés comme terminaux : aucune obligation de
// gestion résiduelle côté Stripe, donc la suppression est autorisée
// (à condition que is_subscribed soit false). Tout autre statut, ou
// un statut absent alors qu'un stripe_subscription_id existe, doit
// bloquer la suppression — défense en profondeur contre les états
// inattendus ou les futurs statuts Stripe non encore mappés.
const TERMINAL_STRIPE_STATUSES = new Set([
  "canceled",
  "incomplete_expired",
]);

// Tables enfants à supprimer avant `profiles`. Toutes utilisent
// `user_id` comme clé de filtrage (vérifié dans le code applicatif).
const CHILD_TABLES = [
  "session_summaries",
  "user_memory_profile",
  "tracea_events",
  "ai_usage_logs",
  "rate_limit_logs",
  "sessions",
  "consent_logs",
] as const;

export async function POST(request: NextRequest) {
  try {
    // 1. Bearer token Supabase obligatoire.
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
    if (!token) {
      return NextResponse.json(
        { error: "Non authentifié.", code: "unauthenticated" },
        { status: 401 }
      );
    }

    // 2. Variables Supabase obligatoires.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
      console.error("[ACCOUNT DELETE] Configuration Supabase manquante", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasSupabaseAnonKey: Boolean(supabaseAnonKey),
        hasServiceKey: Boolean(serviceKey),
      });
      return NextResponse.json(
        {
          error: "Configuration serveur incomplète.",
          code: "supabase_config_missing",
        },
        { status: 500 }
      );
    }

    // 3. Vérifier le token via Supabase Auth.
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

    // 4. Service client (bypass RLS, accès auth.admin).
    const supabaseService = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 5. Lire le profil pour détecter un état Stripe bloquant.
    const { data: profile, error: profileError } = await supabaseService
      .from("profiles")
      .select(
        "id, is_subscribed, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, subscription_cancel_at_period_end"
      )
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      // Cas de reprise — token Supabase valide mais profil absent.
      // Cela peut survenir si une suppression précédente a réussi côté
      // DB mais a échoué sur `auth.admin.deleteUser` (auth.users
      // orphelin). On tente alors un cleanup auth direct pour ne pas
      // laisser le compte définitivement bloqué.
      console.warn(
        "[ACCOUNT DELETE] Profil introuvable — tentative cleanup auth.users pour:",
        userId.slice(0, 8),
        profileError?.message
      );
      const { error: authCleanupError } =
        await supabaseService.auth.admin.deleteUser(userId);
      if (authCleanupError) {
        console.error(
          "[ACCOUNT DELETE] Échec cleanup auth.users (profil absent) user:",
          userId.slice(0, 8),
          "err:",
          authCleanupError.message
        );
        return NextResponse.json(
          {
            error: "La suppression n'a pas pu être terminée.",
            code: "auth_delete_failed",
          },
          { status: 500 }
        );
      }
      console.log(
        "[ACCOUNT DELETE] Auth.users supprimé après reprise (profil absent) user:",
        userId.slice(0, 8)
      );
      return NextResponse.json({ success: true });
    }

    // 6. Garde Stripe — défense en profondeur. La suppression est
    //    bloquée si :
    //      (a) is_subscribed === true ;
    //      (b) un stripe_subscription_id existe avec un statut null
    //          (état désynchronisé : sub_id sans statut connu) ;
    //      (c) le statut Stripe est non terminal, indépendamment de la
    //          présence d'un sub_id. Cela inclut active, trialing,
    //          past_due, unpaid, incomplete, paused, et tout statut
    //          futur non encore mappé.
    //    Tableau de vérité (avec is_subscribed = false) :
    //      sub_id=null,    status=null               → autorisé
    //      sub_id=null,    status=terminal           → autorisé
    //      sub_id=null,    status=non-terminal       → bloqué (c)
    //      sub_id=présent, status=null               → bloqué (b)
    //      sub_id=présent, status=terminal           → autorisé
    //      sub_id=présent, status=non-terminal       → bloqué (c)
    const status =
      typeof profile.stripe_subscription_status === "string"
        ? profile.stripe_subscription_status
        : null;
    const stripeSubscriptionId =
      typeof profile.stripe_subscription_id === "string" &&
      profile.stripe_subscription_id.length > 0
        ? profile.stripe_subscription_id
        : null;
    const hasBlockingStripeState =
      profile.is_subscribed === true ||
      (stripeSubscriptionId !== null && status === null) ||
      (status !== null && !TERMINAL_STRIPE_STATUSES.has(status));

    if (hasBlockingStripeState) {
      console.log(
        "[ACCOUNT DELETE] Suppression bloquée — abonnement actif user:",
        userId.slice(0, 8),
        "status:",
        status,
        "is_subscribed:",
        profile.is_subscribed === true
      );
      return NextResponse.json(
        {
          error: "Abonnement actif ou à gérer avant suppression du compte.",
          code: "active_subscription",
        },
        { status: 409 }
      );
    }

    // 7. Suppression des 7 tables enfants (séquentiel, abort à la
    //    première erreur — on ne supprime pas auth.users si une étape
    //    DB précédente a échoué, conformément à la spec).
    for (const table of CHILD_TABLES) {
      const { error } = await supabaseService
        .from(table)
        .delete()
        .eq("user_id", userId);
      if (error) {
        console.error(
          "[ACCOUNT DELETE] Échec suppression table",
          table,
          "user:",
          userId.slice(0, 8),
          "err:",
          error.message
        );
        return NextResponse.json(
          {
            error: "La suppression n'a pas pu être terminée.",
            code: "delete_failed",
          },
          { status: 500 }
        );
      }
    }

    // 8. Suppression du profil (clé primaire `id`, pas `user_id`).
    const { error: profileDeleteError } = await supabaseService
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profileDeleteError) {
      console.error(
        "[ACCOUNT DELETE] Échec suppression profile user:",
        userId.slice(0, 8),
        "err:",
        profileDeleteError.message
      );
      return NextResponse.json(
        {
          error: "La suppression n'a pas pu être terminée.",
          code: "delete_failed",
        },
        { status: 500 }
      );
    }

    // 9. Suppression de auth.users — étape obligatoire de la
    //    suppression complète. Si elle échoue, on retourne 500
    //    `auth_delete_failed` : l'utilisateur peut relancer la
    //    suppression et la branche "profil introuvable" ci-dessus
    //    finalisera le cleanup auth lors d'une prochaine tentative.
    const { error: authDeleteError } =
      await supabaseService.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      console.error(
        "[ACCOUNT DELETE] Échec auth.admin.deleteUser après suppression DB user:",
        userId.slice(0, 8),
        "err:",
        authDeleteError.message
      );
      return NextResponse.json(
        {
          error: "La suppression n'a pas pu être terminée.",
          code: "auth_delete_failed",
        },
        { status: 500 }
      );
    }

    console.log(
      "[ACCOUNT DELETE] Suppression complète user:",
      userId.slice(0, 8)
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[ACCOUNT DELETE] Exception:", msg);
    return NextResponse.json(
      { error: "Erreur serveur.", code: "server_error" },
      { status: 500 }
    );
  }
}
