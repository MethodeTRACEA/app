import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// ===================================================================
// API KEY & CLIENTS
// ===================================================================

function loadApiKeyFromEnvFile(): string {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("ANTHROPIC_API_KEY=")) {
        return trimmed.substring("ANTHROPIC_API_KEY=".length);
      }
    }
  } catch {
    // fallback
  }
  return "";
}

function getAnthropicClient() {
  let apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    apiKey = loadApiKeyFromEnvFile();
  }
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquante");
  }
  return new Anthropic({ apiKey });
}

/** Client anon — pour les requêtes SELECT avec RLS (ex: sessions) */
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Client service role — pour les INSERT logs (bypass RLS, serveur uniquement) */
function getSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    console.warn("[TRACEA API] SUPABASE_SERVICE_ROLE_KEY manquante, fallback anon");
    return getSupabase();
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ===================================================================
// AI USAGE LOGGING
// ===================================================================

// Tarifs Claude Sonnet (claude-sonnet-4-6) — mai 2025
const COST_PER_INPUT_TOKEN = 3.0 / 1_000_000;      // $3 / 1M tokens
const COST_PER_OUTPUT_TOKEN = 15.0 / 1_000_000;     // $15 / 1M tokens
const COST_PER_CACHE_WRITE_TOKEN = 3.75 / 1_000_000; // $3.75 / 1M tokens (écriture cache)
const COST_PER_CACHE_READ_TOKEN = 0.30 / 1_000_000;  // $0.30 / 1M tokens (lecture cache — 90% de réduction)

async function logAiUsage(params: {
  userId: string;
  callType: string;
  stepId?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  isRetry?: boolean;
}) {
  const cacheWrite = params.cacheCreationTokens || 0;
  const cacheRead = params.cacheReadTokens || 0;
  const nonCachedInput = params.inputTokens - cacheWrite - cacheRead;

  const cost =
    nonCachedInput * COST_PER_INPUT_TOKEN +
    cacheWrite * COST_PER_CACHE_WRITE_TOKEN +
    cacheRead * COST_PER_CACHE_READ_TOKEN +
    params.outputTokens * COST_PER_OUTPUT_TOKEN;

  // Console log (toujours visible dans Vercel logs)
  const cacheInfo = (cacheWrite || cacheRead)
    ? ` | cache_write: ${cacheWrite} cache_read: ${cacheRead}`
    : "";
  console.log(
    `[AI COST] ${params.callType}${params.stepId ? ` (${params.stepId})` : ""}` +
    `${params.isRetry ? " [RETRY]" : ""}` +
    ` | in: ${params.inputTokens} out: ${params.outputTokens}${cacheInfo}` +
    ` | $${cost.toFixed(6)}` +
    ` | user: ${params.userId.slice(0, 8)}...`
  );

  // Persist to Supabase via service role (don't block the response if it fails)
  try {
    const supabase = getSupabaseService();
    const { error: insertError } = await supabase.from("ai_usage_logs").insert({
      user_id: params.userId,
      call_type: params.callType,
      step_id: params.stepId || null,
      model: params.model,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      estimated_cost_usd: cost,
      is_retry: params.isRetry || false,
    });

    if (insertError) {
      console.error("[AI LOG ERROR] Supabase insert failed:", insertError.message, insertError.details, insertError.hint);
    } else {
      console.log(`[AI LOG SAVED] ${params.userId.slice(0, 8)}... | $${cost.toFixed(6)}`);
    }
  } catch (err) {
    // Ne jamais bloquer la réponse pour un problème de logging
    console.error("[AI LOG ERROR] Exception:", err);
  }
}

// ===================================================================
// SECTION 1 — SYSTEM PROMPTS
// ===================================================================

// Master prompt (complet) — utilisé pour final-analysis
const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "docs", "IA_TRACEA_SYSTEM_PROMPT.md"),
  "utf-8"
);

// ===================================================================
// STEP_ORDER pour le contexte de session
// ===================================================================

const STEP_ORDER = [
  "traverser",
  "reconnaitre",
  "ancrer",
  "conscientiser",
  "emerger",
  "aligner",
];

const STEP_LABELS: Record<string, string> = {
  traverser: "Traverser",
  reconnaitre: "Reconnaître",
  ancrer: "Ancrer",
  conscientiser: "Conscientiser",
  emerger: "Émerger",
  aligner: "Aligner",
};

// ===================================================================
// AI LIMIT — free tier: 1 session with AI, unlimited for subscribers
// ===================================================================

async function checkAiLimit(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const supabase = getSupabaseService();

    // TODO: replace with Stripe subscription check when payment is integrated
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_subscribed, is_beta_tester")
      .eq("id", userId)
      .single();
    if (profile?.is_subscribed === true || profile?.is_beta_tester === true) return false; // subscribed or beta → unlimited

    // Count completed sessions for free users
    const { count } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);

    return (count ?? 0) >= 1; // limited after 1st completed session
  } catch {
    return false; // fail open — allow if DB check fails
  }
}

