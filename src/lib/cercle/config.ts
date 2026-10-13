// ===================================================================
// Le Cercle TRACÉA en ligne — réglages du cycle pilote (nov.-déc. 2026)
//
// Fichier partagé page / route serveur. Aucun secret ici : la clé Stripe
// du Cercle est lue uniquement côté serveur (src/lib/cercle/stripe.ts).
// ===================================================================

// Identifiant du cycle, posé sur chaque paiement Stripe pour les retrouver.
export const CYCLE_ID = "pilote-2026-11";

// Version des textes acceptés (conditions, confidentialité, cases).
export const TEXTES_VERSION = "2026-10-13";

// Places par créneau.
export const PLACES_PAR_CRENEAU = 12;

// Fermeture des inscriptions : 13 novembre 2026 à 23 h 59, heure de Paris
// (heure d'hiver, UTC+1). Fermé à partir du 14 novembre 0 h 00 Paris.
export const FERMETURE = new Date("2026-11-14T00:00:00+01:00");

export function inscriptionsCloses(now: Date = new Date()): boolean {
  return now.getTime() >= FERMETURE.getTime();
}

export const CRENEAUX = [
  { id: "vendredi", label: "Le vendredi soir, 21 h" },
  { id: "mardi", label: "Le mardi après-midi, 14 h" },
  { id: "deux", label: "Les deux me vont" },
] as const;
export type CreneauId = (typeof CRENEAUX)[number]["id"];

export const PARTICIPATIONS = [
  { id: "ecouter", label: "Écouter et écrire dans le chat" },
  { id: "micro", label: "Parler au micro si j'en ai envie" },
  { id: "partager", label: "J'aimerais partager un moment de mon histoire" },
] as const;
export type ParticipationId = (typeof PARTICIPATIONS)[number]["id"];

// Cases obligatoires. Le texte exact est aussi la preuve de ce qui a été
// accepté : ne pas le modifier sans changer TEXTES_VERSION.
export const CASES_OBLIGATOIRES = [
  { id: "majeur", texte: "J'ai 18 ans ou plus." },
  {
    id: "conditions",
    texte: "J'ai lu et j'accepte les conditions d'inscription.",
  },
  {
    id: "engagement",
    texte:
      "Je m'engage à garder pour moi ce que j'entendrai, à ne rien enregistrer, et à parler de moi plutôt que des autres.",
  },
  {
    id: "securite",
    texte:
      "J'accepte que mon téléphone et ma commune soient utilisés seulement pour ma sécurité, et effacés une semaine après la dernière rencontre.",
  },
  {
    id: "debut_anticipe",
    texte:
      "Je demande que le Cercle commence avant la fin de mon délai de rétractation de quatorze jours. Si je me rétracte après une ou plusieurs rencontres, les rencontres restantes me seront remboursées.",
  },
] as const;
export type CaseId = (typeof CASES_OBLIGATOIRES)[number]["id"];

export type PlacesState = {
  vendredi: boolean; // true = encore des places
  mardi: boolean;
  deux: boolean;
};

export const TOUTES_PLACES_LIBRES: PlacesState = {
  vendredi: true,
  mardi: true,
  deux: true,
};

// Règle des places : « Les deux me vont » compte dans le total (24 places)
// et sera placé là où il reste de la place. Un créneau précis est complet
// quand ses inscrits précis atteignent 12, ou quand le total atteint 24.
export function calculerPlaces(c: {
  vendredi: number;
  mardi: number;
  deux: number;
}): PlacesState {
  const total = c.vendredi + c.mardi + c.deux;
  const totalLibre = total < PLACES_PAR_CRENEAU * 2;
  return {
    vendredi: totalLibre && c.vendredi < PLACES_PAR_CRENEAU,
    mardi: totalLibre && c.mardi < PLACES_PAR_CRENEAU,
    deux: totalLibre,
  };
}

// Clé du brouillon du formulaire dans le navigateur (sessionStorage).
export const BROUILLON_KEY = "cercle_inscription_brouillon";
