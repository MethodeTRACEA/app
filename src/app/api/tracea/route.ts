import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { MIRROR_SYSTEM_PROMPT } from "@/lib/ai/traceaMirrorPrompt";

// ===================================================================
// API KEY & CLIENTS
// ===================================================================

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
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
// TON SELON ÉMOTION — injecté dans le message utilisateur
// (pas dans le system prompt pour conserver le cache Anthropic)
// ===================================================================

function getToneDirective(emotion: string): string {
  const e = emotion.toLowerCase().trim();

  if (e === "colère") {
    return `Ton attendu pour cette réponse : direct, ancré, stabilisant.
Phrases courtes. Pas d'intensification. Pas de dramatisation.
Exemple de clôture : "Ça compte."`;
  }

  if (e === "tristesse") {
    return `Ton attendu pour cette réponse : doux, contenant, rassurant.
Rythme plus lent. Laisse de l'espace entre les idées.
Exemple de clôture : "C'est important."`;
  }

  if (e === "peur") {
    return `Ton attendu pour cette réponse : sécurisant, concret, simple.
Pas de mots abstraits. Ancre dans le présent et dans ce qui s'est passé.
Exemple de clôture : "Tu es resté(e) là."`;
  }

  if (e === "confusion") {
    return `Ton attendu pour cette réponse : clarifiant, lent, structurant.
Aide la personne à voir ce qui était flou. Phrases simples, dans l'ordre.
Exemple de clôture : "Ça aide à y voir plus clair."`;
  }

  // Défaut — ton neutre miroir
  return `Ton attendu pour cette réponse : neutre, humain, direct.
Miroir simple. Pas de surcharge émotionnelle.
Exemple de clôture : "Ça compte."`;
}

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
  userId?: string; // ignoré — userId vient du token vérifié
}, userId: string) {
  const { steps } = body;

  // Check AI limit before any Claude call
  const aiLimited = await checkAiLimit(userId);
  if (aiLimited) {
    console.log("[TRACEA API] final-analysis: AI limited for user:", userId?.slice(0, 8));
    return NextResponse.json({
      text: "Tu as pris le temps de mettre des mots sur ce qui se passe.\nC'est déjà quelque chose.",
      ai_limited: true,
    });
  }

  const toneDirective = getToneDirective(steps.reconnaitre || "");

  const userMessage = `Voici ce que la personne a vécu :

Situation : "${steps.traverser || ""}"
Émotion : "${steps.reconnaitre || ""}"
Action choisie (à reprendre MOT POUR MOT) : "${steps.emerger || ""}"

---

${toneDirective}

---

Écris exactement 4 phrases courtes, dans cet ordre :
1. la situation
2. l'émotion
3. l'intention choisie — mots EXACTS — formulée comme direction, pas comme acte accompli
   (ex : "Ce qui te semble juste, c'est [action mot pour mot].")
4. une validation courte

Pas de titres. Pas de séparation. Texte brut uniquement.`;

  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    temperature: 0.5,
    system: [
      { type: "text", text: MIRROR_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

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

  return NextResponse.json({ text });
}