// ===================================================================
// ROUTES
// ===================================================================

// Étendre le timeout Vercel (60s Pro, 10s Hobby)
// L'appel Claude + mémoire prend 8-15s — le timeout Hobby (10s) est insuffisant
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // --- Authentification : vérifier le token JWT ---
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const { data: { user: authUser }, error: authError } = await getSupabase().auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const userId = authUser.id;

    const body = await request.json();
    const { type } = body;

    console.log("[TRACEA API] Request type:", type, "| stepId:", body.stepId || "n/a");

    // --- Rate Limiting : vérifier AVANT tout appel IA ---
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = await checkRateLimit({
      userId,
      ip: clientIp,
    });

    if (!rateLimitResult.allowed) {
      console.warn(`[TRACEA API] Rate limited: ${rateLimitResult.reason} | user: ${body.userId || "anon"} | ip: ${clientIp || "unknown"}`);
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    if (type === "final-analysis") {
      return await handleFinalAnalysis(body, userId);
    }

    return NextResponse.json(
      { error: "Type de requête invalide" },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[TRACEA API] Error:", errMsg);

    let userMessage = "Une erreur est survenue. Tu peux continuer ta session.";
    if (errMsg.includes("credit balance is too low")) {
      userMessage = "Le service d'analyse IA est temporairement indisponible (crédits API insuffisants). Tu peux continuer ta session normalement.";
    } else if (errMsg.includes("ANTHROPIC_API_KEY")) {
      userMessage = "Configuration API manquante. Contacte l'administratrice.";
    } else if (errMsg.includes("authentication")) {
      userMessage = "Erreur d'authentification API. Contacte l'administratrice.";
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}

// ===================================================================
// FINAL ANALYSIS — Analyse de fin de session
// ===================================================================

async function handleFinalAnalysis(body: {
  steps: Record<string, string>;
  context: string;
  intensityBefore: number;
  intensityAfter: number;
  userId?: string; // ignoré — userId vient du token vérifié
}, userId: string) {
  const { steps, context, intensityBefore, intensityAfter } = body;

  // Check AI limit before any Claude call
  const aiLimited = await checkAiLimit(userId);
  if (aiLimited) {
    console.log("[TRACEA API] final-analysis: AI limited for user:", userId?.slice(0, 8));
    return NextResponse.json({
      analysis: "Tu as pris un moment pour revenir au corps.\nQuelque chose s'est un peu posé.\nEt tu repars avec un geste.",
      ai_limited: true,
    });
  }

  const recovery = intensityBefore - intensityAfter;

  let stepsContent = "";
  for (const sid of STEP_ORDER) {
    if (steps[sid]) {
      stepsContent += `${STEP_LABELS[sid] || sid} :\n"${steps[sid]}"\n\n`;
    }
  }

  const userMessage = `Voici la traversée complète de cette personne.

Contexte : ${context}
Intensité avant : ${intensityBefore}/10
Intensité après : ${intensityAfter}/10
Mouvement d'intensité : ${recovery > 0 ? `baisse de ${recovery} points` : recovery === 0 ? "stable" : `hausse de ${Math.abs(recovery)} points`}

--- Les étapes de cette traversée ---
${stepsContent}
Génère un résumé COURT de cette traversée. Format obligatoire en 3 parties :

1. LE MOUVEMENT — 1 phrase. Ce qui a changé dans le corps. Ton incarné : "La tension est descendue à ${intensityAfter}/10" pas "Niveau de tension : ${intensityAfter}/10". Utilise les mots de la personne.

2. LA VÉRITÉ — 1 phrase. Ce qui est présent. Ce que la personne a nommé ou touché. Ses mots, pas les tiens. Ton incarné : "Tu viens de faire redescendre ton corps" pas "Émotion dominante : apaisement".

3. LE GESTE — 1 phrase. L'action choisie. Simple et concrète.

Règles absolues :
- Court. Simple. Incarné.
- Pas de narration longue. 3 phrases, c'est tout.
- Pas d'analyse psychologique. Pas de diagnostic. Pas de jargon.
- Pas de "bravo", pas de jugement.
- Pas de projection dans le futur.
- Pas de comparaison avec des sessions précédentes.
- Ton direct, sensoriel, humain. Les mots de la personne.
- Reprendre au moins 1 expression exacte utilisée par la personne dans ses réponses.
- L'ensemble fait 3 phrases maximum.`;

  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    temperature: 0.45,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Logger l'usage (fire-and-forget)
  const analysisUsage = message.usage as unknown as Record<string, number>;
  logAiUsage({
    userId,
    callType: "final-analysis",
    model: "claude-sonnet-4-6",
    inputTokens: analysisUsage.input_tokens,
    outputTokens: analysisUsage.output_tokens,
    cacheCreationTokens: analysisUsage.cache_creation_input_tokens || 0,
    cacheReadTokens: analysisUsage.cache_read_input_tokens || 0,
  }).catch(() => {});

  return NextResponse.json({ analysis: text });
}
