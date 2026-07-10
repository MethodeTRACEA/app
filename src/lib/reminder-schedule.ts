// TRACÉA — Chantier 57 « Ancrage contextuel » — Briques 57-4, 57-7, 57-8
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
// TROIS SCHÉMAS COEXISTENT tant que les 3 rappels de test créés avant 57-7
// (ancien schéma pur) ne sont pas retirés à la main :
//   - ancien (57-1 à 57-6, `recurrent` NULL en base) : `creneau` (matin/midi/
//     soir fixes) + `jours` (jours de semaine cochés, répétition implicite).
//   - nouveau récurrent (57-8+, `recurrent = true`) : `jours` (multi-jours,
//     même colonne et même sens que l'ancien schéma) + `heure` libre (rem-
//     place `creneau`). `date` n'est jamais lue dans ce mode.
//   - nouveau ponctuel (57-7+, `recurrent = false`) : `date` exacte + `heure`
//     libre, dû une seule fois. `jours` n'est jamais lu dans ce mode.
// Correction 57-8 (décision du 2026-07-11) : 57-7 avait fait déduire le jour
// de semaine du récurrent depuis `date` — ce n'était PAS le modèle voulu,
// Alyson tenait à garder le multi-jours de l'ancien système. isReminderDueNow
// discrimine désormais sur `recurrent` (true/false/undefined) plutôt que sur
// la présence de `date`.

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
  // Ancien schéma (57-1 à 57-6, `recurrent` NULL en base — laisser `recurrent`
  // absent pour ce chemin) : créneau fixe + jours de semaine cochés.
  creneau?: ReminderCreneau;
  // Jours de semaine (ISO 1=lundi…7=dimanche) — colonne partagée par l'ancien
  // schéma ET le nouveau récurrent (57-8) : même sens, même multi-jours.
  jours?: number[];
  // Nouveau schéma (57-7+) — heure libre "HH:MM" ou "HH:MM:SS" (format
  // renvoyé par Postgres `time` via PostgREST). `recurrent=true` (57-8) :
  // se répète chaque semaine sur les jours de `jours`, `date` non lue.
  // `recurrent=false` (57-7) : ponctuel, dû une seule fois exactement à
  // `date`, `jours` non lue.
  date?: string;
  heure?: string;
  recurrent?: boolean;
};

function parseHeure(heure: string): number {
  const [h, m] = heure.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Un rappel est dû si : (1) le jour concerné (calculé différemment selon le
 * schéma — voir plus haut) correspond au jour local courant, (2) l'heure
 * locale courante est à ± toleranceMinutes de l'heure cible, ET (3) il n'a
 * pas déjà été envoyé aujourd'hui (comparaison de date locale, pas d'un
 * simple delta horaire — robuste au passage de minuit). `toleranceMinutes`
 * par défaut 45 : couvre l'imprécision cumulée de deux passages horaires
 * consécutifs du cron sans jamais doublonner grâce à la garde `lastSentAt`.
 *
 * Détection du schéma : sur `recurrent` (discriminant explicite posé par
 * l'écran qui crée le rappel), pas sur la présence de `date` (erreur de
 * modélisation 57-7, corrigée en 57-8 — voir en-tête de fichier).
 * `recurrent === true` → nouveau récurrent (jours+heure). `recurrent ===
 * false` → ponctuel (date+heure). `recurrent` absent (NULL en base) →
 * ancien schéma (creneau+jours), comportement strictement identique à avant
 * 57-7 (aucune régression pour les 3 rappels de test existants).
 */
export function isReminderDueNow(input: DueCheckInput): boolean {
  const { fuseau, lastSentAt, now, toleranceMinutes = 45 } = input;
  const nowLocal = localPartsInZone(now, fuseau);

  let isDayMatch: boolean;
  let targetMinutes: number;

  if (input.recurrent === true) {
    // Nouveau récurrent (57-8) : jours multi-sélection + heure libre.
    if (input.jours === undefined || input.heure === undefined) return false;
    targetMinutes = parseHeure(input.heure);
    isDayMatch = input.jours.includes(nowLocal.isoWeekday);
  } else if (input.recurrent === false) {
    // Ponctuel (57-7) : date exacte + heure libre.
    if (input.date === undefined || input.heure === undefined) return false;
    targetMinutes = parseHeure(input.heure);
    isDayMatch = input.date === nowLocal.localDateKey;
  } else if (input.creneau !== undefined && input.jours !== undefined) {
    // Ancien schéma (57-1 à 57-6) : comportement inchangé.
    targetMinutes = CRENEAU_TARGET_HOUR[input.creneau] * 60;
    isDayMatch = input.jours.includes(nowLocal.isoWeekday);
  } else {
    // Rappel mal formé (aucun des 3 schémas peuplé) : jamais dû.
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
