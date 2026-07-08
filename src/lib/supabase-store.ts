import { supabase } from "./supabase";
import type { SessionData, StepId } from "./types";
import { hasValidConsent } from "./consent";
import { CURATED_ACTION_TEXTS } from "./action-suggestions";

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
  intensiteBefore: number | null,
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
    intensity_after: number | null;
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

// --- Geste déclaratif (Chantier 35-B « Le retour du geste », brique B-1) ---
// Statut déclaratif rattaché au geste de l'étape Aligner (sessions.action_alignee).
// Stockage uniquement : ce point d'écriture sera appelé depuis la carte (B-2),
// il n'est branché sur aucune UI ici.

export type GesteStatut = "fait" | "pas_encore" | "autre_forme" | "passe";

/**
 * Pose le statut déclaratif d'un geste sur sa ligne `sessions`.
 * - Statut terminal ('fait' | 'pas_encore' | 'autre_forme') : rattaché tel quel,
 *   le geste est « répondu » (le pass_count n'est pas touché).
 * - 'passe' : incrémente le compteur de passes consécutives (règle des 2 passes en B-2).
 * Écrit toujours l'horodatage de la dernière interaction.
 * Une seule ligne de statut par geste (la ligne session elle-même) : rien à créer,
 * les colonnes passent de NULL/0 à leur valeur à la première interaction.
 */
export async function setGesteStatutDb(
  sessionId: string,
  statut: GesteStatut
): Promise<{ error: string | null }> {
  const updates: {
    geste_statut: GesteStatut;
    geste_statut_at: string;
    geste_pass_count?: number;
  } = {
    geste_statut: statut,
    geste_statut_at: new Date().toISOString(),
  };

  if (statut === "passe") {
    const { data } = await supabase
      .from("sessions")
      .select("geste_pass_count")
      .eq("id", sessionId)
      .single();
    const current = (data?.geste_pass_count as number) ?? 0;
    updates.geste_pass_count = current + 1;
  }

  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId);
  return { error: error ? error.message : null };
}

export type EligibleGeste = { sessionId: string; label: string };

/**
 * Retourne le geste éligible pour la carte « Le retour du geste » (B-2), ou null.
 * Éligibilité (§2 du brief 35-B / B-2), toutes conditions en ET :
 *   1. action_alignee non nul.
 *   2. geste_statut ∉ { fait, pas_encore, autre_forme } — un statut terminal ferme
 *      la boucle. NULL et 'passe' restent éligibles (piège B-1 : 'passe' n'est PAS
 *      terminal). Exprimé « is null OR not in (terminaux) » : un simple not.in
 *      exclurait les lignes NULL (NOT (NULL in (...)) vaut NULL en SQL).
 *   3. geste_pass_count < 2 — règle des 2 passes (colonne NOT NULL DEFAULT 0).
 *   4. session ≤ 14 jours (created_at).
 *   5. le plus récent geste satisfaisant 1-4.
 *   + Condition supplémentaire « curés uniquement » (décision 2026-07-08) :
 *     action_alignee doit être un libellé curé (∈ CURATED_ACTION_TEXTS). Un geste
 *     en texte libre n'est jamais ré-affiché sans le softening chantier 39. On
 *     ramène une fenêtre récente puis on retient le plus récent geste curé.
 * Le gating premium/essai (§2.5) est fait côté composant (useAuth.hasPremiumAccess).
 */
export async function getEligibleGesteDb(
  userId: string
): Promise<EligibleGeste | null> {
  const cutoff = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, action_alignee, geste_statut, geste_pass_count, created_at")
    .eq("user_id", userId)
    .not("action_alignee", "is", null)
    .or("geste_statut.is.null,geste_statut.not.in.(fait,pas_encore,autre_forme)")
    .lt("geste_pass_count", 2)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return null;

  // Filtre « curés uniquement » côté client : retient le plus récent geste dont
  // le libellé appartient au set curé (la fenêtre est déjà triée du + récent au + ancien).
  for (const row of data) {
    const label = ((row.action_alignee as string) ?? "").trim();
    if (label && CURATED_ACTION_TEXTS.has(label)) {
      return { sessionId: row.id as string, label };
    }
  }
  return null;
}

