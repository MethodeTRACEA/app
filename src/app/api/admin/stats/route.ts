import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ===================================================================
// GET /api/admin/stats
//   Bearer obligatoire. Vérifie is_admin via service_role.
//   Si OK : retourne { stats, weekly } depuis admin_stats +
//   admin_weekly_stats lus via service_role.
//
// Robustesse pré-migration : utilise maybeSingle() — entre le push
// de cette route et l'application de la migration qui retire la
// clause WHERE, le SELECT peut retourner 0 ligne. La route renvoie
// alors stats = null sans planter en 500 (/app/admin affichera
// des zéros pendant ce gap court).
// ===================================================================

export async function GET(request: NextRequest) {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error("[ADMIN STATS] Configuration Supabase manquante");
    return NextResponse.json(
      { error: "Configuration serveur incomplète" },
      { status: 500 }
    );
  }

  // 1. Identifier l'user via JWT
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  const {
    data: { user },
  } = await supabaseAnon.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // 2. Vérifier is_admin via service_role (source de vérité)
  const supabaseService = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile, error: pErr } = await supabaseService
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (pErr || profile?.is_admin !== true) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // 3. Lire les vues admin via service_role
  const [statsRes, weeklyRes] = await Promise.all([
    supabaseService.from("admin_stats").select("*").maybeSingle(),
    supabaseService
      .from("admin_weekly_stats")
      .select("*")
      .order("week", { ascending: false })
      .limit(12),
  ]);

  if (statsRes.error || weeklyRes.error) {
    console.error(
      "[ADMIN STATS] Erreur lecture:",
      statsRes.error?.message,
      weeklyRes.error?.message
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({
    stats: statsRes.data,
    weekly: weeklyRes.data ?? [],
  });
}
