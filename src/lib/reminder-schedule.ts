// TRACÉA — Chantier 57 « Ancrage contextuel » — Brique 57-4
// Logique pure de calcul « ce rappel est-il dû maintenant ? », extraite de
// la route cron pour être testable indépendamment (aucun accès réseau/DB ici).
//
// Le cron Vercel tourne toutes les heures (24 entrées dans vercel.json, une
// par heure UTC — voir le commentaire dans vercel.json pour le pourquoi).
// Chaque passage recalcule, POUR CHAQUE rappel, son heure locale RÉELLE dans
// SON PROPRE fuseau (IANA, stocké en 57-1) — jamais une hypothèse de fuseau
// unique. La fenêtre de tolérance absorbe l'imprécision native des cron
// Vercel (jusqu'à ±59 min sur certains plans) sans jamais rater un rappel
// à cause d'un déclenchement légèrement décalé.

import type { ReminderCreneau } from "./supabase-store";

export const CRENEAU_TARGET_HOUR: Record<ReminderCreneau, number> = {
  matin: 8,
  midi: 13,
  soir: 20,
};

// Intl.DateTimeFormat("en-US", { weekday: "short" }) rend "Mon".."Sun" —
// vérifié empiriquement (voir preuve de test). Conversion vers ISO 8601
// (1=lundi … 7=dimanche, même convention que la colonne `jours`).
const WEEKDAY_TO_ISO: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function localPartsInZone(
  date: Date,
  timeZone: string
): { minutesSinceMidnight: number; isoWeekday: number; localDateKey: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  // hour "24" en hour12:false minuit (Node/ICU) — ramené à 0.
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  const weekday = get("weekday");
  const year = get("year");
  const month = get("month");
  const day = get("day");

  return {
    minutesSinceMidnight: hour * 60 + minute,
    isoWeekday: WEEKDAY_TO_ISO[weekday] ?? 0,
    localDateKey: `${year}-${month}-${day}`,
  };
}

/**
 * Un timestamp (ISO) tombe-t-il le même jour calendaire local, dans le
 * fuseau donné, que `now` ? Extrait de isReminderDueNow pour être réutilisé
 * tel quel par tout autre marqueur "déjà fait aujourd'hui" (ex. le nudge
 * in-app de 57-5, qui a son propre marqueur distinct de last_sent_at) —
 * même comparaison de date locale, jamais un simple delta horaire (robuste
 * au passage de minuit).
 */
export function isSameLocalDay(
  timestamp: string | null,
  now: Date,
  fuseau: string
): boolean {
  if (!timestamp) return false;
  const a = localPartsInZone(new Date(timestamp), fuseau);
  const b = localPartsInZone(now, fuseau);
  return a.localDateKey === b.localDateKey;
}

export type DueCheckInput = {
  fuseau: string;
  creneau: ReminderCreneau;
  jours: number[];
  lastSentAt: string | null;
  now: Date;
  toleranceMinutes?: number;
};

/**
 * Un rappel est dû si : (1) le jour local courant fait partie de `jours`,
 * (2) l'heure locale courante est à ± toleranceMinutes de l'heure cible du
 * créneau, ET (3) il n'a pas déjà été envoyé aujourd'hui (comparaison de
 * date locale, pas d'un simple delta horaire — robuste au passage de
 * minuit). `toleranceMinutes` par défaut 45 : couvre l'imprécision cumulée
 * de deux passages horaires consécutifs du cron sans jamais doublonner
 * grâce à la garde `lastSentAt`.
 */
export function isReminderDueNow(input: DueCheckInput): boolean {
  const { fuseau, creneau, jours, lastSentAt, now, toleranceMinutes = 45 } = input;

  const nowLocal = localPartsInZone(now, fuseau);

  if (!jours.includes(nowLocal.isoWeekday)) return false;

  const targetHour = CRENEAU_TARGET_HOUR[creneau];
  const targetMinutes = targetHour * 60;
  const delta = Math.abs(nowLocal.minutesSinceMidnight - targetMinutes);
  // Pas de gestion de wraparound minuit : les créneaux (8h/13h/20h) sont
  // assez loin de minuit pour qu'une tolérance de quelques dizaines de
  // minutes ne traverse jamais le changement de jour.
  if (delta > toleranceMinutes) return false;

  if (isSameLocalDay(lastSentAt, now, fuseau)) return false;

  return true;
}
