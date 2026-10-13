import type Stripe from "stripe";
import {
  CRENEAUX,
  CYCLE_ID,
  DELAI_RETRACTATION_JOURS,
  PARTICIPATIONS,
  PRIX_CENTIMES,
  PRIX_PAR_RENCONTRE_CENTIMES,
  RENCONTRES_DATES,
  type CreneauId,
  type ParticipationId,
} from "./config";
import {
  emailConfirmation,
  emailNotifInscription,
  emailNotifRetractation,
  emailAccuse,
  envoyer,
  euros,
  type Inscription,
  type InfosRetractation,
} from "./emails";

// ===================================================================
// Le Cercle TRACÉA en ligne — lecture des inscriptions dans Stripe,
// envoi des emails après paiement, rétractation.
// Stripe est le seul registre : aucune base de données.
// ===================================================================

const CYCLE_START_UNIX = Math.floor(new Date("2026-10-13T00:00:00+02:00").getTime() / 1000);

// Écrit des repères dans les métadonnées du paiement Stripe (statut des
// envois, confirmations…). Une valeur vide efface la clé.
export async function noterMetadata(
  stripe: Stripe,
  paymentIntentId: string,
  data: Record<string, string>
): Promise<void> {
  await stripe.paymentIntents.update(paymentIntentId, { metadata: data });
}

function estCreneau(v: unknown): v is CreneauId {
  return CRENEAUX.some((c) => c.id === v);
}
function estParticipation(v: unknown): v is ParticipationId {
  return PARTICIPATIONS.some((p) => p.id === v);
}

export function lienPaiementStripe(paymentIntentId: string, live: boolean): string {
  return `https://dashboard.stripe.com${live ? "" : "/test"}/payments/${paymentIntentId}`;
}

// Transforme une session Checkout payée (avec payment_intent développé)
// en inscription. Retourne null si ce n'est pas un paiement du Cercle.
export function lireInscription(
  session: Stripe.Checkout.Session,
  live: boolean
): Inscription | null {
  if (session.metadata?.cercle !== CYCLE_ID) return null;
  const pi = session.payment_intent;
  if (!pi || typeof pi === "string") return null;
  const m = { ...(session.metadata ?? {}), ...(pi.metadata ?? {}) };
  const email = (m.email_inscription || session.customer_details?.email || session.customer_email || "")
    .trim()
    .toLowerCase();
  if (!m.prenom || !email || !estCreneau(m.creneau) || !estParticipation(m.participation)) return null;
  return {
    prenom: m.prenom,
    email,
    creneau: m.creneau,
    participation: m.participation,
    prochainCycle: (m.prochain_cycle ?? "non").startsWith("oui"),
    montantCentimes: session.amount_total ?? PRIX_CENTIMES,
    payeLe: new Date(session.created * 1000),
    reference: pi.id,
    sessionId: session.id,
    paiementUrl: lienPaiementStripe(pi.id, live),
  };
}

export async function chargerSession(
  stripe: Stripe,
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
  } catch {
    return null;
  }
}

// Envoie la confirmation à la personne et la notification à Alyson, une
// seule fois par paiement (clé d'idempotence : le webhook Stripe et la
// page « merci » peuvent tous deux déclencher l'envoi sans doublon).
export type ResultatEnvoi =
  | { ok: true }
  | { ok: false; raison: "introuvable" | "non_paye" | "autre_activite" | "trop_ancien" | "erreur_email" };

export async function envoyerEmailsInscription(
  stripe: Stripe,
  live: boolean,
  sessionId: string,
  opts: { ageMaxMs?: number } = {}
): Promise<ResultatEnvoi> {
  const session = await chargerSession(stripe, sessionId);
  if (!session) return { ok: false, raison: "introuvable" };
  if (session.metadata?.cercle !== CYCLE_ID) return { ok: false, raison: "autre_activite" };
  if (session.status !== "complete" || session.payment_status !== "paid") {
    return { ok: false, raison: "non_paye" };
  }
  if (opts.ageMaxMs && Date.now() - session.created * 1000 > opts.ageMaxMs) {
    return { ok: false, raison: "trop_ancien" };
  }
  const i = lireInscription(session, live);
  if (!i) return { ok: false, raison: "autre_activite" };

  try {
    await envoyer(emailConfirmation(i), {
      idempotencyKey: `cercle-confirmation-${session.id}`,
      pieceJointes: true,
    });
    await envoyer(emailNotifInscription(i), { idempotencyKey: `cercle-notif-inscription-${session.id}` });
    return { ok: true };
  } catch (err) {
    console.error("[CERCLE] Échec envoi emails d'inscription:", session.id, err instanceof Error ? err.message : err);
    return { ok: false, raison: "erreur_email" };
  }
}

// ── Rétractation ────────────────────────────────────────────────────

// Retrouve les paiements réussis du Cercle faits avec cet email, du plus
// récent au plus ancien.
export async function trouverPaiements(
  stripe: Stripe,
  live: boolean,
  email: string
): Promise<{ session: Stripe.Checkout.Session; inscription: Inscription }[]> {
  const cible = email.trim().toLowerCase();
  const trouves: { session: Stripe.Checkout.Session; inscription: Inscription }[] = [];
  const liste = stripe.checkout.sessions.list({
    created: { gte: CYCLE_START_UNIX },
    limit: 100,
    expand: ["data.payment_intent"],
  });
  for await (const s of liste) {
    if (s.metadata?.cercle !== CYCLE_ID) continue;
    if (s.status !== "complete" || s.payment_status !== "paid") continue;
    const i = lireInscription(s, live);
    if (i && i.email === cible) trouves.push({ session: s, inscription: i });
  }
  return trouves.sort((a, b) => b.inscription.payeLe.getTime() - a.inscription.payeLe.getTime());
}

