import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import {
  saveSessionSummary,
  updateMemoryProfile,
  type SessionSummary,
} from "@/lib/memory";

// ===================================================================
// API KEY
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

// ===================================================================
// PROMPTS POUR LE RÉSUMÉ DE SESSION
// ===================================================================

const SUMMARY_SYSTEM_PROMPT = `Tu es le module mémoire de TRACÉA.
Tu reçois l'historique complet d'une session TRACÉA (les réponses de l'utilisateur à chaque étape et les analyses IA correspondantes).

Tu dois produire un résumé synthétique de cette session.

RÈGLES ABSOLUES :
- Tu ne poses JAMAIS d'étiquette identitaire ("cette personne est anxieuse").
- Tu ne formules JAMAIS de diagnostic.
- Tu ne conclus JAMAIS sur une cause certaine.
- Tu formules tout comme des OBSERVATIONS CONDITIONNELLES : "il semble que", "un thème de", "une tendance vers".
- Tu restes factuel et bref.

Tu dois retourner UNIQUEMENT un objet JSON valide, sans texte avant ni après, sans backticks markdown.`;

const SUMMARY_DEVELOPER_PROMPT = `Analyse l'historique de session ci-dessous et produis un résumé JSON avec cette structure exacte :

{
  "dominant_emotions": ["émotion1", "émotion2"],
  "trigger_context": "description courte du contexte déclencheur exprimé",
  "expressed_needs": ["besoin1", "besoin2"],
  "suggested_actions": ["action1", "action2"],
  "themes": ["thème1", "thème2"],
  "avg_tension_level": 0-10,
  "end_clarity_level": 0-10,
  "regulation_state": "stable" ou "fluctuating" ou "overloaded",
  "inner_truth": "la vérité intérieure formulée par l'utilisateur si elle existe, sinon vide",
  "narrative_summary": "2-3 phrases résumant le mouvement de la session, formulées comme des observations"
}

Règles :
- dominant_emotions : maximum 3 émotions, en français, en minuscules.
- trigger_context : une phrase maximum, ce que l'utilisateur a décrit comme situation.
- expressed_needs : maximum 3 besoins, formulés simplement.
- themes : maximum 3 thèmes, en mots-clés simples (ex: "contrôle", "injustice", "épuisement").
- narrative_summary : 2-3 phrases MAXIMUM. Formulé comme des observations ("la session a mis en lumière…", "un mouvement vers…"). JAMAIS de diagnostic. Termine toujours par une phrase courte et positive commençant par "Tu es déjà en train de…" ou "Ça se construit." ou une formulation similaire qui reflète un mouvement, même léger.
- inner_truth : reprendre les mots exacts de l'utilisateur si possible.`;

// ===================================================================
// STEP_ORDER pour construire l'historique
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
// PARSING
// ===================================================================

interface SummaryData {
  dominant_emotions: string[];
  trigger_context: string;
  expressed_needs: string[];
  suggested_actions: string[];
  themes: string[];
  avg_tension_level: number;
  end_clarity_level: number;
  regulation_state: string;
  inner_truth: string;
  narrative_summary: string;
}

function parseSummaryJson(rawText: string): SummaryData | null {
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    return parsed as SummaryData;
  } catch {
    return null;
  }
}

function ensureSummaryFields(data: SummaryData): SummaryData {
  return {
    dominant_emotions: Array.isArray(data.dominant_emotions) ? data.dominant_emotions.slice(0, 3) : [],
    trigger_context: typeof data.trigger_context === "string" ? data.trigger_context : "",
    expressed_needs: Array.isArray(data.expressed_needs) ? data.expressed_needs.slice(0, 3) : [],
    suggested_actions: Array.isArray(data.suggested_actions) ? data.suggested_actions.slice(0, 3) : [],
    themes: Array.isArray(data.themes) ? data.themes.slice(0, 3) : [],
    avg_tension_level: typeof data.avg_tension_level === "number" ? Math.min(10, Math.max(0, data.avg_tension_level)) : 5,
    end_clarity_level: typeof data.end_clarity_level === "number" ? Math.min(10, Math.max(0, data.end_clarity_level)) : 5,
    regulation_state: ["stable", "fluctuating", "overloaded"].includes(data.regulation_state) ? data.regulation_state : "stable",
    inner_truth: typeof data.inner_truth === "string" ? data.inner_truth : "",
    narrative_summary: typeof data.narrative_summary === "string" ? data.narrative_summary : "",
  };
}

