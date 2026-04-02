// ===================================================================
// RATE LIMITING — Protection anti-abus pour les appels IA
// ===================================================================
//
// 3 niveaux de protection :
// 1. Anti-spam rapide par userId (15/min, 40/5min)
// 2. Anti-spam par IP (30/min)
// 3. Limite mensuelle par userId (500 appels / 30 jours)
//
// Tout est vérifié AVANT l'appel à Claude API → zéro token gaspillé.
// ===================================================================

import { createClient } from "@supabase/supabase-js";

// --- Configuration des seuils ---

const LIMITS = {
  // Anti-spam rapide (en mémoire)
  user: {
    perMinute: 15,      // max 15 appels/min par user (~2 sessions complètes)
    per5Minutes: 40,    // max 40 appels/5min par user (~5-6 sessions)
  },
  ip: {
    perMinute: 30,      // plus généreux (IP partagées possibles)
  },
  // Limite mensuelle (via Supabase)
  monthly: {
    maxCalls: 500,      // ~70 sessions/mois — très au-delà d'un usage normal
  },
};

// --- Types ---

export type RateLimitResult = {
  allowed: boolean;
  reason?: "user_minute" | "user_5min" | "ip_minute" | "monthly_limit";
  message?: string;
  remaining?: number;
};

// --- In-memory sliding window ---

interface WindowEntry {
  timestamps: number[];
}

// Maps séparées pour user et IP
const userWindows = new Map<string, WindowEntry>();
const ipWindows = new Map<string, WindowEntry>();

// Nettoyage périodique pour éviter les fuites mémoire
// (supprime les entrées sans activité depuis 10 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 min
const ENTRY_TTL = 10 * 60 * 1000;       // 10 min

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - ENTRY_TTL;
  Array.from(userWindows.entries()).forEach(([key, entry]) => {
    if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
      userWindows.delete(key);
    }
  });
  Array.from(ipWindows.entries()).forEach(([key, entry]) => {
    if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
      ipWindows.delete(key);
    }
  });
}

/**
 * Vérifie si un appel est autorisé dans la fenêtre glissante.
 * Retourne le nombre d'appels dans la fenêtre.
 */
function checkWindow(
  map: Map<string, WindowEntry>,
  key: string,
  windowMs: number,
  maxCalls: number,
): { count: number; allowed: boolean } {
  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = map.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    map.set(key, entry);
  }

  // Nettoyer les timestamps expirés
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  const count = entry.timestamps.length;
  const allowed = count < maxCalls;

  if (allowed) {
    entry.timestamps.push(now);
  }

  return { count, allowed };
}

// --- Vérification mensuelle via Supabase ---

async function checkMonthlyLimit(userId: string): Promise<{ count: number; allowed: boolean }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count, error } = await supabase
      .from("ai_usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (error) {
      // En cas d'erreur Supabase, on laisse passer (fail-open)
      console.warn("[RATE LIMIT] Monthly check failed, allowing:", error.message);
      return { count: 0, allowed: true };
    }

    const total = count || 0;
    return { count: total, allowed: total < LIMITS.monthly.maxCalls };
  } catch (err) {
    console.warn("[RATE LIMIT] Monthly check error, allowing:", err);
    return { count: 0, allowed: true };
  }
}

// --- Log des blocages ---

async function logBlock(params: {
  userId?: string;
  ip?: string;
  reason: string;
  details?: string;
}) {
  // Console (toujours visible dans Vercel logs)
  console.warn(
    `[RATE LIMIT BLOCKED] reason=${params.reason}` +
    `${params.userId ? ` | user=${params.userId.slice(0, 8)}...` : ""}` +
    `${params.ip ? ` | ip=${params.ip}` : ""}` +
    `${params.details ? ` | ${params.details}` : ""}`,
  );

  // Persist to Supabase (fire-and-forget)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    await supabase.from("rate_limit_logs").insert({
      user_id: params.userId || null,
      ip_address: params.ip || null,
      reason: params.reason,
      details: params.details || null,
    });
  } catch {
    // Ne jamais bloquer pour un problème de logging
  }
}

// --- Point d'entrée principal ---

/**
 * Vérifie toutes les limites AVANT un appel IA.
 * Appeler au début de POST dans route.ts.
 */
export async function checkRateLimit(params: {
  userId?: string;
  ip?: string;
}): Promise<RateLimitResult> {
  cleanup();

  const { userId, ip } = params;

  // 1. Anti-spam rapide par userId
  if (userId) {
    // Check 1 minute
    const min1 = checkWindow(userWindows, `${userId}:1m`, 60_000, LIMITS.user.perMinute);
    if (!min1.allowed) {
      await logBlock({
        userId,
        ip,
        reason: "user_minute",
        details: `${min1.count} calls in 1 min (limit: ${LIMITS.user.perMinute})`,
      });
      return {
        allowed: false,
        reason: "user_minute",
        message: "Tu vas un peu vite. Prends quelques secondes avant de continuer.",
      };
    }

    // Check 5 minutes
    const min5 = checkWindow(userWindows, `${userId}:5m`, 5 * 60_000, LIMITS.user.per5Minutes);
    if (!min5.allowed) {
      await logBlock({
        userId,
        ip,
        reason: "user_5min",
        details: `${min5.count} calls in 5 min (limit: ${LIMITS.user.per5Minutes})`,
      });
      return {
        allowed: false,
        reason: "user_5min",
        message: "Activité inhabituelle détectée. Merci de patienter quelques minutes.",
      };
    }
  }

  // 2. Anti-spam par IP
  if (ip) {
    const ipCheck = checkWindow(ipWindows, ip, 60_000, LIMITS.ip.perMinute);
    if (!ipCheck.allowed) {
      await logBlock({
        userId,
        ip,
        reason: "ip_minute",
        details: `${ipCheck.count} calls in 1 min from IP (limit: ${LIMITS.ip.perMinute})`,
      });
      return {
        allowed: false,
        reason: "ip_minute",
        message: "Trop de requêtes depuis cette connexion. Merci de patienter.",
      };
    }
  }

  // 3. Limite mensuelle par userId (via Supabase)
  if (userId) {
    const monthly = await checkMonthlyLimit(userId);
    if (!monthly.allowed) {
      await logBlock({
        userId,
        ip,
        reason: "monthly_limit",
        details: `${monthly.count} calls in 30 days (limit: ${LIMITS.monthly.maxCalls})`,
      });
      return {
        allowed: false,
        reason: "monthly_limit",
        message: "Usage intensif détecté ce mois-ci. Merci de réessayer plus tard.",
        remaining: 0,
      };
    }
  }

  return { allowed: true };
}

/**
 * Extraire l'IP du client depuis les headers Next.js / Vercel.
 */
export function getClientIp(headers: Headers): string | undefined {
  // Vercel injecte automatiquement ce header
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return undefined;
}
