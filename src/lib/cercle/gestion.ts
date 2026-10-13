import type Stripe from "stripe";
import {
  CRENEAUX,
  CYCLE_ID,
  PARTICIPATIONS,
  PRIX_CENTIMES,
  RENCONTRES_DATES,
  type CreneauId,
  type ParticipationId,
} from "./config";
import {
  emailAutreCreneau,
  emailCompteRenduEffacement,
  emailCompteRenduLiens,
  emailCycleAnnule,
  emailGroupeConfirme,
  emailLienZoom,
  envoyer,
  euros,
} from "./emails";
import { lienPaiementStripe, noterMetadata } from "./inscriptions";
import { autreCreneau, jourParis, lienZoom, type CreneauPrecis } from "./rencontres";

// ===================================================================
// Le Cercle TRACÉA en ligne — gestion du cycle (page /cercle/gestion,
// tâches automatiques). Stripe est le seul registre : chaque envoi et
// chaque confirmation est noté dans les métadonnées du paiement, ce qui
// évite les doublons. Aucune base de données.
// Le téléphone et la commune ne sont JAMAIS lus ici : ils restent dans
// Stripe et sont effacés par actionEffacer.
// ===================================================================

const CYCLE_START_UNIX = Math.floor(new Date("2026-10-13T00:00:00+02:00").getTime() / 1000);
const JOUR_MS = 24 * 3600 * 1000;

export type Personne = {
  reference: string; // identifiant du paiement (pi_…)
  prenom: string;
  email: string;
  creneau: CreneauId; // créneau choisi à l'inscription
  participation: ParticipationId | null; // null une fois effacée
  prochainCycle: boolean;
  montantCentimes: number;
  payeLe: Date;
  paiementUrl: string;
  rembourseCentimes: number;
  creneauConfirme: CreneauPrecis | null;
  groupeConfirmeLe: string | null;
  autreProposeLe: string | null;
  remboursementDemandeLe: string | null; // a répondu « remboursement »
  cycleAnnuleLe: string | null;
  retractationLe: string | null;
  retractationHorsDelai: boolean;
  retractationRemb: number | "a_decider" | null;
  effaceLe: string | null;
  emailMeta: boolean; // l'adresse du formulaire est encore dans les métadonnées
  liensEnvoyes: string[]; // ex. « vendredi_1 »
};

function estCreneauPrecis(v: unknown): v is CreneauPrecis {
  return v === "vendredi" || v === "mardi";
}

function lirePersonne(s: Stripe.Checkout.Session, live: boolean): Personne | null {
  const pi = s.payment_intent;
  if (!pi || typeof pi === "string") return null;
  const m = { ...(s.metadata ?? {}), ...(pi.metadata ?? {}) } as Record<string, string | undefined>;
  const creneau = CRENEAUX.find((c) => c.id === m.creneau)?.id;
  if (!creneau) return null;
  const charge = pi.latest_charge && typeof pi.latest_charge !== "string" ? pi.latest_charge : null;
  const remb = m.retractation_a_rembourser;
  return {
    reference: pi.id,
    prenom: m.prenom || "(prénom effacé)",
    email: (m.email_inscription || s.customer_details?.email || s.customer_email || "").toLowerCase(),
    creneau,
    participation: PARTICIPATIONS.find((p) => p.id === m.participation)?.id ?? null,
    prochainCycle: (m.prochain_cycle ?? "non").startsWith("oui"),
    montantCentimes: s.amount_total ?? PRIX_CENTIMES,
    payeLe: new Date(s.created * 1000),
    paiementUrl: lienPaiementStripe(pi.id, live),
    rembourseCentimes: charge?.amount_refunded ?? 0,
    creneauConfirme: estCreneauPrecis(m.creneau_confirme) ? m.creneau_confirme : null,
    groupeConfirmeLe: m.groupe_confirme_le || null,
    autreProposeLe: m.autre_creneau_propose_le || null,
    remboursementDemandeLe: m.remboursement_demande_le || null,
    cycleAnnuleLe: m.cycle_annule_le || null,
    retractationLe: m.retractation_recue_le || null,
    retractationHorsDelai: m.retractation_hors_delai === "oui",
    retractationRemb: !remb ? null : remb === "a_decider" ? "a_decider" : parseInt(remb, 10),
    effaceLe: m.donnees_effacees_le || null,
    emailMeta: !!m.email_inscription,
    liensEnvoyes: Object.keys(m)
      .filter((k) => /^lien_(vendredi|mardi)_[1-4]$/.test(k) && m[k])
      .map((k) => k.slice(5)),
  };
}