// ===================================================================
// AI LIMIT — mirrors the check in /api/tracea/route.ts
// ===================================================================

async function checkAiLimit(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // TODO: replace with Stripe subscription check when payment is integrated
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_subscribed")
      .eq("id", userId)
      .single();
    if (profile?.is_subscribed === true) return false;

    const { count } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);

    return (count ?? 0) >= 1;
  } catch {
    return false;
  }
}

// ===================================================================
// ROUTE POST
// ===================================================================

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      sessionId,
      steps,
      context,
      intensityBefore,
      intensityAfter,
      hadDoNotStore,
    } = body;

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "userId et sessionId requis" },
        { status: 400 }
      );
    }

    // Skip AI summarization for free users past the first session
    const aiLimited = await checkAiLimit(userId);
    if (aiLimited) {
      console.log("[TRACEA SUMMARIZE] AI limited for user:", userId.slice(0, 8));
      return NextResponse.json({ success: true, ai_limited: true });
    }

    console.log("[TRACEA SUMMARIZE] Generating summary for session:", sessionId);

    // Construire l'historique de la session
    let sessionHistory = `Contexte de la traversée : ${context}\n`;
    sessionHistory += `Intensité avant : ${intensityBefore}/10\n`;
    sessionHistory += `Intensité après : ${intensityAfter}/10\n\n`;
    sessionHistory += `Étapes de la session :\n`;

    for (const sid of STEP_ORDER) {
      if (steps[sid] && steps[sid].trim()) {
        sessionHistory += `\n${STEP_LABELS[sid] || sid} :\n"${steps[sid]}"\n`;
      }
    }

    // Appeler Claude pour générer le résumé
    const message = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      temperature: 0.3,
      system: SUMMARY_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: SUMMARY_DEVELOPER_PROMPT + "\n\nHistorique de la session :\n" + sessionHistory,
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    console.log("[TRACEA SUMMARIZE] Raw response length:", rawText.length);

    // Parser le JSON
    let summaryData = parseSummaryJson(rawText);

    if (!summaryData) {
      console.warn("[TRACEA SUMMARIZE] Failed to parse summary JSON, using defaults");
      summaryData = {
        dominant_emotions: [],
        trigger_context: "",
        expressed_needs: [],
        suggested_actions: [],
        themes: [],
        avg_tension_level: 5,
        end_clarity_level: 5,
        regulation_state: "stable",
        inner_truth: "",
        narrative_summary: "",
      };
    }

    // Normaliser les champs
    summaryData = ensureSummaryFields(summaryData);

    // Sauvegarder dans session_summaries
    const excludedFromMemory = hadDoNotStore === true;

    await saveSessionSummary(userId, sessionId, summaryData, excludedFromMemory);

    console.log(
      "[TRACEA SUMMARIZE] Summary saved. excluded_from_memory:",
      excludedFromMemory
    );

    // Mettre à jour le profil mémoire
    await updateMemoryProfile(userId);

    console.log("[TRACEA SUMMARIZE] Memory profile updated.");

    return NextResponse.json({
      success: true,
      summary: summaryData,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : "";
    console.error("[TRACEA SUMMARIZE] Error:", errMsg);
    console.error("[TRACEA SUMMARIZE] Stack:", errStack);

    // Retourner success: false au lieu d'un 500
    // pour que le client ne reste pas bloqué
    return NextResponse.json({
      success: false,
      error: errMsg,
    });
  }
}
