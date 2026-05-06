import { createClient } from "@supabase/supabase-js";

// ===================================================================
// TRACÉA Phase 2 — Mémoire évolutive
// Fonctions serveur pour getMemoryContext, formatMemoryContext,
// updateMemoryProfile, extractKeywords, calculateTrend
// ===================================================================

/**
 * Client Supabase SERVEUR avec service role key.
 * Bypass RLS — utilisé uniquement dans les routes API serveur
 * pour les insertions/upserts dans session_summaries et user_memory_profile.
 *
 * IMPORTANT : SUPABASE_SERVICE_ROLE_KEY doit être défini dans .env.local
 * (sans le préfixe NEXT_PUBLIC_ pour qu'il reste côté serveur uniquement).
 */
function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "[TRACEA Memory] SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local.",
      "url:", !!url,
      "serviceKey:", !!serviceKey
    );
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante — ajoutez-la dans .env.local");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Client Supabase anon — utilisé uniquement pour les lectures
 * côté serveur (getMemoryContext) où RLS SELECT est permissif,
 * OU comme fallback si la service role key n'est pas configurée.
 */
function getSupabaseAnon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Retourne le client serveur si possible, sinon le client anon avec un warning.
 */
function getSupabase() {
  try {
    return getSupabaseServer();
  } catch {
    console.warn("[TRACEA Memory] Fallback sur clé anon — les insertions RLS échoueront probablement.");
    return getSupabaseAnon();
  }
}

// ===================================================================
// Types
// ===================================================================

export interface SessionSummary {
  id: string;
  user_id: string;
  session_id: string;
  created_at: string;
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
  excluded_from_memory: boolean;
}

export interface MemoryProfile {
  id: string;
  user_id: string;
  updated_at: string;
  recurring_patterns: string[];
  common_triggers: string[];
  effective_actions: string[];
  ineffective_patterns: string[];
  progress_trend: string;
  total_sessions: number;
  last_session_date: string;
  // Phase 3 — Score de progression
  emotional_awareness_score: number;
  regulation_score: number;
  action_alignment_score: number;
  overall_score: number;
  score_history: ScoreHistoryEntry[];
}

export interface ScoreHistoryEntry {
  date: string;
  overall: number;
  emotional_awareness: number;
  regulation: number;
  action_alignment: number;
}

export interface MemoryContext {
  profile: MemoryProfile | null;
  recentSummaries: Pick<
    SessionSummary,
    "narrative_summary" | "dominant_emotions" | "themes" | "inner_truth" | "created_at"
  >[];
}

// ===================================================================
// 4.1 — Récupérer le contexte mémoire
// ===================================================================

export async function getMemoryContext(userId: string): Promise<MemoryContext> {
  const supabase = getSupabase();

  // Profil mémoire
  const { data: profile, error: profileError } = await supabase
    .from("user_memory_profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 = "no rows returned" — normal pour un nouvel utilisateur
    console.warn("[TRACEA Memory] getMemoryContext profile error:", profileError.message);
  }

  // 3 derniers résumés (pour le contexte récent)
  const { data: recentSummaries, error: summariesError } = await supabase
    .from("session_summaries")
    .select("narrative_summary, dominant_emotions, themes, inner_truth, created_at")
    .eq("user_id", userId)
    .eq("excluded_from_memory", false)
    .order("created_at", { ascending: false })
    .limit(3);

  if (summariesError) {
    console.warn("[TRACEA Memory] getMemoryContext summaries error:", summariesError.message);
  }

  console.log("[TRACEA Memory] getMemoryContext:", {
    hasProfile: !!profile,
    summariesCount: recentSummaries?.length || 0,
  });

  return {
    profile: profile as MemoryProfile | null,
    recentSummaries: (recentSummaries || []) as MemoryContext["recentSummaries"],
  };
}

// ===================================================================
// 4.2 — Formater le contexte mémoire pour le prompt
// ===================================================================

