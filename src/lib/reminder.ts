const REMINDER_KEY = "tracea_reminder";
const NUDGE_SHOWN_KEY = "tracea_nudge_shown_today";

function todayLocal(): string {
  return new Date().toLocaleDateString("fr-CA");
}

export function getReminderPreference(): { hour: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.hour !== "number") return null;
    return { hour: parsed.hour };
  } catch {
    return null;
  }
}

export function setReminderPreference(hour: number): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(REMINDER_KEY, JSON.stringify({ hour })); } catch {}
}

export function clearReminderPreference(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(REMINDER_KEY); } catch {}
}

export function shouldShowNudge(): boolean {
  if (typeof window === "undefined") return false;
  const preference = getReminderPreference();
  if (!preference) return false;
  if (new Date().getHours() < preference.hour) return false;
  try {
    if (localStorage.getItem(NUDGE_SHOWN_KEY) === todayLocal()) return false;
  } catch {
    return false;
  }
  return true;
}

export function markNudgeShownToday(): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(NUDGE_SHOWN_KEY, todayLocal()); } catch {}
}