export type RecentGeste = {
  sessionId: string;
  label: string;
  statut: GesteStatut | null;
};

// Statut le plus « abouti » entre deux occurrences d'un même geste, pour la
// dédup de « Tes gestes » : fait > autre_forme > le reste (pas_encore/passe/NULL,
// qui n'affichent aucune mention). En cas d'égalité de rang, on garde `a`
// (l'occurrence déjà retenue, la plus récente).
function moreAccomplishedStatut(
  a: GesteStatut | null,
  b: GesteStatut | null
): GesteStatut | null {
  const rank = (s: GesteStatut | null) =>
    s === "fait" ? 2 : s === "autre_forme" ? 1 : 0;
  return rank(a) >= rank(b) ? a : b;
}

/**
 * Liste des gestes curés récents pour la section « Tes gestes » du reflet (B-3),
 * en LECTURE SEULE. Contrairement à getEligibleGesteDb (qui vise LE geste à
 * relancer), on renvoie TOUS les statuts : la mention n'est décidée qu'à
 * l'affichage (fait → « fait », autre_forme → « autrement », sinon rien — le
 * geste apparaît juste posé). Aucun filtre sur geste_statut ni pass_count.
 * Réutilise le même filtre « curés uniquement » que getEligibleGesteDb
 * (CURATED_ACTION_TEXTS) : un geste en texte libre n'est jamais ré-affiché.
 * Fenêtre par défaut 30 j : plus large que la carte (14 j) car c'est une
 * section de relecture passive, pas une sollicitation. Ajustable via windowDays.
 *
 * DÉDUP PAR LIBELLÉ (P1) : un même libellé n'apparaît qu'une fois. Sinon le même
 * geste s'afficherait deux fois (ex. une occurrence non répondue + une « fait »),
 * ce qui recréerait le « pas encore » déguisé que l'Option A doit rendre
 * impossible. Statut retenu = le plus abouti parmi TOUTES les occurrences.
 * Ordre = récence : la Map préserve l'ordre d'insertion, et les lignes arrivent
 * déjà triées du + récent au + ancien, donc la 1re insertion d'un libellé fixe
 * sa position (occurrence la plus récente en haut).
 */
export async function getRecentGestesDb(
  userId: string,
  windowDays = 30
): Promise<RecentGeste[]> {
  const cutoff = new Date(
    Date.now() - windowDays * 24 * 3600 * 1000
  ).toISOString();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, action_alignee, geste_statut, created_at")
    .eq("user_id", userId)
    .not("action_alignee", "is", null)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const byLabel = new Map<string, RecentGeste>();
  for (const row of data) {
    const label = ((row.action_alignee as string) ?? "").trim();
    if (!label || !CURATED_ACTION_TEXTS.has(label)) continue;
    const statut = (row.geste_statut as GesteStatut | null) ?? null;
    const existing = byLabel.get(label);
    if (!existing) {
      byLabel.set(label, { sessionId: row.id as string, label, statut });
    } else {
      // Même geste revu : on garde la position (récence) et on remonte au statut
      // le plus abouti vu sur ce libellé.
      existing.statut = moreAccomplishedStatut(existing.statut, statut);
    }
  }
  return Array.from(byLabel.values());
}

// --- Rappels (chantier 57, brique 57-3) ---

export type ReminderCategorie = "entrainement" | "moment_sensible";
export type ReminderCreneau = "matin" | "midi" | "soir";

export type Reminder = {
  id: string;
  categorie: ReminderCategorie;
  creneau: ReminderCreneau;
  jours: number[]; // ISO 8601 : 1=lundi … 7=dimanche
  label: string | null;
};

/**
 * Rappels ARMÉS de la personne (arme=true uniquement — un rappel retiré
 * n'est jamais supprimé, juste désarmé en base, et ne doit plus apparaître
 * ici). Aucun compteur, aucune stat d'usage : uniquement ce qui décrit le
 * rappel lui-même.
 */
export async function getArmedRemindersDb(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select("id, categorie, creneau, jours, label")
    .eq("user_id", userId)
    .eq("arme", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    categorie: row.categorie as ReminderCategorie,
    creneau: row.creneau as ReminderCreneau,
    jours: (row.jours as number[]) ?? [],
    label: (row.label as string | null) ?? null,
  }));
}

