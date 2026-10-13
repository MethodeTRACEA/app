import * as Sentry from "@sentry/nextjs";

const PII_KEYS = [
  "email",
  "session_summary",
  "dominant_emotions",
  "expressed_needs",
];

// Le Cercle TRACÉA en ligne (/cercle/*) ne charge aucun traceur : Sentry
// navigateur n'y est pas démarré. Si Sentry a déjà été démarré sur une
// autre page du site, tout événement venant d'une adresse /cercle est jeté.
function isCerclePath(): boolean {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return p === "/cercle" || p.startsWith("/cercle/");
}

if (!isCerclePath()) Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSendTransaction(event) {
    return isCerclePath() ? null : event;
  },
  beforeSend(event) {
    if (isCerclePath()) return null;
    try {
      const serialized = JSON.stringify(event).toLowerCase();
      if (PII_KEYS.some((k) => serialized.includes(k))) return null;
    } catch {
      return null;
    }
    return event;
  },
});