export async function listerPersonnes(stripe: Stripe, live: boolean): Promise<Personne[]> {
  const out: Personne[] = [];
  const liste = stripe.checkout.sessions.list({
    created: { gte: CYCLE_START_UNIX },
    limit: 100,
    expand: ["data.payment_intent.latest_charge"],
  });
  for await (const s of liste) {
    if (s.metadata?.cercle !== CYCLE_ID) continue;
    if (s.status !== "complete" || s.payment_status !== "paid") continue;
    const p = lirePersonne(s, live);
    if (p) out.push(p);
  }
  return out.sort((a, b) => a.payeLe.getTime() - b.payeLe.getTime());
}

// ── État d'une personne ─────────────────────────────────────────────

// Elle fait toujours partie du cycle : ni cycle annulé, ni rétractation,
// ni remboursement, ni données effacées.
export function estActive(p: Personne): boolean {
  return (
    !p.cycleAnnuleLe && !p.retractationLe && !p.remboursementDemandeLe && p.rembourseCentimes === 0 && !p.effaceLe
  );
}

// Remboursement attendu (en centimes), ou « a_decider ».
export function remboursementDu(p: Personne): number | "a_decider" | null {
  if (p.retractationLe) return p.retractationRemb ?? "a_decider";
  if (p.remboursementDemandeLe) return p.montantCentimes;
  if (p.cycleAnnuleLe) return p.montantCentimes;
  return null;
}

export function resteARembourser(p: Personne): number | "a_decider" | null {
  const du = remboursementDu(p);
  if (du === null) return null;
  if (du === "a_decider") return "a_decider";
  return Math.max(0, du - p.rembourseCentimes);
}

// ── Résultat des actions ────────────────────────────────────────────

export type Retour = { ok: boolean; message: string };

const maintenantIso = () => new Date().toISOString();

async function trouver(stripe: Stripe, live: boolean, reference: string): Promise<Personne | null> {
  const toutes = await listerPersonnes(stripe, live);
  return toutes.find((p) => p.reference === reference) ?? null;
}

function refus(p: Personne): string | null {
  if (p.effaceLe) return `Les données de ${p.prenom} ont été effacées.`;
  if (p.rembourseCentimes > 0) return `${p.prenom} a déjà été remboursée (en partie ou en totalité).`;
  if (p.retractationLe) return `${p.prenom} a demandé à renoncer : pas d'envoi.`;
  if (p.remboursementDemandeLe) return `${p.prenom} a demandé le remboursement : pas d'envoi.`;
  if (p.cycleAnnuleLe) return `Le cycle a été annulé pour ${p.prenom}.`;
  return null;
}

// Action 1 : « Confirmer et envoyer » (le groupe a lieu).
export async function actionConfirmer(
  stripe: Stripe,
  live: boolean,
  reference: string,
  creneau: unknown
): Promise<Retour> {
  if (!estCreneauPrecis(creneau)) return { ok: false, message: "Choisis le vendredi ou le mardi." };
  const p = await trouver(stripe, live, reference);
  if (!p) return { ok: false, message: "Personne introuvable." };
  const r = refus(p);
  if (r) return { ok: false, message: r };
  if (p.creneauConfirme) {
    return { ok: false, message: `${p.prenom} est déjà confirmée dans le groupe du ${p.creneauConfirme}.` };
  }
  if (!p.email) return { ok: false, message: `Pas d'adresse email pour ${p.prenom}.` };
  try {
    await envoyer(emailGroupeConfirme(p.prenom, p.email, creneau), { idempotencyKey: `cercle-groupe-${p.reference}` });
    await noterMetadata(stripe, p.reference, { creneau_confirme: creneau, groupe_confirme_le: maintenantIso() });
  } catch (err) {
    console.error("[CERCLE] Confirmation de groupe échouée:", p.reference, err instanceof Error ? err.message : err);
    return { ok: false, message: `L'envoi à ${p.prenom} n'a pas abouti. Réessaie dans un instant.` };
  }
  return { ok: true, message: `Groupe du ${creneau} confirmé et email envoyé à ${p.prenom}.` };
}

