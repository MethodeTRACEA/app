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

// --- Tracking queries ---

export async function getSessionEndCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("tracea_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event", "session_end");
  return count ?? 0;
}

export async function getTopAnchorMethod(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("tracea_events")
    .select("data")
    .eq("user_id", userId)
    .eq("event", "step_complete")
    .filter("data->>step", "eq", "ancrer");

  if (!data || data.length === 0) return null;

  const counts: Record<string, number> = {};
  data.forEach((row) => {
    const value = (row.data as Record<string, unknown>)?.value;
    if (typeof value === "string" && ["appuis", "autour", "souffle"].includes(value)) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
  return top && top[1] >= 2 ? top[0] : null; // at least 2 uses to be "dominant"
}

export async function getTopRessentiValues(userId: string, limit = 2): Promise<string[]> {
  const { data } = await supabase
    .from("tracea_events")
    .select("data")
    .eq("user_id", userId)
    .eq("event", "step_complete")
    .filter("data->>step", "eq", "ressenti");

  if (!data || data.length === 0) return [];

  const counts: Record<string, number> = {};
  data.forEach((row) => {
    const value = (row.data as Record<string, unknown>)?.value;
    if (typeof value === "string" && value.trim()) {
      const v = value.trim();
      counts[v] = (counts[v] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([v]) => v);
}

export async function getTopEmergerValues(userId: string, limit = 3): Promise<string[]> {
  const { data } = await supabase
    .from("tracea_events")
    .select("data")
    .eq("user_id", userId)
    .eq("event", "step_complete")
    .filter("data->>step", "eq", "emerger");

  if (!data || data.length === 0) return [];

  const counts: Record<string, number> = {};
  data.forEach((row) => {
    const value = (row.data as Record<string, unknown>)?.value;
    if (typeof value === "string" && value.trim()) {
      const v = value.trim();
      counts[v] = (counts[v] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([v]) => v);
}

// ─────────────────────────────────────────────────────────
// PREMIUM MEMORY V2 — Repères descriptifs sans interprétation
// ─────────────────────────────────────────────────────────

export type PremiumMemory = {
  ceQuiRevient:        string | null;
  ceQuiSembleDemandem: string | null;
  ceQuiTAide:          string | null;
  ceQuePeutTester:     string | null;
};

// Seuil minimum de sessions pour activer la mémoire
const PM_MIN = 3;

// Besoins connus (émerger V2 — traversée courte)
const PM_KNOWN_NEEDS = new Set([
  "ralentir", "revenir au corps", "faire une pause", "clarifier",
  "me sentir en sécurité", "relâcher la pression", "prendre de l'espace",
  "être soutenu", "me reposer", "être tranquille",
  "me rapprocher de quelque chose de sûr", "revenir au simple",
  "me stabiliser", "y voir plus clair", "me dégager", "me protéger",
  "poser une limite", "relâcher la tension",
]);

// Helpers — sentence builders
const PM_RESSENTI_LABELS: Record<string, string> = {
  serre:  "la tension",
  agite:  "l'agitation",
  lourd:  "la lourdeur",
  flou:   "le flou",
  vide:   "le vide",
  bloque: "le blocage",
};
const PM_ZONE_LABELS: Record<string, string> = {
  poitrine: "dans la poitrine",
  ventre:   "dans le ventre",
  gorge:    "dans la gorge",
  tete:     "dans la tête",
  epaules:  "dans les épaules",
  partout:  "partout",
};
const PM_NEED_SENTENCES: Record<string, string> = {
  "ralentir":                              "Le besoin de ralentir revient souvent.",
  "revenir au corps":                      "Le besoin de revenir au corps apparaît souvent.",
  "faire une pause":                       "Le besoin de faire une pause revient souvent.",
  "clarifier":                             "Le besoin de clarifier apparaît souvent.",
  "me sentir en sécurité":               "Le besoin de sécurité revient souvent.",
  "relâcher la pression":                "Le besoin de relâcher la pression revient souvent.",
  "prendre de l'espace":                 "Le besoin d'espace revient souvent.",
  "être soutenu":                          "Le besoin d'être soutenu apparaît souvent.",
  "me reposer":                            "Le besoin de repos revient souvent.",
  "être tranquille":                       "Le besoin de tranquillité revient souvent.",
  "me rapprocher de quelque chose de sûr":"Le besoin de quelque chose de sûr revient souvent.",
  "revenir au simple":                     "Le besoin de revenir au simple revient souvent.",
  "me stabiliser":                         "Le besoin de stabilisation revient souvent.",
  "y voir plus clair":                     "Le besoin d'y voir plus clair revient souvent.",
  "me dégager":                            "Le besoin de se dégager revient souvent.",
  "me protéger":                           "Le besoin de protection revient souvent.",
  "poser une limite":                      "Le besoin de poser une limite apparaît souvent.",
  "relâcher la tension":                   "Le besoin de relâcher la tension revient souvent.",
};
const PM_AIDE_SENTENCES: Record<string, string> = {
  appuis: "Revenir aux appuis t'aide souvent.",
  autour: "Prendre un peu de distance t'aide souvent.",
  souffle:"Ralentir le souffle t'aide souvent.",
};
const PM_TESTER_BY_RESSENTI: Record<string, string> = {
  agite:  "La prochaine fois, tu peux observer si l'agitation est déjà là avant que ça monte.",
  serre:  "Tu peux repartir de ce point-là la prochaine fois.",
  lourd:  "La prochaine fois, tu peux voir si ce repère est déjà là plus tôt.",
  flou:   "Tu peux repartir de ce point-là la prochaine fois.",
  vide:   "La prochaine fois, tu peux observer ce qui est là avant.",
  bloque: "Tu peux tester ce repère un peu plus tôt la prochaine fois.",
};

function pmTop(counts: Record<string, number>, min: number): string | null {
  const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
  return top && top[1] >= min ? top[0] : null;
}
function pmCap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function getPremiumMemory(userId: string): Promise<PremiumMemory | null> {
  try {
    // Single query — all relevant events
    const { data: events } = await supabase
      .from("tracea_events")
      .select("event, data")
      .eq("user_id", userId)
      .or("event.eq.session_end,event.eq.step_complete");

    if (!events) return null;

    // Condition d'activation : >= 3 sessions terminées
    const sessionCount = events.filter((e) => e.event === "session_end").length;
    if (sessionCount < PM_MIN) return null;

    // Compter les valeurs par step
    const ressentiC: Record<string, number> = {};
    const corpsC:    Record<string, number> = {};
    const ancrerC:   Record<string, number> = {};
    const needC:     Record<string, number> = {};

    for (const e of events) {
      if (e.event !== "step_complete") continue;
      const d = e.data as Record<string, unknown>;
      const step  = d?.step  as string | undefined;
      const value = d?.value as string | undefined;
      if (!step || !value) continue;

      if (step === "ressenti") ressentiC[value] = (ressentiC[value] || 0) + 1;
      if (step === "corps")    corpsC[value]    = (corpsC[value]    || 0) + 1;
      if (step === "ancrer" && ["appuis","autour","souffle"].includes(value))
        ancrerC[value] = (ancrerC[value] || 0) + 1;
      if (step === "emerger" && PM_KNOWN_NEEDS.has(value))
        needC[value]   = (needC[value]   || 0) + 1;
    }

    const topRessenti = pmTop(ressentiC, PM_MIN);
    const topZone     = pmTop(corpsC,    PM_MIN);
    const topAncrer   = pmTop(ancrerC,   PM_MIN);
    const topNeed     = pmTop(needC,     PM_MIN);

    // ── Bloc 1 : ce qui revient ─────────────────────────────
    const r = topRessenti ? PM_RESSENTI_LABELS[topRessenti] : null;
    const z = topZone     ? PM_ZONE_LABELS[topZone]         : null;
    const ceQuiRevient =
      r && z ? `${pmCap(r)} ${z} revient souvent.`  :
      r       ? `${pmCap(r)} revient souvent.`       :
      null;

    // ── Bloc 2 : ce qui semble demandé ─────────────────────
    const ceQuiSembleDemandem = topNeed
      ? (PM_NEED_SENTENCES[topNeed] ?? `Le besoin de ${topNeed} revient souvent.`)
      : null;

    // ── Bloc 3 : ce qui t'aide ──────────────────────────────
    const ceQuiTAide = topAncrer ? (PM_AIDE_SENTENCES[topAncrer] ?? null) : null;

    // ── Bloc 4 : ce que tu peux tester ─────────────────────
    const ceQuePeutTester = (ceQuiRevient || ceQuiSembleDemandem)
      ? (topNeed
          ? "La prochaine fois, tu peux remarquer si ce besoin est déjà là avant que ça monte."
          : (topRessenti && PM_TESTER_BY_RESSENTI[topRessenti])
            ? PM_TESTER_BY_RESSENTI[topRessenti]
            : "Tu peux repartir de ce point-là la prochaine fois."
        )
      : null;

    return { ceQuiRevient, ceQuiSembleDemandem, ceQuiTAide, ceQuePeutTester };
  } catch {
    return null;
  }
}

// --- Tracking events ---

export async function trackEvent(
  userId: string | null,
  event: string,
  data?: Record<string, unknown>
) {
  await supabase.from("tracea_events").insert({
    user_id: userId,
    event,
    data: data ?? {},
  });
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
