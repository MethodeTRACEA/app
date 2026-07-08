import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ===================================================================
// POST /api/push/subscribe
//
// Enregistre un abonnement push navigateur pour l'utilisateur authentifié
// (chantier 57, brique 57-2 — tuyauterie uniquement, aucun écran ici).
//
// - userId issu uniquement du Bearer token vérifié (jamais du body).
// - Upsert on conflict(endpoint) : un même endpoint ne duplique jamais une
//   ligne (contrainte unique posée en 57-1) ; si le même appareil se
//   ré-abonne (ou change d'utilisateur), la ligne est mise à jour, pas dupliquée.
// - push_subscriptions est déjà couverte par les deux chemins d'effacement
//   RGPD (57-1) : aucun entretien supplémentaire nécessaire ici.
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
      console.error("[PUSH SUBSCRIBE] Configuration Supabase manquante");
      return NextResponse.json(
        { error: "Configuration serveur incomplète.", code: "supabase_config_missing" },
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

    // 4. Lire et valider le body.
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de requête invalide.", code: "invalid_body" },
        { status: 400 }
      );
    }
    const { endpoint, p256dh, auth } = (body ?? {}) as Record<string, unknown>;
    if (
      typeof endpoint !== "string" ||
      !endpoint ||
      typeof p256dh !== "string" ||
      !p256dh ||
      typeof auth !== "string" ||
      !auth
    ) {
      return NextResponse.json(
        { error: "endpoint, p256dh et auth sont requis.", code: "missing_fields" },
        { status: 400 }
      );
    }

    // 5. Upsert via service role (bypass RLS, écrit pour le user authentifié
    //    uniquement — userId vient du token, jamais du body).
    const supabaseService = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: upsertError } = await supabaseService
      .from("push_subscriptions")
      .upsert(
        {
          user_id: userId,
          endpoint,
          p256dh,
          auth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      );

    if (upsertError) {
      console.error("[PUSH SUBSCRIBE] Upsert error:", upsertError.message);
      return NextResponse.json(
        { error: "Échec d'enregistrement.", code: "upsert_failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[PUSH SUBSCRIBE] Exception:", msg);
    return NextResponse.json(
      { error: "Erreur serveur.", code: "server_error" },
      { status: 500 }
    );
  }
}
