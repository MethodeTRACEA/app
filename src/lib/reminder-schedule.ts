// TRACÉA — Chantier 57 « Ancrage contextuel » — Briques 57-4 et 57-7
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
//
// 57-7 — DEUX SCHÉMAS COEXISTENT tant que 57-8 n'a pas remplacé l'écran
// d'armement actuel (/app/rappels) :
//   - ancien (57-1 à 57-6) : `creneau` (matin/midi/soir fixes) + `jours`
//     (jours de semaine cochés, répétition implicite).
//   - nouveau (57-7+) : `date` + `heure` (libre) + `recurrent` (true = se
//     répète chaque semaine au jour de semaine de `date` ; false = ponctuel,
//     dû une seule fois à `date`).
// isReminderDueNow détecte lui-même quel schéma une ligne utilise (présence
// de `date`+`heure`) — un rappel créé par l'écran actuel (date/heure/recurrent
// tous NULL) continue d'être évalué exactement comme avant, sans régression.

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

// Jour de semaine ISO (1=lundi…7=dimanche) d'une date calendaire pure
// "YYYY-MM-DD". Volontairement PAS de fuseau ici : une date calendaire seule
// (colonne Postgres `date`, sans heure) tombe le même jour de semaine peu
// importe le fuseau depuis lequel on la regarde — interprétation UTC pure
// pour ne jamais introduire un décalage de fuseau qui n'a pas de sens ici.
function isoWeekdayOfDateString(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utcDate = new Date(Date.UTC(y, m - 1, d));
  const jsDay = utcDate.getUTCDay(); // 0=dimanche..6=samedi
  return jsDay === 0 ? 7 : jsDay; // ISO : 1=lundi..7=dimanche
}

// Un rappel PONCTUEL (recurrent=false) dont `date` est strictement avant la
// date locale actuelle (dans le fuseau de la personne) est passé — il ne
// sera plus jamais dû. Utilisé par le cron (57-7 §4) pour le désarmement
// automatique ; exportée séparément pour rester testable sans DB.
export function isPastOneTimeReminder(
  date: string,
  fuseau: string,
  now: Date
): boolean {
  return date < localPartsInZone(now, fuseau).localDateKey;
}

export type DueCheckInput = {
  fuseau: string;
  lastSentAt: string | null;
  now: Date;
  toleranceMinutes?: number;
  // Ancien schéma (57-1 à 57-6, écran /app/rappels actuel — créneau fixe +
  // jours de semaine cochés). Laisser `date`/`heure` absents pour ce chemin.
  creneau?: ReminderCreneau;
  jours?: number[];
  // Nouveau schéma (57-7+, futur écran 57-8) — heure libre "HH:MM" ou
  // "HH:MM:SS" (format renvoyé par Postgres `time` via PostgREST), date
  // calendaire "YYYY-MM-DD" (colonne Postgres `date`). `recurrent=true` :
  // se répète chaque semaine au jour de semaine de `date`. `recurrent=false`
  // (ponctuel) : dû une seule fois, exactement à `date`.
  date?: string;
  heure?: string;
  recurrent?: boolean;
};

/**
 * Un rappel est dû si : (1) le jour concerné (calculé différemment selon le
 * schéma — voir plus haut) correspond au jour local courant, (2) l'heure
 * locale courante est à ± toleranceMinutes de l'heure cible, ET (3) il n'a
 * pas déjà été envoyé aujourd'hui (comparaison de date locale, pas d'un
 * simple delta horaire — robuste au passage de minuit). `toleranceMinutes`
 * par défaut 45 : couvre l'imprécision cumulée de deux passages horaires
 * consécutifs du cron sans jamais doublonner grâce à la garde `lastSentAt`.
 *
 * Détection du schéma : `date`+`heure` renseignés → nouveau schéma (57-7).
 * Sinon `creneau`+`jours` → ancien schéma, comportement strictement
 * identique à avant 57-7 (aucune régression pour l'écran actuel).
 */
export function isReminderDueNow(input: DueCheckInput): boolean {
  const { fuseau, lastSentAt, now, toleranceMinutes = 45 } = input;
  const nowLocal = localPartsInZone(now, fuseau);

  let isDayMatch: boolean;
  let targetMinutes: number;

  if (input.date !== undefined && input.heure !== undefined) {
    // Nouveau schéma (57-7) : heure libre + date, récurrent ou ponctuel.
    const [h, m] = input.heure.split(":").map(Number);
    targetMinutes = h * 60 + (m || 0);
    isDayMatch = input.recurrent
      ? isoWeekdayOfDateString(input.date) === nowLocal.isoWeekday
      : input.date === nowLocal.localDateKey;
  } else if (input.creneau !== undefined && input.jours !== undefined) {
    // Ancien schéma (57-1 à 57-6) : comportement inchangé.
    targetMinutes = CRENEAU_TARGET_HOUR[input.creneau] * 60;
    isDayMatch = input.jours.includes(nowLocal.isoWeekday);
  } else {
    // Rappel mal formé (ni l'un ni l'autre schéma peuplé) : jamais dû.
    return false;
  }

  if (!isDayMatch) return false;

  const delta = Math.abs(nowLocal.minutesSinceMidnight - targetMinutes);
  // Pas de gestion de wraparound minuit : les cibles restent assez loin de
  // minuit dans l'usage réel pour qu'une tolérance de quelques dizaines de
  // minutes ne traverse jamais le changement de jour.
  if (delta > toleranceMinutes) return false;

  if (isSameLocalDay(lastSentAt, now, fuseau)) return false;

  return true;
}