export function formatMemoryContext(
  profile: MemoryProfile | null,
  recentSummaries: MemoryContext["recentSummaries"]
): string {
  if (!profile && (!recentSummaries || recentSummaries.length === 0)) {
    return ""; // Première session — pas de mémoire
  }

  let memoryBlock = `\n=== MÉMOIRE TRACÉA ===\n`;
  memoryBlock += `Cette personne a complété ${profile?.total_sessions || 0} session(s).\n`;

  // Patterns récurrents
  if (profile?.recurring_patterns && profile.recurring_patterns.length > 0) {
    memoryBlock += `\nThèmes récurrents observés : ${profile.recurring_patterns.join(", ")}.\n`;
  }

  // Déclencheurs fréquents
  if (profile?.common_triggers && profile.common_triggers.length > 0) {
    memoryBlock += `Contextes déclencheurs fréquents : ${profile.common_triggers.join(", ")}.\n`;
  }

  // Tendance de progression
  if (profile?.progress_trend) {
    const trendLabels: Record<string, string> = {
      improving: "Une tendance vers plus de clarté et moins de tension est observable.",
      stable: "Le niveau de tension et de clarté reste relativement stable.",
      fluctuating: "Le niveau de tension fluctue d'une session à l'autre.",
    };
    memoryBlock += `${trendLabels[profile.progress_trend] || ""}\n`;
  }

  // Résumés récents
  if (recentSummaries && recentSummaries.length > 0) {
    memoryBlock += `\nRésumés des dernières sessions :\n`;
    recentSummaries.forEach((s) => {
      const date = new Date(s.created_at).toLocaleDateString("fr-FR");
      memoryBlock += `- Session du ${date} : ${s.narrative_summary}`;
      if (s.inner_truth) {
        memoryBlock += ` Vérité intérieure : "${s.inner_truth}".`;
      }
      memoryBlock += `\n`;
    });
  }

  // Phase 3 — Progression observée (pour progress_signal)
  if (profile?.overall_score && profile.overall_score > 0 && (profile.total_sessions || 0) >= 3) {
    memoryBlock += `\nProgression observée :\n`;
    memoryBlock += `- Score global de progression : ${profile.overall_score}/100\n`;
    memoryBlock += `- Conscience émotionnelle : ${profile.emotional_awareness_score}/100\n`;
    memoryBlock += `- Régulation : ${profile.regulation_score}/100\n`;
    memoryBlock += `- Alignement action : ${profile.action_alignment_score}/100\n`;

    if (profile.progress_trend === "improving") {
      memoryBlock += `- Tendance : amélioration visible.\n`;
    }

    memoryBlock += `\nSi tu observes une évolution positive par rapport aux sessions précédentes, tu peux le refléter dans le champ progress_signal. Formule-le comme une observation factuelle, jamais comme un compliment ou une note. Exemples : "Tu sembles identifier plus vite ce qui se passe en toi", "La précision avec laquelle tu nommes ce que tu ressens a évolué." Ne force jamais un progress_signal — seulement si c'est sincèrement observable.\n`;
  }

  memoryBlock += `\n=== RÈGLES D'UTILISATION DE LA MÉMOIRE ===\n`;
  memoryBlock += `- Tu peux faire référence aux thèmes récurrents avec "je remarque que…" ou "ce thème semble revenir…".\n`;
  memoryBlock += `- Tu ne dois JAMAIS dire "tu es quelqu'un qui…" ou figer une identité.\n`;
  memoryBlock += `- Tu peux mentionner une vérité intérieure passée si elle est pertinente : "la dernière fois, tu avais formulé…".\n`;
  memoryBlock += `- Si c'est la première session, ignore ce bloc mémoire.\n`;
  memoryBlock += `- Utilise la mémoire avec parcimonie — pas à chaque étape, seulement quand c'est éclairant.\n`;

  return memoryBlock;
}

// ===================================================================
// 3.1 — Mise à jour du profil mémoire
// ===================================================================