export type Remboursement = {
  centimes: number | null; // null : à décider (créneau « les deux » non confirmé)
  resume: string;
  detail: string[];
  aDecider: boolean;
};

// Règle des conditions : 12 € avant la première rencontre du créneau,
// sinon 3 € par rencontre qui reste.
function montantPourCreneau(creneau: "vendredi" | "mardi", maintenant: Date) {
  const dates = RENCONTRES_DATES[creneau];
  if (maintenant.getTime() < dates[0].getTime()) {
    return { centimes: PRIX_CENTIMES, restantes: dates.length, avantDebut: true };
  }
  const restantes = dates.filter((d) => d.getTime() > maintenant.getTime()).length;
  return {
    centimes: Math.min(PRIX_CENTIMES, restantes * PRIX_PAR_RENCONTRE_CENTIMES),
    restantes,
    avantDebut: false,
  };
}

export function calculerRemboursement(creneau: CreneauId, maintenant: Date): Remboursement {
  const nom = { vendredi: "vendredi", mardi: "mardi" } as const;
  if (creneau !== "deux") {
    const r = montantPourCreneau(creneau, maintenant);
    return {
      centimes: r.centimes,
      resume: r.avantDebut
        ? `${euros(r.centimes)} (avant la première rencontre du créneau ${nom[creneau]})`
        : `${euros(r.centimes)} (${r.restantes} rencontre(s) restante(s) × 3 €)`,
      detail: [],
      aDecider: false,
    };
  }
  const v = montantPourCreneau("vendredi", maintenant);
  const m = montantPourCreneau("mardi", maintenant);
  // Avant le début des deux créneaux, la réponse est la même : 12 €.
  if (v.avantDebut && m.avantDebut) {
    return {
      centimes: PRIX_CENTIMES,
      resume: `${euros(PRIX_CENTIMES)} (avant la première rencontre des deux créneaux)`,
      detail: [],
      aDecider: false,
    };
  }
  return {
    centimes: null,
    resume: `à décider : ${euros(v.centimes)} si vendredi, ${euros(m.centimes)} si mardi`,
    detail: [
      `Si vendredi : ${v.avantDebut ? "avant la première rencontre" : `${v.restantes} rencontre(s) restante(s)`} → ${euros(v.centimes)}`,
      `Si mardi : ${m.avantDebut ? "avant la première rencontre" : `${m.restantes} rencontre(s) restante(s)`} → ${euros(m.centimes)}`,
    ],
    aDecider: true,
  };
}

export function horsDelaiRetractation(payeLe: Date, maintenant: Date): boolean {
  return maintenant.getTime() > payeLe.getTime() + DELAI_RETRACTATION_JOURS * 24 * 3600 * 1000;
}

// Traite une demande de rétractation : notifie Alyson, et, si un paiement
// est retrouvé, envoie l'accusé de réception à la personne. Alyson fait
// le remboursement elle-même dans Stripe.
export async function traiterRetractation(
  stripe: Stripe,
  live: boolean,
  saisie: { prenom: string; email: string; creneau: CreneauId },
  maintenant: Date = new Date()
): Promise<void> {
  const paiements = await trouverPaiements(stripe, live, saisie.email);
  const principal = paiements[0];

  const infos: InfosRetractation = {
    prenomSaisi: saisie.prenom,
    emailSaisi: saisie.email,
    creneauSaisi: saisie.creneau,
    recuLe: maintenant,
    paiementTrouve: !!principal,
    horsDelai: false,
    autresPaiements: Math.max(0, paiements.length - 1),
  };
  if (principal) {
    const i = principal.inscription;
    infos.paiementUrl = i.paiementUrl;
    infos.creneauPaiement = i.creneau;
    infos.payeLe = i.payeLe;
    infos.montantPayeCentimes = i.montantCentimes;
    infos.horsDelai = horsDelaiRetractation(i.payeLe, maintenant);
    infos.remboursement = calculerRemboursement(i.creneau, maintenant);
  }

  // Clé d'idempotence : un double clic ne produit qu'un seul envoi.
  const cle = principal ? principal.inscription.reference : saisie.email;
  const minute = Math.floor(maintenant.getTime() / 60000);
  await envoyer(emailNotifRetractation(infos), { idempotencyKey: `cercle-retractation-notif-${cle}-${minute}` });

  if (principal) {
    // Repère dans Stripe : la page de gestion s'en sert pour la liste des
    // remboursements à faire et pour ne plus écrire à cette personne.
    try {
      await noterMetadata(stripe, principal.inscription.reference, {
        retractation_recue_le: maintenant.toISOString(),
        retractation_a_rembourser:
          infos.remboursement?.centimes == null ? "a_decider" : String(infos.remboursement.centimes),
        retractation_hors_delai: infos.horsDelai ? "oui" : "non",
      });
    } catch (err) {
      console.error("[CERCLE] Repère de rétractation non noté:", err instanceof Error ? err.message : err);
    }
    // Accusé envoyé à l'adresse du paiement (pas à une adresse saisie au
    // hasard) : personne ne peut faire écrire à un tiers.
    await envoyer(emailAccuse(principal.inscription.prenom, principal.inscription.email, maintenant), {
      idempotencyKey: `cercle-retractation-accuse-${principal.inscription.reference}-${minute}`,
    });
  }
}