// Action 2 : « Proposer l'autre créneau » (le groupe choisi n'a pas lieu).
export async function actionProposerAutre(stripe: Stripe, live: boolean, reference: string): Promise<Retour> {
  const p = await trouver(stripe, live, reference);
  if (!p) return { ok: false, message: "Personne introuvable." };
  const r = refus(p);
  if (r) return { ok: false, message: r };
  if (!estCreneauPrecis(p.creneau)) {
    return { ok: false, message: `${p.prenom} a répondu « les deux me vont » : confirme-la plutôt dans l'un des deux groupes.` };
  }
  if (p.creneauConfirme) return { ok: false, message: `${p.prenom} est déjà confirmée dans un groupe.` };
  if (p.autreProposeLe) return { ok: false, message: `L'autre créneau a déjà été proposé à ${p.prenom}.` };
  if (!p.email) return { ok: false, message: `Pas d'adresse email pour ${p.prenom}.` };
  try {
    await envoyer(emailAutreCreneau(p.prenom, p.email, p.creneau), { idempotencyKey: `cercle-autre-${p.reference}` });
    await noterMetadata(stripe, p.reference, { autre_creneau_propose_le: maintenantIso() });
  } catch (err) {
    console.error("[CERCLE] Proposition d'autre créneau échouée:", p.reference, err instanceof Error ? err.message : err);
    return { ok: false, message: `L'envoi à ${p.prenom} n'a pas abouti. Réessaie dans un instant.` };
  }
  return { ok: true, message: `Proposition du groupe du ${autreCreneau(p.creneau)} envoyée à ${p.prenom}.` };
}

// Bouton « À rembourser » : la personne a répondu « remboursement » à
// l'email de l'autre créneau. Elle passe dans les remboursements à faire
// (12 €) et ne reçoit plus d'emails. Noté dans Stripe.
export async function actionMarquerRemboursement(stripe: Stripe, live: boolean, reference: string): Promise<Retour> {
  const p = await trouver(stripe, live, reference);
  if (!p) return { ok: false, message: "Personne introuvable." };
  if (p.effaceLe) return { ok: false, message: `Les données de ${p.prenom} ont été effacées.` };
  if (p.rembourseCentimes > 0) return { ok: false, message: `${p.prenom} a déjà été remboursée (en partie ou en totalité).` };
  if (p.remboursementDemandeLe) return { ok: false, message: `Le remboursement de ${p.prenom} est déjà noté.` };
  if (p.retractationLe || p.cycleAnnuleLe) return { ok: false, message: `${p.prenom} figure déjà dans les remboursements à faire.` };
  if (!p.autreProposeLe) return { ok: false, message: `Aucun autre créneau n'a été proposé à ${p.prenom}.` };
  if (p.creneauConfirme) return { ok: false, message: `${p.prenom} est déjà confirmée dans un groupe.` };
  try {
    await noterMetadata(stripe, p.reference, { remboursement_demande_le: maintenantIso() });
  } catch (err) {
    console.error("[CERCLE] Remboursement non noté:", p.reference, err instanceof Error ? err.message : err);
    return { ok: false, message: "Le remboursement n'a pas pu être noté. Réessaie dans un instant." };
  }
  return { ok: true, message: `Noté : ${p.prenom} est à rembourser (${euros(p.montantCentimes)}).` };
}