export async function updateMemoryProfile(userId: string): Promise<void> {
  const supabase = getSupabase();

  // 1. Récupérer les 5 derniers résumés non exclus
  const { data: summaries, error: fetchError } = await supabase
    .from("session_summaries")
    .select("*")
    .eq("user_id", userId)
    .eq("excluded_from_memory", false)
    .order("created_at", { ascending: false })
    .limit(5);

  if (fetchError) {
    console.error("[TRACEA Memory] updateMemoryProfile SELECT error:", fetchError.message, fetchError.details);
    return;
  }

  if (!summaries || summaries.length === 0) {
    console.log("[TRACEA Memory] No summaries found for user, skipping profile update.");
    return;
  }

  console.log("[TRACEA Memory] Updating profile from", summaries.length, "summaries");

  // 2. Agréger les thèmes récurrents (ceux qui apparaissent dans 2+ sessions)
  const themeCount: Record<string, number> = {};
  summaries.forEach((s: SessionSummary) => {
    (s.themes || []).forEach((theme: string) => {
      themeCount[theme] = (themeCount[theme] || 0) + 1;
    });
  });
  const recurringPatterns = Object.entries(themeCount)
    .filter(([, count]) => count >= 2)
    .map(([theme, count]) => `${theme} (${count} sessions sur ${summaries.length})`)
    .slice(0, 5);

  // 3. Agréger les déclencheurs fréquents
  const triggerCount: Record<string, number> = {};
  summaries.forEach((s: SessionSummary) => {
    if (s.trigger_context) {
      const keywords = extractKeywords(s.trigger_context);
      keywords.forEach((kw: string) => {
        triggerCount[kw] = (triggerCount[kw] || 0) + 1;
      });
    }
  });
  const commonTriggers = Object.entries(triggerCount)
    .filter(([, count]) => count >= 2)
    .map(([trigger]) => trigger)
    .slice(0, 5);

  // 4. Agréger les actions efficaces
  const allActions = summaries.flatMap((s: SessionSummary) => s.suggested_actions || []);
  const effectiveActions = Array.from(new Set(allActions)).slice(0, 5);

  // 5. Calculer la tendance de progression
  const tensionTrend = summaries.map((s: SessionSummary) => s.avg_tension_level);
  const clarityTrend = summaries.map((s: SessionSummary) => s.end_clarity_level);
  const progressTrend = calculateTrend(tensionTrend, clarityTrend);

  // 6. Compter le total de sessions
  const { count } = await supabase
    .from("session_summaries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  // 7. Phase 3 — Calculer le score de progression
  const existingProfile = await supabase
    .from("user_memory_profile")
    .select("score_history, effective_actions")
    .eq("user_id", userId)
    .single();

  const currentProfile = existingProfile.data as MemoryProfile | null;
  const scores = calculateProgressionScore(summaries as SessionSummary[], currentProfile);

  // Ajouter au score_history (garder les 20 derniers points)
  const currentHistory: ScoreHistoryEntry[] = (currentProfile?.score_history as ScoreHistoryEntry[] | null) || [];
  const newHistoryEntry: ScoreHistoryEntry = {
    date: new Date().toISOString(),
    overall: scores.overall,
    emotional_awareness: scores.emotional_awareness,
    regulation: scores.regulation,
    action_alignment: scores.action_alignment,
  };
  const updatedHistory = [newHistoryEntry, ...currentHistory].slice(0, 20);

  console.log("[TRACEA Memory] Scores:", scores, "History entries:", updatedHistory.length);

  // 8. Upsert dans user_memory_profile (avec scores Phase 3)
  const { error: upsertError } = await supabase.from("user_memory_profile").upsert(
    {
      user_id: userId,
      recurring_patterns: recurringPatterns,
      common_triggers: commonTriggers,
      effective_actions: effectiveActions,
      progress_trend: progressTrend,
      total_sessions: count || summaries.length,
      last_session_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Phase 3 — Scores
      emotional_awareness_score: scores.emotional_awareness,
      regulation_score: scores.regulation,
      action_alignment_score: scores.action_alignment,
      overall_score: scores.overall,
      score_history: updatedHistory,
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    console.error("[TRACEA Memory] updateMemoryProfile UPSERT error:", upsertError.message, upsertError.details, upsertError.hint);
  } else {
    console.log("[TRACEA Memory] Profile upserted successfully for user:", userId);
  }
}

// ===================================================================
// Phase 3 — Calcul du score de progression
// ===================================================================

export function calculateProgressionScore(
  summaries: SessionSummary[],
  profile: MemoryProfile | null
): {
  emotional_awareness: number;
  regulation: number;
  action_alignment: number;
  overall: number;
} {
  if (!summaries || summaries.length === 0) {
    return { emotional_awareness: 0, regulation: 0, action_alignment: 0, overall: 0 };
  }

  const sessionCount = summaries.length;

  // === EMOTIONAL AWARENESS (0-100) ===

  // Diversité émotionnelle : combien d'émotions distinctes
  const allEmotions = summaries.flatMap((s) => s.dominant_emotions || []);
  const uniqueEmotions = new Set(allEmotions.map((e) => e.toLowerCase().trim()));
  const emotionDiversity = Math.min(uniqueEmotions.size * 15, 40); // max 40 pts

  // Clarté moyenne en fin de session
  const avgClarity =
    summaries.reduce((sum, s) => sum + (s.end_clarity_level || 5), 0) / sessionCount;
  const clarityScore = Math.min(avgClarity * 4, 30); // max 30 pts

  // Vérités intérieures formulées
  const truthCount = summaries.filter(
    (s) => s.inner_truth && s.inner_truth.trim() !== ""
  ).length;
  const truthScore = Math.min((truthCount / sessionCount) * 30, 30); // max 30 pts

  const emotionalAwareness = Math.round(emotionDiversity + clarityScore + truthScore);

  // === REGULATION (0-100) ===

  // Points de régulation moyens
  const avgRegulation =
    summaries.reduce((sum, s) => {
      const tensionDrop =
        (s.avg_tension_level || 5) > (s.end_clarity_level || 5)
          ? s.avg_tension_level - s.end_clarity_level
          : 0;
      return sum + tensionDrop;
    }, 0) / sessionCount;
  const regulationPoints = Math.min(avgRegulation * 10, 40); // max 40 pts

  // Sessions stables
  const stableSessions = summaries.filter(
    (s) => s.regulation_state === "stable"
  ).length;
  const stabilityScore = Math.min((stableSessions / sessionCount) * 30, 30); // max 30 pts

  // Tendance de tension
  let tensionTrend = 15;
  if (sessionCount >= 3) {
    const recentAvg =
      summaries.slice(0, 2).reduce((s, x) => s + (x.avg_tension_level || 5), 0) / 2;
    const olderAvg =
      summaries.slice(-2).reduce((s, x) => s + (x.avg_tension_level || 5), 0) / 2;
    if (recentAvg < olderAvg) tensionTrend = 30;
    else if (recentAvg === olderAvg) tensionTrend = 15;
    else tensionTrend = 5;
  }

  const regulation = Math.round(regulationPoints + stabilityScore + tensionTrend);

  // === ACTION ALIGNMENT (0-100) ===

  // Sessions avec micro-actions
  const actionSessions = summaries.filter(
    (s) => s.suggested_actions && s.suggested_actions.length > 0
  ).length;
  const actionPresence = Math.min((actionSessions / sessionCount) * 50, 50); // max 50 pts

  // Diversité des actions
  const allActions = summaries.flatMap((s) => s.suggested_actions || []);
  const uniqueActions = new Set(allActions.map((a) => a.toLowerCase().trim()));
  const actionDiversity = Math.min(uniqueActions.size * 10, 30); // max 30 pts

  // Actions efficaces identifiées
  const effectiveCount = (profile?.effective_actions || []).length;
  const effectiveScore = Math.min(effectiveCount * 10, 20); // max 20 pts

  const actionAlignment = Math.round(actionPresence + actionDiversity + effectiveScore);

  // === SCORE GLOBAL ===
  const overall = Math.round(
    emotionalAwareness * 0.4 + regulation * 0.35 + actionAlignment * 0.25
  );

  return {
    emotional_awareness: Math.min(emotionalAwareness, 100),
    regulation: Math.min(regulation, 100),
    action_alignment: Math.min(actionAlignment, 100),
    overall: Math.min(overall, 100),
  };
}

// ===================================================================
// Helpers
// ===================================================================

export function extractKeywords(text: string): string[] {
  // Mots vides à ignorer
  const stopWords = new Set([
    "le", "la", "les", "un", "une", "des", "de", "du", "au", "aux",
    "et", "ou", "mais", "donc", "car", "ni", "que", "qui", "quoi",
    "ce", "cette", "ces", "mon", "ma", "mes", "ton", "ta", "tes",
    "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs",
    "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "on",
    "me", "te", "se", "en", "y", "ne", "pas", "plus", "très",
    "dans", "sur", "sous", "avec", "sans", "pour", "par", "chez",
    "est", "suis", "es", "sont", "ai", "as", "a", "ont", "été",
    "avoir", "être", "faire", "dit", "fait",
    "tout", "bien", "comme", "aussi", "encore", "même", "trop",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[.,;:!?'"()[\]{}]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  // Dédupliquer et garder les mots significatifs
  return Array.from(new Set(words)).slice(0, 5);
}

export function calculateTrend(
  tensionLevels: number[],
  clarityLevels: number[]
): "improving" | "stable" | "fluctuating" {
  if (tensionLevels.length < 2) return "stable";

  // Comparer la moyenne des 2 premières sessions (récentes) vs les 2 dernières (anciennes)
  const recentTension =
    tensionLevels.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
  const olderTension =
    tensionLevels.slice(-2).reduce((a, b) => a + b, 0) / 2;
  const recentClarity =
    clarityLevels.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
  const olderClarity =
    clarityLevels.slice(-2).reduce((a, b) => a + b, 0) / 2;

  if (recentTension < olderTension - 1 && recentClarity > olderClarity + 1)
    return "improving";
  if (recentTension > olderTension + 1) return "fluctuating";
  return "stable";
}

// ===================================================================
// Sauvegarde du résumé de session
// ===================================================================

export async function saveSessionSummary(
  userId: string,
  sessionId: string,
  summary: Omit<SessionSummary, "id" | "user_id" | "session_id" | "created_at" | "excluded_from_memory">,
  excludedFromMemory: boolean = false
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from("session_summaries").insert({
    user_id: userId,
    session_id: sessionId,
    dominant_emotions: summary.dominant_emotions,
    trigger_context: summary.trigger_context,
    expressed_needs: summary.expressed_needs,
    suggested_actions: summary.suggested_actions,
    themes: summary.themes,
    avg_tension_level: summary.avg_tension_level,
    end_clarity_level: summary.end_clarity_level,
    regulation_state: summary.regulation_state,
    inner_truth: summary.inner_truth,
    narrative_summary: summary.narrative_summary,
    excluded_from_memory: excludedFromMemory,
  });

  if (error) {
    console.error("[TRACEA Memory] saveSessionSummary INSERT error:", error.message, error.details, error.hint);
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
}

// ===================================================================
// Fonctions client (pour la page profil)
// ===================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMemoryProfileClient(supabaseClient: any, userId: string): Promise<MemoryProfile | null> {
  const { data } = await supabaseClient
    .from("user_memory_profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data as MemoryProfile | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRecentInnerTruths(
  supabaseClient: any,
  userId: string,
  limit: number = 5
): Promise<{ inner_truth: string; created_at: string }[]> {
  const { data } = await supabaseClient
    .from("session_summaries")
    .select("inner_truth, created_at")
    .eq("user_id", userId)
    .eq("excluded_from_memory", false)
    .neq("inner_truth", "")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []) as { inner_truth: string; created_at: string }[];
}

// Lecture par lot : récupère les résumés de sessions ciblées par sessionIds.
// Retour : objet indexé par session_id pour lookup O(1) côté UI.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSessionSummariesByIds(
  supabaseClient: any,
  userId: string,
  sessionIds: string[]
): Promise<Record<string, Pick<SessionSummary,
  "session_id" | "inner_truth" | "narrative_summary" | "dominant_emotions" | "created_at"
>>> {
  if (sessionIds.length === 0) return {};

  try {
    const { data, error } = await supabaseClient
      .from("session_summaries")
      .select("session_id, inner_truth, narrative_summary, dominant_emotions, created_at")
      .eq("user_id", userId)
      .in("session_id", sessionIds)
      .eq("excluded_from_memory", false);

    if (error) {
      console.warn("[TRACEA Memory] getSessionSummariesByIds error:", error.message);
      return {};
    }

    const rows = (data || []) as Pick<SessionSummary,
      "session_id" | "inner_truth" | "narrative_summary" | "dominant_emotions" | "created_at"
    >[];

    const result: Record<string, Pick<SessionSummary,
      "session_id" | "inner_truth" | "narrative_summary" | "dominant_emotions" | "created_at"
    >> = {};
    for (const row of rows) {
      if (row.session_id) result[row.session_id] = row;
    }
    return result;
  } catch {
    return {};
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deleteMemoryData(
  supabaseClient: any,
  userId: string
): Promise<void> {
  await supabaseClient
    .from("session_summaries")
    .delete()
    .eq("user_id", userId);

  await supabaseClient
    .from("user_memory_profile")
    .delete()
    .eq("user_id", userId);
}

// ===================================================================
// Phase B — Agrégations récurrentes (long flow)
// Lectures côté client : authentification RLS via le client browser.
// Seuils stricts : pas de carte si la donnée n'est pas significative.
// ===================================================================

const RECURRING_WINDOW = 5;        // 5 derniers résumés non exclus
const RECURRING_MIN_SESSIONS = 3;  // pas de signal sous 3 sessions résolues
const RECURRING_MIN_OCCURRENCES = 2; // doit apparaître dans >= 2 sessions

function aggregateTopFromArrayField(
  rows: { values: string[] | null }[]
): { value: string; count: number } | null {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const seenInRow = new Set<string>();
    for (const raw of row.values || []) {
      const key = (raw || "").toLowerCase().trim();
      if (!key || seenInRow.has(key)) continue;
      seenInRow.add(key);
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
  if (!top || top[1] < RECURRING_MIN_OCCURRENCES) return null;
  return { value: top[0], count: top[1] };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRecurringEmotions(
  supabaseClient: any,
  userId: string
): Promise<{ emotion: string; count: number } | null> {
  try {
    const { data, error } = await supabaseClient
      .from("session_summaries")
      .select("dominant_emotions")
      .eq("user_id", userId)
      .eq("excluded_from_memory", false)
      .order("created_at", { ascending: false })
      .limit(RECURRING_WINDOW);

    if (error) {
      console.warn("[TRACEA Memory] getRecurringEmotions error:", error.message);
      return null;
    }
    if (!data || data.length < RECURRING_MIN_SESSIONS) return null;

    const top = aggregateTopFromArrayField(
      (data as { dominant_emotions: string[] | null }[]).map((r) => ({
        values: r.dominant_emotions,
      }))
    );
    if (!top) return null;
    return { emotion: top.value, count: top.count };
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRecurringNeeds(
  supabaseClient: any,
  userId: string
): Promise<{ need: string; count: number } | null> {
  try {
    const { data, error } = await supabaseClient
      .from("session_summaries")
      .select("expressed_needs")
      .eq("user_id", userId)
      .eq("excluded_from_memory", false)
      .order("created_at", { ascending: false })
      .limit(RECURRING_WINDOW);

    if (error) {
      console.warn("[TRACEA Memory] getRecurringNeeds error:", error.message);
      return null;
    }
    if (!data || data.length < RECURRING_MIN_SESSIONS) return null;

    const top = aggregateTopFromArrayField(
      (data as { expressed_needs: string[] | null }[]).map((r) => ({
        values: r.expressed_needs,
      }))
    );
    if (!top) return null;
    return { need: top.value, count: top.count };
  } catch {
    return null;
  }
}
