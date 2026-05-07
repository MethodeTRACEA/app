import * as Sentry from "@sentry/nextjs";

const PII_KEYS = [
  "email",
  "session_summary",
  "dominant_emotions",
  "expressed_needs",
];

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    try {
      const serialized = JSON.stringify(event).toLowerCase();
      if (PII_KEYS.some((k) => serialized.includes(k))) return null;
    } catch {
      return null;
    }
    return event;
  },
});
