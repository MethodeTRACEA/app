import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ===================================================================
// POST /api/beta/activate
//
// L'utilisateur connecté envoie le mot de passe bêta.
// Si correct → is_beta_tester = true dans profiles.
// Le mot de passe est stocké dans BETA_PASSWORD (variable d'env).
// ===================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier que l'utilisateur est connecté
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 2. Vérifier le mot de passe bêta
    const { password } = await request.json();
    const betaPassword = process.env.BETA_PASSWORD;

    if (!betaPassword) {
      console.error("[BETA ACTIVATE] BETA_PASSWORD non défini dans .env.local");
      return NextResponse.json({ error: "Configuration manquante" }, { status: 500 });
    }

    if (!password || password !== betaPassword) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 403 });
    }

    // 3. Activer is_beta_tester pour cet utilisateur
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: updateError } = await supabaseService
      .from("profiles")
      .update({ is_beta_tester: true })
      .eq("id", user.id);

    if (updateError) {
      console.error("[BETA ACTIVATE] Erreur update:", updateError.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    console.log("[BETA ACTIVATE] Accès bêta activé pour:", user.id.slice(0, 8));
    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[BETA ACTIVATE] Exception:", msg);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