/**
 * Pose un rappel (arme=true dès la création). `fuseau` est le fuseau IANA du
 * navigateur (Intl.DateTimeFormat().resolvedOptions().timeZone), capté sans
 * UI dédiée — nécessaire au cron 57-4, jamais montré à la personne.
 */
export async function createReminderDb(
  userId: string,
  input: {
    categorie: ReminderCategorie;
    creneau: ReminderCreneau;
    jours: number[];
    label: string | null;
    fuseau: string;
  }
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from("reminders")
    .insert({
      user_id: userId,
      categorie: input.categorie,
      creneau: input.creneau,
      jours: input.jours,
      label: input.label,
      fuseau: input.fuseau,
      arme: true,
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return { id: data.id as string };
}

/**
 * Retire un rappel : toggle arme=false, ne supprime jamais la ligne
 * (décision actée en 57-1 — la config reste, réarmable plus tard si besoin).
 */
export async function disarmReminderDb(reminderId: string): Promise<void> {
  await supabase
    .from("reminders")
    .update({ arme: false, updated_at: new Date().toISOString() })
    .eq("id", reminderId);
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

export async function getApprofondiSessionEndCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("tracea_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event", "session_end")
    .filter("data->>mode", "eq", "approfondi");
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

// ───────────────────────────────────────────────────────────────────
// TRACES INDIVIDUELLES DE TRAVERSÉE COURTE (C1+)
// Reconstruites depuis tracea_events, groupées par data.session_id.
// Lecture client RLS-safe (même client + JWT que getPremiumMemory : la
// RLS limite déjà aux lignes de l'utilisatrice connectée). L'UI viendra
// dans un patch séparé.
// ───────────────────────────────────────────────────────────────────

export type ShortTrace = {
  sessionId: string;
  date: string;          // created_at ISO
  ressenti: string | null;
  corps: string | null;
  ancrer: string | null;
  geste: string | null;  // texte tel quel (summaryLabel), pas de table de libellés
  partielle: boolean;    // art.9 refusé : ancrer présent, ressenti/corps/geste absents
};

export async function getShortTraces(): Promise<ShortTrace[]> {
  try {
    const { data, error } = await supabase
      .from("tracea_events")
      .select("event, data, created_at")
      .eq("data->>mode", "court")
      .not("data->>session_id", "is", null)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    type Row = { event: string; data: Record<string, unknown> | null; created_at: string };

    // Grouper par session_id (Record + Object.entries — sûr en target es5)
    const groups: Record<string, Row[]> = {};
    for (const row of data as Row[]) {
      const sid = (row.data?.session_id as string | undefined) ?? null;
      if (!sid) continue;
      if (!groups[sid]) groups[sid] = [];
      groups[sid].push(row);
    }

    const traces: ShortTrace[] = [];
    for (const [sid, events] of Object.entries(groups)) {
      // events triés croissant (order created_at asc) → events[0] = plus ancien
      const start = events.find((e) => e.event === "session_start");
      const date = start?.created_at ?? events[0].created_at;

      const stepValue = (step: string): string | null => {
        const e = events.find(
          (ev) => ev.event === "step_complete" && ev.data?.step === step
        );
        const v = e?.data?.value;
        return typeof v === "string" ? v : null;
      };

      const ressenti = stepValue("ressenti");
      const corps = stepValue("corps");
      const ancrer = stepValue("ancrer");
      const geste = stepValue("emerger");
      const partielle =
        ressenti === null && corps === null && geste === null && ancrer !== null;

      traces.push({ sessionId: sid, date, ressenti, corps, ancrer, geste, partielle });
    }

    // Plus récente d'abord, 10 max
    traces.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return traces.slice(0, 10);
  } catch {
    return [];
  }
}

// --- Tracking events ---

// ── Token anti-bot ──────────────────────────────────────────────────
// Cache sessionStorage : une seule requête /api/track-token par onglet.
// Si la récupération échoue, le tracking est silencieusement ignoré.

const SESSION_TOKEN_KEY = "tracea_track_token";

async function getTrackToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  // Cache sessionStorage — valide jusqu'à fermeture de l'onglet
  const cached = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (cached) return cached;

  try {
    const res = await fetch("/api/track-token");
    if (!res.ok) return null;
    const json = await res.json();
    if (typeof json?.token === "string" && json.token.length === 32) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, json.token);
      return json.token;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Gate art. 9 (RGPD données sensibles) ────────────────────────────
// Steps dont la `value` peut porter un libellé émotionnel ou un verbatim.
// Ces events n'existent que si le consentement ConsentGate (art. 9) est
// donné — pas seulement le cookie « functional ». Les steps techniques
// (ancrer → souffle/appuis/autour) et les events sans contenu
// (session_start / session_end) restent au régime du cookie functional.
const CONTENT_STEPS = new Set([
  "ressenti", "corps", "emerger",
  "situation", "emotion", "besoin", "action",
]);

function isContentBearingEvent(
  event: string,
  data?: Record<string, unknown>
): boolean {
  if (event !== "step_complete") return false;
  const step = data?.step;
  return typeof step === "string" && CONTENT_STEPS.has(step);
}

/**
 * Envoie un event de tracking via la route serveur /api/track-event.
 *
 * Garanties :
 * - Aucun insert direct Supabase depuis le navigateur.
 * - Bloqué silencieusement si le consentement est absent.
 * - Bloqué silencieusement si le token anti-bot est indisponible.
 * - Token expiré (403) → cache invalidé pour la prochaine fois.
 * - try/catch global : ne bloque jamais l'UX.
 */
export async function trackEvent(
  userId: string | null,
  event: string,
  data?: Record<string, unknown>
) {
  // Gate consentement côté client — first line of defense
  if (typeof window === "undefined") return;

  // Gate unique : CookieBanner avec `functional === true`.
  // - Si `tracea_cookie_consent` est absent → l'utilisatrice n'a pas
  //   encore fait de choix dans le bandeau cookies → pas de tracking.
  // - Si JSON invalide ou `functional !== true` → pas de tracking.
  // La clé `tracea_consent` n'est plus consultée ici : elle est
  // désormais réservée exclusivement au ConsentGate (RGPD art. 9),
  // qui couvre les données sensibles de session, pas la télémétrie.
  const cookieConsentRaw = localStorage.getItem("tracea_cookie_consent");
  if (!cookieConsentRaw) return;
  try {
    const cookieConsent = JSON.parse(cookieConsentRaw);
    if (cookieConsent?.functional !== true) return;
  } catch {
    return;
  }

  // Gate art. 9 — un event porteur de contenu émotionnel/verbatim n'est
  // écrit que si le consentement ConsentGate est donné. Sinon : abandon
  // silencieux, sans erreur, sans casser le parcours.
  if (isContentBearingEvent(event, data) && !hasValidConsent()) {
    return;
  }

  // Token anti-bot — échec silencieux, jamais de crash UX
  const trackToken = await getTrackToken();
  if (!trackToken) return;

  // ID anonyme pour les utilisateurs non connectés
  const anonymousId = !userId
    ? (localStorage.getItem("tracea_anonymous_id") ?? undefined)
    : undefined;

  // Token d'auth — envoyé en header quand une session existe, pour que la
  // route dérive l'identité côté serveur (jamais via le body). Absence ou
  // échec silencieux : le parcours anonyme part sans header.
  let accessToken: string | null = null;
  if (userId) {
    try {
      const { data } = await supabase.auth.getSession();
      accessToken = data.session?.access_token ?? null;
    } catch {
      accessToken = null;
    }
  }

  // Envoi via route serveur — silencieux en cas d'erreur réseau ou serveur
  try {
    const res = await fetch("/api/track-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        tracea_consent: true,
        track_token: trackToken,
        event,
        data: data ?? {},
        ...(anonymousId ? { anonymous_id: anonymousId } : {}),
      }),
    });

    // Token expiré (rotation horaire) → invalider le cache pour le prochain event
    if (res.status === 403) {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    }
  } catch {
    // Ne jamais faire crasher l'app pour un problème de tracking
  }
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
    noteEntreSession: (row.note_entre_sessions as string) ?? undefined,
  };
}