// Action 3 : « Annuler le cycle » (aucun groupe n'a lieu), pour toutes.
export async function actionAnnulerCycle(stripe: Stripe, live: boolean): Promise<Retour & { envoyes: number; echecs: string[] }> {
  const toutes = await listerPersonnes(stripe, live);
  const cibles = toutes.filter(
    (p) =>
      !p.cycleAnnuleLe &&
      !p.retractationLe &&
      !p.remboursementDemandeLe &&
      !p.effaceLe &&
      p.rembourseCentimes < p.montantCentimes &&
      p.email
  );
  const echecs: string[] = [];
  let envoyes = 0;
  for (const p of cibles) {
    try {
      await envoyer(emailCycleAnnule(p.prenom, p.email), { idempotencyKey: `cercle-annulation-${p.reference}` });
      await noterMetadata(stripe, p.reference, { cycle_annule_le: maintenantIso() });
      envoyes++;
    } catch (err) {
      console.error("[CERCLE] Annulation du cycle échouée:", p.reference, err instanceof Error ? err.message : err);
      echecs.push(p.prenom);
    }
  }
  const message =
    cibles.length === 0
      ? "Personne à prévenir."
      : echecs.length
        ? `Email envoyé à ${envoyes} personne(s). Échec pour : ${echecs.join(", ")}. Relance l'action pour réessayer.`
        : `Cycle annulé : email envoyé à ${envoyes} personne(s). Les remboursements sont à faire dans Stripe (liste ci-dessous).`;
  return { ok: echecs.length === 0, message, envoyes, echecs };
}

// ── Liens Zoom ──────────────────────────────────────────────────────

export function destinatairesLiens(personnes: Personne[], creneau: CreneauPrecis): Personne[] {
  return personnes.filter((p) => estActive(p) && p.creneauConfirme === creneau && p.email);
}

export async function actionEnvoyerLiens(
  stripe: Stripe,
  live: boolean,
  creneau: unknown,
  numero: unknown,
  opts: { manuel: boolean; rapport: boolean }
): Promise<Retour & { envoyes: number; dejaEnvoyes: number; echecs: string[] }> {
  const vide = { envoyes: 0, dejaEnvoyes: 0, echecs: [] as string[] };
  if (!estCreneauPrecis(creneau) || typeof numero !== "number" || ![1, 2, 3, 4].includes(numero)) {
    return { ok: false, message: "Rencontre inconnue.", ...vide };
  }
  const lien = lienZoom(creneau);
  if (!lien) {
    const nom = creneau === "vendredi" ? "CERCLE_ZOOM_VENDREDI" : "CERCLE_ZOOM_MARDI";
    return { ok: false, message: `Le lien Zoom du ${creneau} n'est pas réglé dans Vercel (${nom}).`, ...vide };
  }
  const cle = `lien_${creneau}_${numero}`;
  const personnes = destinatairesLiens(await listerPersonnes(stripe, live), creneau);
  let envoyes = 0;
  let dejaEnvoyes = 0;
  const echecs: string[] = [];
  for (const p of personnes) {
    if (p.liensEnvoyes.includes(`${creneau}_${numero}`)) {
      dejaEnvoyes++;
      continue;
    }
    try {
      await envoyer(emailLienZoom(p.prenom, p.email, creneau, lien), {
        idempotencyKey: `cercle-zoom-${p.reference}-${creneau}-${numero}`,
      });
      await noterMetadata(stripe, p.reference, { [cle]: maintenantIso() });
      envoyes++;
    } catch (err) {
      console.error("[CERCLE] Lien Zoom non envoyé:", p.reference, err instanceof Error ? err.message : err);
      echecs.push(p.prenom);
    }
  }
  if (opts.rapport && (envoyes > 0 || echecs.length > 0)) {
    try {
      await envoyer(
        emailCompteRenduLiens({ creneau, numero, envoyes, dejaEnvoyes, echecs, manuel: opts.manuel }),
        { idempotencyKey: `cercle-rapport-liens-${creneau}-${numero}-${jourParis(new Date())}-${envoyes}-${echecs.length}` }
      );
    } catch (err) {
      console.error("[CERCLE] Compte rendu des liens non envoyé:", err instanceof Error ? err.message : err);
    }
  }
  const message =
    personnes.length === 0
      ? `Personne à qui écrire : aucune personne confirmée dans le groupe du ${creneau}.`
      : echecs.length
        ? `Liens envoyés : ${envoyes}. Échec pour : ${echecs.join(", ")}. Déjà envoyés avant : ${dejaEnvoyes}.`
        : `Liens envoyés : ${envoyes}. Déjà envoyés avant : ${dejaEnvoyes}.`;
  return { ok: echecs.length === 0 && personnes.length > 0, message, envoyes, dejaEnvoyes, echecs };
}

