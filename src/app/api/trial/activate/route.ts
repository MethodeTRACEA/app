import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { emailTrialStarted } from "@/lib/email";

// ===================================================================
// POST /api/trial/activate
//
// Active l'essai Premium 7 jours pour l'utilisateur authentifié.
// - 1 seul essai par compte (trial_used permanent).
// - Sans carte bancaire.
// - Idempotent : un user déjà premium ou déjà en trial actif
//   reçoit 200 + flag, jamais d'erreur.
// - Ne touche pas au compteur IA (chantier serveur IA séparé).
// ===================================================================

type TrialSource =
  | "paywall_session"
  | "paywall_post_session"
  | "subscribe"
  | "direct"
  | "unknown";

const ALLOWED_SOURCES: TrialSource[] = [
  "paywall_session",
  "paywall_post_session",
  "subscribe",
  "direct",
  "unknown",
];

function sanitizeSource(raw: unknown): TrialSource {
  if (typeof raw !== "string") return "unknown";
  return (ALLOWED_SOURCES as string[]).includes(raw)
    ? (raw as TrialSource)
    : "unknown";
}

const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier le token Bearer
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
    if (!token) {
      return NextResponse.json(
        { error: "Non authentifié", code: "unauthenticated" },
        { status: 401 }
      );
    }

    // 2. Vérifier l'utilisateur via client anon
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
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

    // 3. Vérifier la présence du service_role (obligatoire — pas de fallback)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.error(
        "[TRIAL ACTIVATE] SUPABASE_SERVICE_ROLE_KEY manquante — activation impossible"
      );
      return NextResponse.json(
        { error: "Configuration serveur incomplète.", code: "service_role_missing" },
        { status: 500 }
      );
    }

    // 4. Lire et sanitiser source depuis le body (best-effort)
    let source: TrialSource = "unknown";
    try {
      const body = await request.json();
      source = sanitizeSource(body?.source);
    } catch {
      source = "unknown";
    }

    // 5. Client service_role pour les opérations sensibles
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 6. Lire le profil
    const { data: profile, error: profileError } = await supabaseService
      .from("profiles")
      .select(
        "is_subscribed, is_beta_tester, trial_used, trial_started_at, trial_ends_at, trial_deep_sessions_used"
      )
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.warn(
        "[TRIAL ACTIVATE] Profil introuvable pour:",
        userId.slice(0, 8),
        profileError?.message
      );
      return NextResponse.json(
        { error: "Profil introuvable.", code: "profile_not_found" },
        { status: 404 }
      );
    }

    // 7. Court-circuit : déjà premium (subscribed)
    if (profile.is_subscribed === true) {
      return NextResponse.json({
        success: true,
        alreadyPremium: true,
        reason: "subscribed",
      });
    }

    // 8. Court-circuit : déjà premium (beta)
    if (profile.is_beta_tester === true) {
      return NextResponse.json({
        success: true,
        alreadyPremium: true,
        reason: "beta",
      });
    }

    // 9. Trial déjà utilisé
    if (profile.trial_used === true) {
      const endsAt = profile.trial_ends_at
        ? new Date(profile.trial_ends_at as string).getTime()
        : 0;
      if (endsAt > Date.now()) {
        return NextResponse.json({
          success: true,
          alreadyActive: true,
          trial_ends_at: profile.trial_ends_at,
          trial_deep_sessions_used: profile.trial_deep_sessions_used ?? 0,
        });
      }
      return NextResponse.json(
        { error: "Essai déjà utilisé.", code: "trial_already_used" },
        { status: 403 }
      );
    }

    // 10. Éligible — préparer les valeurs côté serveur Node
    const trialStartedAt = new Date();
    const trialEndsAt = new Date(trialStartedAt.getTime() + TRIAL_DURATION_MS);

    // 11. Update atomique conditionnel
    const { data: updated, error: updateError } = await supabaseService
      .from("profiles")
      .update({
        trial_started_at: trialStartedAt.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        trial_used: true,
        trial_activated_by: source,
        trial_deep_sessions_used: 0,
      })
      .eq("id", userId)
      .eq("trial_used", false)
      .select("trial_started_at, trial_ends_at, trial_deep_sessions_used")
      .single();

    if (updateError || !updated) {
      // 0 ligne touchée → race condition probable, relire l'état actuel
      const { data: refetched } = await supabaseService
        .from("profiles")
        .select("trial_used, trial_ends_at, trial_deep_sessions_used")
        .eq("id", userId)
        .single();

      if (refetched?.trial_used === true) {
        const endsAt = refetched.trial_ends_at
          ? new Date(refetched.trial_ends_at as string).getTime()
          : 0;
        if (endsAt > Date.now()) {
          return NextResponse.json({
            success: true,
            alreadyActive: true,
            trial_ends_at: refetched.trial_ends_at,
            trial_deep_sessions_used: refetched.trial_deep_sessions_used ?? 0,
          });
        }
      }

      console.warn(
        "[TRIAL ACTIVATE] Race ou échec d'activation pour:",
        userId.slice(0, 8),
        updateError?.message
      );
      return NextResponse.json(
        { error: "Activation déjà traitée.", code: "trial_activation_race" },
        { status: 409 }
      );
    }

    console.log(
      "[TRIAL ACTIVATE] Trial activé pour:",
      userId.slice(0, 8),
      "| source:",
      source
    );

    try {
      if (authUser.email) {
        emailTrialStarted(
          authUser.email,
          new Date(updated.trial_ends_at as string)
        ).catch(() => {});
      }
    } catch {}

    return NextResponse.json({
      success: true,
      trial_started_at: updated.trial_started_at,
      trial_ends_at: updated.trial_ends_at,
      trial_deep_sessions_used: updated.trial_deep_sessions_used,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[TRIAL ACTIVATE] Exception:", msg);
    return NextResponse.json(
      { error: "Erreur serveur.", code: "server_error" },
      { status: 500 }
    );
  }
}
