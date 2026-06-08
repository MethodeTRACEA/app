import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  RGPD_WORDINGS,
  RGPD_WORDING_CURRENT_VERSION,
  buildRgpdWordingSnapshot,
  type RgpdWordingVersion,
  type RgpdConsentType,
} from "@/lib/legal/rgpd-wordings";

export const runtime = "nodejs";

// ===================================================================
// Chantier 33 — Persistance du consentement RGPD art. 9
//
// GET    /api/consent  → { hasValidConsent, version?, acceptedAt? }
//   Lit les dernières lignes consent_logs de l'utilisatrice connectée
//   et retourne hasValidConsent=true uniquement si les 3 consent_types
//   ont une ligne récente granted=true (pas de révocation postérieure).
//
// POST   /api/consent  { wordingVersion } → insert 3 lignes granted=true
//   Persiste le consentement avec snapshot du wording exact présenté.
//
// DELETE /api/consent             → insert 3 lignes granted=false
//   Révocation. On ne supprime jamais les lignes existantes (preuve
//   immuable). Le healing GET respectera la révocation au prochain
//   chargement de ConsentGate.
//
// Sécurité :
//   - userId issu uniquement du Bearer token Supabase vérifié ;
//   - écritures via service_role (table 100 % serveur depuis la
//     migration rgpd_consent_logs.sql).
// ===================================================================

const CONSENT_TYPES: RgpdConsentType[] = [
  "data_processing",
  "sensitive_data",
  "local_storage_usage",
];

async function getUserIdFromToken(
  token: string | null
): Promise<string | null> {
  if (!token) return null;
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabaseAnon.auth.getUser(token);
  return user?.id ?? null;
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function bearer(request: NextRequest): string | null {
  return (
    request.headers.get("authorization")?.replace("Bearer ", "") ?? null
  );
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromToken(bearer(request));
  if (!userId) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  const supabaseService = getServiceClient();
  const { data, error } = await supabaseService
    .from("consent_logs")
    .select("consent_type, granted, version, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[CONSENT GET] Erreur lecture:", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Pour chaque consent_type, garder la ligne la PLUS RÉCENTE.
  // Une révocation (granted=false) plus récente qu'un consentement
  // est ainsi respectée → hasValidConsent = false.
  const latestByType = new Map<string, (typeof data)[number]>();
  for (const row of data ?? []) {
    if (!latestByType.has(row.consent_type)) {
      latestByType.set(row.consent_type, row);
    }
  }

  const allGranted = CONSENT_TYPES.every(
    (t) => latestByType.get(t)?.granted === true
  );

  if (!allGranted) {
    return NextResponse.json({ hasValidConsent: false });
  }

  // Date affichée = la plus ancienne des 3 dernières lignes granted=true
  // (= moment où le triptyque a été complété pour la dernière fois).
  const dates = CONSENT_TYPES.map(
    (t) => latestByType.get(t)!.created_at
  ).sort();

  return NextResponse.json({
    hasValidConsent: true,
    version: latestByType.get("data_processing")!.version,
    acceptedAt: dates[0],
  });
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromToken(bearer(request));
  if (!userId) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  let wordingVersion: RgpdWordingVersion;
  try {
    const body = await request.json();
    const v = body?.wordingVersion;
    if (typeof v !== "string" || !(v in RGPD_WORDINGS)) {
      return NextResponse.json(
        { error: "wordingVersion invalide" },
        { status: 400 }
      );
    }
    wordingVersion = v as RgpdWordingVersion;
  } catch {
    return NextResponse.json(
      { error: "Body invalide" },
      { status: 400 }
    );
  }

  const acceptedAt = new Date().toISOString();
  const rows = CONSENT_TYPES.map((t) => ({
    user_id: userId,
    consent_type: t,
    granted: true,
    version: wordingVersion,
    wording_snapshot: buildRgpdWordingSnapshot(wordingVersion, t),
    created_at: acceptedAt,
  }));

  const { error } = await getServiceClient()
    .from("consent_logs")
    .insert(rows);

  if (error) {
    console.error("[CONSENT POST] Erreur insert:", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    version: wordingVersion,
    acceptedAt,
  });
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserIdFromToken(bearer(request));
  if (!userId) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Révocation = insert de 3 nouvelles lignes granted=false avec
  // snapshot de la version courante (le wording que l'utilisatrice
  // voit au moment où elle révoque). Pas de DELETE physique : la
  // preuve historique est immuable.
  const revokedAt = new Date().toISOString();
  const version = RGPD_WORDING_CURRENT_VERSION;
  const rows = CONSENT_TYPES.map((t) => ({
    user_id: userId,
    consent_type: t,
    granted: false,
    version,
    wording_snapshot: buildRgpdWordingSnapshot(version, t),
    created_at: revokedAt,
  }));

  const { error } = await getServiceClient()
    .from("consent_logs")
    .insert(rows);

  if (error) {
    console.error(
      "[CONSENT DELETE] Erreur insert (revoke):",
      error.message
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true, revokedAt });
}
