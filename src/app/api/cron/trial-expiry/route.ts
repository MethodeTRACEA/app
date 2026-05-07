import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { emailTrialExpiring } from "@/lib/email";

// =====================================================================
// GET /api/cron/trial-expiry
//
// Cron Vercel quotidien (0 8 * * * UTC).
// Envoie emailTrialExpiring aux utilisatrices dont l'essai se termine
// aujourd'hui (UTC) et qui n'ont pas encore souscrit.
//
// Auth : Authorization: Bearer $CRON_SECRET
// =====================================================================

export async function GET(request: NextRequest) {
  // 1. Auth via CRON_SECRET (échec fermé si secret absent ou invalide)
  const expected = process.env.CRON_SECRET;
  const provided =
    request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2. Vérifier la présence du service_role
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) {
    console.error(
      "[CRON TRIAL EXPIRY] Configuration serveur incomplète — service_role ou URL manquante"
    );
    return NextResponse.json(
      { error: "server_config_missing" },
      { status: 500 }
    );
  }

  const supabaseService = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 3. Plage : aujourd'hui 00:00 UTC → aujourd'hui 23:59:59.999 UTC
  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  const endOfToday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  // 4. Query : profils dont l'essai expire aujourd'hui, non abonnés
  const { data: profiles, error: queryError } = await supabaseService
    .from("profiles")
    .select("id, trial_ends_at")
    .gte("trial_ends_at", startOfToday.toISOString())
    .lte("trial_ends_at", endOfToday.toISOString())
    .eq("trial_used", true)
    .or("is_subscribed.is.null,is_subscribed.eq.false");

  if (queryError || !profiles) {
    console.error(
      "[CRON TRIAL EXPIRY] Query failed:",
      queryError?.message
    );
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  // 5. Envoi des emails — séquentiel, fire-and-forget par utilisatrice
  for (const profile of profiles) {
    try {
      const { data, error: userError } =
        await supabaseService.auth.admin.getUserById(profile.id);
      if (userError) {
        console.error(
          "[CRON TRIAL EXPIRY] getUserById failed:",
          profile.id.slice(0, 8),
          userError.message
        );
        continue;
      }
      const email = data?.user?.email;
      if (!email) continue;
      emailTrialExpiring(email).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        "[CRON TRIAL EXPIRY] Iteration threw:",
        profile.id.slice(0, 8),
        msg
      );
    }
  }

  console.log(
    "[CRON TRIAL EXPIRY] Done — profils trouvés:",
    profiles.length
  );

  return NextResponse.json({ processed: profiles.length });
}
