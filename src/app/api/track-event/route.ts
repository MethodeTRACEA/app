import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientIp } from "@/lib/rate-limit";
import { isValidToken } from "@/lib/track-token";

// ===================================================================
// TRACK EVENT — Route serveur sécurisée
// Remplace les inserts directs anon-key vers tracea_events.
//
// Sécurité :
//   - Consentement vérifié côté body
//   - Validation stricte des champs
//   - Rate limit par IP (60/min) et anonymous_id (120/h)
//   - Insert exclusivement via service_role (bypass RLS)
//   - Aucun throw côté front possible
// ===================================================================

// ── Supabase service role ─────────────────────────────────────────────
function getSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Rate limit in-memory (sliding window) ────────────────────────────
//
// Séparé du rate-limit IA : seuils différents, Maps différentes.
// Même pattern que src/lib/rate-limit.ts (sliding window).
//
// IP   : 60 events / minute
// Anon : 120 events / heure

const trackIpWindows   = new Map<string, number[]>();
const trackAnonWindows = new Map<string, number[]>();
const trackEventWindows = new Map<string, number[]>();

const EVENT_LIMITS: Record<string, { max: number; window: number }> = {
  session_start: { max: 5,  window: 60_000 },
  session_end:   { max: 5,  window: 60_000 },
  step_complete: { max: 30, window: 60_000 },
};

const IP_MAX    = 60;
const IP_WIN    = 60_000;          // 1 min
const ANON_MAX  = 120;
const ANON_WIN  = 3_600_000;      // 1 heure

// Nettoyage périodique (toutes les 5 min)
const CLEANUP_INTERVAL = 5 * 60_000;
let lastCleanup = Date.now();

function cleanupMaps() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoffIp   = now - IP_WIN;
  const cutoffAnon = now - ANON_WIN;
  trackIpWindows.forEach((ts, k)   => { if (!ts.some((t: number) => t > cutoffIp))   trackIpWindows.delete(k);   });
  trackAnonWindows.forEach((ts, k) => { if (!ts.some((t: number) => t > cutoffAnon)) trackAnonWindows.delete(k); });
}

function slidingWindow(
  map: Map<string, number[]>,
  key: string,
  windowMs: number,
  max: number,
): boolean {
  const now    = Date.now();
  const cutoff = now - windowMs;
  const ts     = (map.get(key) ?? []).filter((t) => t > cutoff);
  if (ts.length >= max) { map.set(key, ts); return false; }
  ts.push(now);
  map.set(key, ts);
  return true;
}

// ── Validation ────────────────────────────────────────────────────────

// anonymous_id peut être un UUID ou une autre string alphanumérique courte
const ANON_REGEX  = /^[a-zA-Z0-9_-]{1,64}$/;
// event : lettres, chiffres, underscores, tirets, points
const EVENT_REGEX = /^[a-zA-Z0-9_.\-]{1,80}$/;

// ── POST ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    cleanupMaps();

    // 1. Taille payload max (8 KB — largement suffisant pour un event)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 8_192) {
      return NextResponse.json({ error: "Payload trop grand" }, { status: 413 });
    }

    // 2. Parse body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Body invalide" }, { status: 400 });
    }

    // 3. Consentement — première vérification serveur
    if (body.tracea_consent !== true) {
      return NextResponse.json({ error: "Consentement requis" }, { status: 403 });
    }

    // 3b. Token anti-bot — refuser les appels directs non signés
    if (!isValidToken(body.track_token)) {
      return NextResponse.json({ error: "Token invalide" }, { status: 403 });
    }

    // 4. Champ event
    if (typeof body.event !== "string" || !EVENT_REGEX.test(body.event)) {
      return NextResponse.json(
        { error: "Champ event invalide (max 80 chars, alphanumérique)" },
        { status: 400 },
      );
    }
    const event = body.event;

    // 5. user_id — ignoré depuis le body, toujours null côté serveur
    //    (l'identité est portée par anonymous_id dans data, pas par le body client)
    const userId: string | null = null;

    // 6. Champ data (optionnel — objet plat)
    let data: Record<string, unknown> = {};
    if (body.data !== undefined) {
      if (
        typeof body.data !== "object" ||
        Array.isArray(body.data) ||
        body.data === null
      ) {
        return NextResponse.json({ error: "data doit être un objet" }, { status: 400 });
      }
      data = body.data as Record<string, unknown>;
    }

    // 7. Champ anonymous_id (optionnel)
    const anonymousId: string | undefined =
      typeof body.anonymous_id === "string" ? body.anonymous_id : undefined;
    if (anonymousId !== undefined && !ANON_REGEX.test(anonymousId)) {
      return NextResponse.json({ error: "anonymous_id invalide" }, { status: 400 });
    }

    // 8. Rate limit par IP
    const ip = getClientIp(request.headers);
    if (ip) {
      const allowed = slidingWindow(trackIpWindows, ip, IP_WIN, IP_MAX);
      if (!allowed) {
        console.warn(`[TRACK EVENT] Rate limit IP: ${ip}`);
        return NextResponse.json(
          { error: "Trop de requêtes — réessaie dans une minute" },
          { status: 429 },
        );
      }
    }

    // 9. Rate limit par anonymous_id
    if (anonymousId) {
      const allowed = slidingWindow(trackAnonWindows, anonymousId, ANON_WIN, ANON_MAX);
      if (!allowed) {
        console.warn(`[TRACK EVENT] Rate limit anon: ${anonymousId.slice(0, 8)}…`);
        return NextResponse.json(
          { error: "Trop de requêtes — réessaie plus tard" },
          { status: 429 },
        );
      }
    }

    // 10. Rate limit par type d'événement
    //     Clé = event + identifiant disponible (IP > anonymous_id > "unknown")
    const eventLimit = EVENT_LIMITS[event];
    if (eventLimit) {
      const key = `${event}:${ip ?? anonymousId ?? "unknown"}`;
      if (!slidingWindow(trackEventWindows, key, eventLimit.window, eventLimit.max)) {
        console.warn(`[TRACK EVENT] Rate limit event: ${event}`);
        return NextResponse.json(
          { error: "Trop d'actions répétées — ralentis un peu" },
          { status: 429 },
        );
      }
    }

    // 11. Insert via service_role (bypass RLS)
    const supabase = getSupabaseService();
    const { error: insertError } = await supabase.from("tracea_events").insert({
      user_id: userId,
      event,
      data: {
        ...data,
        ...(anonymousId ? { anonymous_id: anonymousId } : {}),
      },
    });

    if (insertError) {
      console.error("[TRACK EVENT] Insert error:", insertError.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[TRACK EVENT] Unexpected error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Rejeter toute autre méthode
export function GET()    { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
export function PUT()    { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
export function DELETE() { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
