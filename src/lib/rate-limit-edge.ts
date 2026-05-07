import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

// =====================================================================
// Edge rate limit TRACÉA — pré-filtre IP appliqué dans le middleware
// sur /api/tracea/* (sliding window 30 req / 60 s).
//
// Coexiste avec src/lib/rate-limit.ts (logique métier in-route :
// user 1m/5m + IP 1m + monthly via Supabase). Cette couche edge
// est un filtre rapide en amont, défense en couches.
//
// Init lazy + fail-open : aucun throw possible au chargement du module.
// Si UPSTASH_REDIS_REST_URL ou _TOKEN sont absentes, ou si la
// construction Redis échoue, getEdgeRatelimit() retourne null et le
// middleware laisse passer la requête (la couche métier in-route
// continue de tourner).
// =====================================================================

// undefined = pas encore tenté ; null = tenté, indisponible (cached)
let cached: Ratelimit | null | undefined;

export function getEdgeRatelimit(): Ratelimit | null {
  if (cached !== undefined) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error(
      "[rate-limit-edge] UPSTASH_REDIS_REST_URL ou _TOKEN manquante — fail-open"
    );
    cached = null;
    return null;
  }

  try {
    const redis = new Redis({ url, token });
    cached = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      analytics: false,
      prefix: "tracea_rl_edge",
    });
    return cached;
  } catch (err) {
    console.error("[rate-limit-edge] Init Redis/Ratelimit échouée — fail-open", err);
    cached = null;
    return null;
  }
}
