import { SessionData, UserProfile, StepId } from "./types";

const SESSIONS_KEY = "tracea_sessions";
const PROFILE_KEY = "tracea_profile";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// --- Sessions ---

export function getSessions(): SessionData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getSession(id: string): SessionData | null {
  return getSessions().find((s) => s.id === id) ?? null;
}

export function createSession(
  intensiteBefore: number,
  context: SessionData["context"]
): SessionData {
  const session: SessionData = {
    id: generateId(),
    date: new Date().toISOString(),
    intensiteBefore,
    intensiteAfter: null,
    context,
    steps: {
      traverser: "",
      reconnaitre: "",
      ancrer: "",
      conscientiser: "",
      emerger: "",
      aligner: "",
    },
    currentStep: 0,
    completed: false,
    analysis: null,
    emotionPrimaire: null,
    veriteInterieure: null,
    actionAlignee: null,
  };
  const sessions = getSessions();
  sessions.unshift(session);
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
  return session;
}

export function updateSession(id: string, updates: Partial<SessionData>): void {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  sessions[idx] = { ...sessions[idx], ...updates };
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
}

export function getCompletedSessions(): SessionData[] {
  return getSessions().filter((s) => s.completed);
}

export function getLastSession(): SessionData | null {
  const sessions = getSessions();
  return sessions.length > 0 ? sessions[0] : null;
}

// --- Profile ---

export function getProfile(): UserProfile {
  const fallback: UserProfile = { name: "", sessionsCount: 0, firstSessionDate: null, lastSessionDate: null };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function updateProfile(updates: Partial<UserProfile>): void {
  const profile = getProfile();
  const updated = { ...profile, ...updates };
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(updated)); } catch {}
}

// --- Stats ---

export function getStats() {
  const sessions = getCompletedSessions();
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
