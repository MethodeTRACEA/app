import { RENCONTRES_DATES } from "./config";

// ===================================================================
// Le Cercle TRACÉA en ligne — informations des créneaux (textes des
// emails de gestion et d'envoi des liens Zoom).
// ===================================================================

export type CreneauPrecis = "vendredi" | "mardi";

export const INFOS_CRENEAU: Record<
  CreneauPrecis,
  {
    nom: string; // « vendredi »
    heures: string; // « de 21 h à 22 h 30 »
    heureDebut: string; // « 21 h »
    groupe: string; // « vendredi, de 21 h à 22 h 30 » (après « du groupe du »)
    dates: string; // « les vendredis 20 et 27 novembre, 4 et 11 décembre »
  }
> = {
  vendredi: {
    nom: "vendredi",
    heures: "de 21 h à 22 h 30",
    heureDebut: "21 h",
    groupe: "vendredi, de 21 h à 22 h 30",
    dates: "les vendredis 20 et 27 novembre, 4 et 11 décembre",
  },
  mardi: {
    nom: "mardi",
    heures: "de 14 h à 15 h 30",
    heureDebut: "14 h",
    groupe: "mardi, de 14 h à 15 h 30",
    dates: "les mardis 17 et 24 novembre, 1er et 8 décembre",
  },
};

export function autreCreneau(c: CreneauPrecis): CreneauPrecis {
  return c === "vendredi" ? "mardi" : "vendredi";
}

const FUSEAU = "Europe/Paris";

// « 2026-11-20 » : le jour calendaire à Paris.
export function jourParis(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: FUSEAU });
}

// Rencontres (créneau + numéro 1 à 4) qui ont lieu le jour donné (Paris).
export function rencontresDuJour(jour: string): { creneau: CreneauPrecis; numero: number; date: Date }[] {
  const out: { creneau: CreneauPrecis; numero: number; date: Date }[] = [];
  for (const creneau of ["vendredi", "mardi"] as const) {
    RENCONTRES_DATES[creneau].forEach((date, i) => {
      if (jourParis(date) === jour) out.push({ creneau, numero: i + 1, date });
    });
  }
  return out;
}

// Liste des huit rencontres, pour la page de gestion.
export function toutesLesRencontres(): { creneau: CreneauPrecis; numero: number; date: Date; libelle: string }[] {
  const out: { creneau: CreneauPrecis; numero: number; date: Date; libelle: string }[] = [];
  for (const creneau of ["vendredi", "mardi"] as const) {
    RENCONTRES_DATES[creneau].forEach((date, i) => {
      const jour = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: FUSEAU });
      out.push({ creneau, numero: i + 1, date, libelle: `${jour}, ${INFOS_CRENEAU[creneau].heureDebut} (rencontre ${i + 1})` });
    });
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function lienZoom(creneau: CreneauPrecis): string | null {
  const v = (creneau === "vendredi" ? process.env.CERCLE_ZOOM_VENDREDI : process.env.CERCLE_ZOOM_MARDI)?.trim();
  return v && /^https:\/\//i.test(v) ? v : null;
}
