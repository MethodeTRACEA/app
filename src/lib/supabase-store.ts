import { supabase } from "./supabase";
import type { SessionData, StepId } from "./types";

// --- Sessions ---

export async function getSessionsDb(userId: string): Promise<SessionData[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error || !data) return [];
  return data.map(mapDbToSession);
}

export async function getCompletedSessionsDb(
  userId: string
): Promise<SessionData[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", true)
    .order("date", { ascending: false });

  if (error || !data) return [];
  return data.map(mapDbToSession);
}

export async function getSessionDb(
  sessionId: string
): Promise<SessionData | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !data) return null;
  return mapDbToSession(data);
}

export async function createSessionDb(
  userId: string,
  intensiteBefore: number,
  context: SessionData["context"]
): Promise<SessionData | null> {
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      intensity_before: intensiteBefore,
      context,
      steps: {
        traverser: "",
        reconnaitre: "",
        ancrer: "",
        conscientiser: "",
        emerger: "",
        aligner: "",
      },
      completed: false,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapDbToSession(data);
}

export async function updateSessionDb(
  sessionId: string,
  updates: Partial<{
    steps: Record<StepId, string>;
    intensity_after: number;
    emotion_primaire: string;
    verite_interieure: string;
    action_alignee: string;
    analysis: string;
    completed: boolean;
    note_entre_sessions: string;
  }>
): Promise<void> {
  await supabase.from("sessions").update(updates).eq("id", sessionId);
}

export async function deleteSessionDb(sessionId: string): Promise<void> {
  await supabase.from("sessions").delete().eq("id", sessionId);
}

// --- Profile ---

export async function getProfileDb(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function updateProfileDb(
  userId: string,
  updates: { display_name?: string }
) {
  await supabase.from("profiles").update(updates).eq("id", userId);
}

// --- Consent logs ---

export async function logConsent(
  userId: string,
  consentType: string,
  granted: boolean,
  version: string
) {
  await supabase.from("consent_logs").insert({
    user_id: userId,
    consent_type: consentType,
    granted,
    version,
  });
}

// --- Stats (for user) ---

export async function getUserStatsDb(userId: string) {
  const sessions = await getCompletedSessionsDb(userId);
  const total = sessions.length;
  if (total === 0) {
    return {
      total: 0,
      avgRecovery: 0,
      topEmotions: [] as string[],
      lastWeekCount: 0,
    };
  }

  const recoveries = sessions
    .filter((s) => s.intensiteAfter !== null)
    .map((s) => s.intensiteBefore - (s.intensiteAfter ?? 0));
  const avgRecovery =
    recoveries.length > 0
      ? recoveries.reduce((a, b) => a + b, 0) / recoveries.length
      : 0;

  const emotionCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.emotionPrimaire) {
      const e = s.emotionPrimaire.toLowerCase().trim();
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    }
  });
  const topEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([e]) => e);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const lastWeekCount = sessions.filter(
    (s) => new Date(s.date) >= oneWeekAgo
  ).length;

  return { total, avgRecovery, topEmotions, lastWeekCount };
}

// --- Admin stats ---

export async function getAdminStats() {
  const { data } = await supabase.from("admin_stats").select("*").single();
  return data;
}

export async function getAdminWeeklyStats() {
  const { data } = await supabase
    .from("admin_weekly_stats")
    .select("*")
    .order("week", { ascending: false })
    .limit(12);
  return data ?? [];
}

// --- Data export (portabilite RGPD) ---

export async function exportUserData(userId: string) {
  const [profile, sessions, consents] = await Promise.all([
    getProfileDb(userId),
    getSessionsDb(userId),
    supabase
      .from("consent_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => data ?? []),
  ]);

  return {
    export_date: new Date().toISOString(),
    profile,
    sessions,
    consent_logs: consents,
  };
}

// --- Delete account (droit a l'effacement) ---

export async function deleteAccount(userId: string) {
  // Cascade will handle sessions and consent_logs
  // But we delete sessions explicitly first for clarity
  await supabase.from("sessions").delete().eq("user_id", userId);
  await supabase.from("consent_logs").delete().eq("user_id", userId);
  await supabase.from("profiles").delete().eq("id", userId);
}

// --- LocalStorage migration ---

export async function migrateFromLocalStorage(userId: string) {
  const raw = localStorage.getItem("tracea_sessions");
  if (!raw) return 0;

  let localSessions: SessionData[];
  try {
    localSessions = JSON.parse(raw);
  } catch {
    return 0;
  }

  const completedSessions = localSessions.filter((s) => s.completed);
  if (completedSessions.length === 0) return 0;

  const rows = completedSessions.map((s) => ({
    user_id: userId,
    date: s.date,
    context: s.context,
    intensity_before: s.intensiteBefore,
    intensity_after: s.intensiteAfter,
    steps: s.steps,
    emotion_primaire: s.emotionPrimaire,
    verite_interieure: s.veriteInterieure,
    action_alignee: s.actionAlignee,
    analysis: s.analysis,
    completed: true,
  }));

  const { error } = await supabase.from("sessions").insert(rows);
  if (!error) {
    localStorage.removeItem("tracea_sessions");
    localStorage.removeItem("tracea_profile");
    return completedSessions.length;
  }
  return 0;
}

// --- Helpers ---

function mapDbToSession(row: Record<string, unknown>): SessionData {
  return {
    id: row.id as string,
    date: row.date as string,
    intensiteBefore: row.intensity_before as number,
    intensiteAfter: (row.intensity_after as number) ?? null,
    context: row.context as SessionData["context"],
    steps: (row.steps as Record<StepId, string>) ?? {
      traverser: "",
      reconnaitre: "",
      ancrer: "",
      conscientiser: "",
      emerger: "",
      aligner: "",
    },
    currentStep: 0,
    completed: row.completed as boolean,
    analysis: (row.analysis as string) ?? null,
    emotionPrimaire: (row.emotion_primaire as string) ?? null,
    veriteInterieure: (row.verite_interieure as string) ?? null,
    actionAlignee: (row.action_alignee as string) ?? null,
  };
}
