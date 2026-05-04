import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ===================================================================
// POST /api/export
//
// Export RGPD V1 des données utilisateur au format JSON téléchargeable
// (droit à la portabilité, art. 20 RGPD).
//
// Tables incluses :
//   profiles, sessions, session_summaries, user_memory_profile,
//   tracea_events, ai_usage_logs, rate_limit_logs, consent_logs.
//
// Données explicitement exclues :
//   - is_admin (drapeau interne)
//   - stripe_customer_id, stripe_subscription_id, stripe_price_id
//     (identifiants techniques Stripe)
//   - ip_address de rate_limit_logs (donnée de localisation)
//   - hash mots de passe et auth metadata bruts (jamais lus)
//
// Sécurité :
//   - userId issu uniquement du Bearer token vérifié
//   - service role utilisé exclusivement côté serveur (bypass RLS,
//     accès aux tables techniques rate_limit_logs et ai_usage_logs)
//   - filtrage strict WHERE user_id = authUser.id partout
//   - aucune donnée d'un autre utilisateur exposée
//
// Robustesse V1 : fail hard si une table attendue ne peut pas être
// lue, pour ne jamais retourner un export labellisé "complet" alors
// qu'il manque des données.
//
// Logging : best-effort dans tracea_events (event "data_export").
// Si l'insert audit échoue, l'export est tout de même retourné
// (warn loggé en console serveur).
// ===================================================================

export const runtime = "nodejs";

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
      console.error("[ACCOUNT EXPORT] Configuration Supabase manquante", {
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

    // 4. Service client (bypass RLS pour les tables techniques).
    const supabaseService = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 5. Profil — colonnes lisibles par l'utilisateur uniquement.
    //    is_admin, stripe_customer_id, stripe_subscription_id et
    //    stripe_price_id sont volontairement omis du SELECT.
    const { data: profile, error: profileError } = await supabaseService
      .from("profiles")
      .select(
        "display_name, is_beta_tester, is_subscribed, created_at, stripe_subscription_status, subscription_plan, subscription_current_period_end, subscription_cancel_at_period_end, subscription_canceled_at, subscribed_at, unsubscribed_at, trial_used, trial_ends_at, trial_deep_sessions_used"
      )
      .eq("id", userId)
      .single();
    if (profileError || !profile) {
      console.error(
        "[ACCOUNT EXPORT] Profil introuvable user:",
        userId.slice(0, 8),
        profileError?.message
      );
      return NextResponse.json(
        { error: "Export impossible.", code: "profile_not_found" },
        { status: 500 }
      );
    }

    // 6. Lectures parallèles — fail hard si une lecture échoue.
    const [
      sessionsRes,
      summariesRes,
      memoryRes,
      eventsRes,
      aiLogsRes,
      rateLimitRes,
      consentRes,
    ] = await Promise.all([
      supabaseService
        .from("sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabaseService
        .from("session_summaries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabaseService
        .from("user_memory_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabaseService
        .from("tracea_events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabaseService
        .from("ai_usage_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabaseService
        .from("rate_limit_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabaseService
        .from("consent_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    const failures = (
      [
        ["sessions", sessionsRes.error],
        ["session_summaries", summariesRes.error],
        ["user_memory_profile", memoryRes.error],
        ["tracea_events", eventsRes.error],
        ["ai_usage_logs", aiLogsRes.error],
        ["rate_limit_logs", rateLimitRes.error],
        ["consent_logs", consentRes.error],
      ] as const
    ).filter(([, err]) => err !== null && err !== undefined);

    if (failures.length > 0) {
      console.error(
        "[ACCOUNT EXPORT] Échec lecture tables user:",
        userId.slice(0, 8),
        "tables:",
        failures.map(([name]) => name).join(",")
      );
      return NextResponse.json(
        { error: "Export impossible.", code: "export_failed" },
        { status: 500 }
      );
    }

    // 7. Anonymisation rate_limit_logs : ip_address volontairement
    //    exclue (donnée de localisation, non nécessaire à l'utilisateur).
    const rateLimitRows = (rateLimitRes.data ?? []) as Array<
      Record<string, unknown>
    >;
    const rate_limit_logs = rateLimitRows.map((row) => {
      const { ip_address: _ip, ...rest } = row;
      void _ip;
      return rest;
    });

    // 8. Construction du payload final.
    const payload = {
      format_version: "v1",
      exported_at: new Date().toISOString(),
      user: {
        id: authUser.id,
        email: authUser.email ?? null,
        created_at: authUser.created_at ?? null,
      },
      profile: {
        display_name: profile.display_name ?? "",
        is_beta_tester: profile.is_beta_tester === true,
        is_subscribed: profile.is_subscribed === true,
        created_at: profile.created_at ?? null,
      },
      subscription: {
        status: profile.stripe_subscription_status ?? null,
        plan: profile.subscription_plan ?? null,
        current_period_end: profile.subscription_current_period_end ?? null,
        cancel_at_period_end:
          profile.subscription_cancel_at_period_end === true,
        canceled_at: profile.subscription_canceled_at ?? null,
        subscribed_at: profile.subscribed_at ?? null,
        unsubscribed_at: profile.unsubscribed_at ?? null,
      },
      trial: {
        trial_used: profile.trial_used === true,
        trial_ends_at: profile.trial_ends_at ?? null,
        trial_deep_sessions_used: profile.trial_deep_sessions_used ?? 0,
      },
      sessions: sessionsRes.data ?? [],
      session_summaries: summariesRes.data ?? [],
      memory_profile: memoryRes.data ?? null,
      events: eventsRes.data ?? [],
      ai_usage_logs: aiLogsRes.data ?? [],
      rate_limit_logs,
      consent_logs: consentRes.data ?? [],
    };

    // 9. Audit RGPD — log best-effort de l'export dans tracea_events.
    //    Si l'insert échoue, on warn et on continue : l'utilisateur a
    //    droit à son export, indépendamment de l'écriture du log audit.
    const { error: logError } = await supabaseService
      .from("tracea_events")
      .insert({
        user_id: userId,
        event: "data_export",
        data: { format_version: "v1" },
      });
    if (logError) {
      console.warn(
        "[ACCOUNT EXPORT] Échec log audit user:",
        userId.slice(0, 8),
        "err:",
        logError.message
      );
    }

    // 10. Réponse JSON téléchargeable.
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filename = `tracea-export-${today}.json`;
    console.log(
      "[ACCOUNT EXPORT] Export généré user:",
      userId.slice(0, 8),
      "filename:",
      filename
    );

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[ACCOUNT EXPORT] Exception:", msg);
    return NextResponse.json(
      { error: "Erreur serveur.", code: "server_error" },
      { status: 500 }
    );
  }
}
