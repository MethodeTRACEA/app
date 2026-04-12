import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role client — only used server-side, never exposed to client
function getSupabaseService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Anon client — to verify the user's access token
function getSupabaseAnon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extract bearer token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    // 2. Verify token and get user
    const supabaseAnon = getSupabaseAnon();
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 3. Set is_subscribed = true via service role (bypasses RLS)
    //    TODO: verify Stripe payment here before setting the flag
    const supabaseService = getSupabaseService();
    const { error: updateError } = await supabaseService
      .from("profiles")
      .update({ is_subscribed: true })
      .eq("id", user.id);

    if (updateError) {
      console.error("[SUBSCRIBE] Update error:", updateError.message);
      return NextResponse.json({ error: "Erreur mise à jour profil" }, { status: 500 });
    }

    console.log("[SUBSCRIBE] is_subscribed = true for user:", user.id.slice(0, 8));
    return NextResponse.json({ success: true });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[SUBSCRIBE] Error:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
