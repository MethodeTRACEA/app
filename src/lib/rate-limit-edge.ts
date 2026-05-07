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
// Backend Upstash Redis via REST → Edge Runtime compatible.
// =====================================================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const edgeRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: false,
  prefix: "tracea_rl_edge",
});