// ── Effacement des données personnelles ─────────────────────────────

// Promesse de la politique de confidentialité : effacé une semaine après
// la dernière rencontre de son groupe. Sans groupe confirmé (cycle annulé,
// remboursement…), on prend l'échéance la plus proche, par prudence.
export function echeanceEffacement(p: Personne): Date {
  const groupe: CreneauPrecis = p.creneauConfirme ?? (estCreneauPrecis(p.creneau) ? p.creneau : "mardi");
  const dernier = RENCONTRES_DATES[groupe][3];
  const jour = jourParis(new Date(dernier.getTime() + 7 * JOUR_MS));
  return new Date(`${jour}T00:00:00+01:00`);
}

export type RetourEffacement = Retour & { effaces: number; emailsConserves: number; emailsSupprimes: number; echecs: number };

export async function actionEffacer(
  stripe: Stripe,
  live: boolean,
  opts: { manuel: boolean; forcer?: boolean; maintenant?: Date }
): Promise<RetourEffacement> {
  const maintenant = opts.maintenant ?? new Date();
  const forcer = !!opts.forcer && !live; // jamais de forçage en mode réel
  const personnes = await listerPersonnes(stripe, live);
  let effaces = 0;
  let conserves = 0;
  let supprimes = 0;
  let echecs = 0;

  for (const p of personnes) {
    try {
      if (p.effaceLe) {
        // Adresse gardée pour le « prochain cycle » : supprimée au plus tard un an après.
        const finGarde = new Date(p.effaceLe).getTime() + 365 * JOUR_MS;
        if (p.prochainCycle && p.emailMeta && (forcer || maintenant.getTime() >= finGarde)) {
          await noterMetadata(stripe, p.reference, { email_inscription: "", email_supprime_le: maintenant.toISOString() });
          supprimes++;
        }
        continue;
      }
      if (!forcer && maintenant.getTime() < echeanceEffacement(p).getTime()) continue;

      const efface: Record<string, string> = {
        telephone: "",
        commune: "",
        prenom: "",
        participation: "",
        participation_libelle: "",
        donnees_effacees_le: maintenant.toISOString(),
      };
      if (p.prochainCycle) conserves++;
      else {
        efface.email_inscription = "";
        supprimes++;
      }
      await noterMetadata(stripe, p.reference, efface);
      effaces++;
    } catch (err) {
      console.error("[CERCLE] Effacement échoué:", p.reference, err instanceof Error ? err.message : err);
      echecs++;
    }
  }

  if (effaces > 0 || supprimes > 0 || echecs > 0) {
    try {
      await envoyer(
        emailCompteRenduEffacement({ effaces, emailsConserves: conserves, emailsSupprimes: supprimes, echecs, manuel: opts.manuel }),
        { idempotencyKey: `cercle-rapport-effacement-${maintenant.toISOString().slice(0, 13)}-${effaces}-${supprimes}-${echecs}` }
      );
    } catch (err) {
      console.error("[CERCLE] Compte rendu d'effacement non envoyé:", err instanceof Error ? err.message : err);
    }
  }
  const message =
    effaces + supprimes + echecs === 0
      ? "Rien à effacer pour le moment."
      : `${effaces} paiement(s) nettoyé(s), ${supprimes} adresse(s) supprimée(s), ${conserves} adresse(s) gardée(s) pour le prochain cycle${echecs ? `, ${echecs} échec(s)` : ""}. Compte rendu envoyé par email.`;
  return { ok: echecs === 0, message, effaces, emailsConserves: conserves, emailsSupprimes: supprimes, echecs };
}

// Jour de la dernière échéance d'effacement (pour l'affichage).
export function premiereEcheance(): Date {
  return new Date(`${jourParis(new Date(RENCONTRES_DATES.mardi[3].getTime() + 7 * JOUR_MS))}T00:00:00+01:00`);
}

