import { Resend } from "resend";
import { CRENEAUX, PARTICIPATIONS, type CreneauId, type ParticipationId } from "./config";
import { CERCLE_EMAIL } from "./textes";
import { pdfConditions, pdfFormulaireRetractation } from "./pdf";

// ===================================================================
// Le Cercle TRACÉA en ligne — emails (envoi par Resend).
//
// Expéditeur : « Alyson · Le Cercle TRACÉA <cercledeparole@methodetracea.fr> »
// Réponses : même boîte (reply-to).
// Chaque email existe en HTML et en texte brut, fabriqués depuis la même
// liste de paragraphes : les deux disent exactement les mêmes mots.
// Textes d'Alyson, mot pour mot ; les [crochets] du brief sont remplis.
// Aucune donnée du Cercle ne passe par Supabase ni par le système d'emails
// de l'application (src/lib/email.ts n'est pas utilisé ici).
// ===================================================================

export const EXPEDITEUR = `Alyson · Le Cercle TRACÉA <${CERCLE_EMAIL}>`;

// Adresse publique du site (liens dans les emails). Réglable pour les
// tests ; par défaut, le domaine du site.
export function urlSite(): string {
  return (process.env.CERCLE_PUBLIC_URL || "https://www.methodetracea.fr").replace(/\/$/, "");
}

// ── Données ─────────────────────────────────────────────────────────

export type Inscription = {
  prenom: string;
  email: string;
  creneau: CreneauId;
  participation: ParticipationId;
  prochainCycle: boolean;
  montantCentimes: number;
  payeLe: Date;
  reference: string; // identifiant du paiement Stripe (pi_…)
  sessionId: string;
  paiementUrl: string; // lien vers le paiement dans le tableau de bord Stripe
};

// ── Mise en forme ───────────────────────────────────────────────────

const FUSEAU = "Europe/Paris";

export function dateLongue(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: FUSEAU });
}

export function heureCourte(d: Date): string {
  const p = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: FUSEAU }).formatToParts(d);
  const h = p.find((x) => x.type === "hour")?.value ?? "00";
  const m = p.find((x) => x.type === "minute")?.value ?? "00";
  return `${parseInt(h, 10)} h ${m}`;
}

export function euros(centimes: number): string {
  return `${(centimes / 100).toFixed(2).replace(".", ",")} €`;
}

function libelleCreneau(id: CreneauId): string {
  return CRENEAUX.find((c) => c.id === id)?.label ?? id;
}

// « le vendredi soir, 21 h », « le mardi après-midi, 14 h » : intégré à
// une phrase, donc en minuscules.
function creneauDansPhrase(id: CreneauId): string {
  if (id === "deux") return "les deux créneaux";
  const l = libelleCreneau(id);
  return l.charAt(0).toLowerCase() + l.slice(1);
}

function libelleParticipation(id: ParticipationId): string {
  return PARTICIPATIONS.find((p) => p.id === id)?.label ?? id;
}

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Gabarit commun ──────────────────────────────────────────────────

type Bloc =
  | { type: "p"; texte: string; html?: string }
  | { type: "alerte"; texte: string }
  | { type: "recap"; titre: string; lignes: [string, string][] };

const C = {
  fond: "#F5EDE2",
  carte: "#FFFFFF",
  texte: "#2C1F14",
  corps: "#4A3A2E",
  discret: "#6B5A4E",
  terra: "#8A4A2F",
  trait: "#E8D8C6",
};

function rendreHtml(blocs: Bloc[], pied?: string): string {
  const corps = blocs
    .map((b) => {
      if (b.type === "p") {
        const contenu = b.html ?? echapper(b.texte).replace(/\n/g, "<br>");
        return `<p style="margin:0 0 18px;font-size:17px;line-height:1.65;color:${C.corps};">${contenu}</p>`;
      }
      if (b.type === "alerte") {
        return `<div style="margin:0 0 22px;padding:16px 18px;border-radius:12px;background:#FBE9DF;border:1px solid #C4704A;font-size:17px;line-height:1.5;font-weight:700;color:${C.texte};">${echapper(b.texte)}</div>`;
      }
      const lignes = b.lignes
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 0;border-top:1px solid ${C.trait};font-size:15px;color:${C.discret};width:42%;vertical-align:top;">${echapper(k)}</td><td style="padding:8px 0;border-top:1px solid ${C.trait};font-size:15px;color:${C.texte};vertical-align:top;">${echapper(v)}</td></tr>`
        )
        .join("");
      return `<div style="margin:26px 0 0;"><p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.terra};">${echapper(b.titre)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${lignes}</table></div>`;
    })
    .join("");
  const piedHtml = pied
    ? `<p style="margin:26px 0 0;font-size:13px;line-height:1.5;color:${C.discret};">${echapper(pied)}</p>`
    : "";
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head><body style="margin:0;padding:0;background:${C.fond};"><div style="padding:24px 12px;"><div style="max-width:560px;margin:0 auto;"><p style="margin:0 0 14px 4px;font-size:12px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:${C.terra};font-family:Arial,Helvetica,sans-serif;">Le Cercle TRACÉA</p><div style="background:${C.carte};border-radius:20px;padding:30px 26px;font-family:Georgia,'Times New Roman',serif;">${corps}${piedHtml}</div></div></div></body></html>`;
}

function rendreTexte(blocs: Bloc[], pied?: string): string {
  const parts = blocs.map((b) => {
    if (b.type === "p") return b.texte;
    if (b.type === "alerte") return `*** ${b.texte} ***`;
    return `${b.titre.toUpperCase()}\n${b.lignes.map(([k, v]) => `${k} : ${v}`).join("\n")}`;
  });
  if (pied) parts.push(pied);
  return parts.join("\n\n");
}

export type EmailPret = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
};

function email(to: string, subject: string, blocs: Bloc[], pied?: string): EmailPret {
  return {
    from: EXPEDITEUR,
    to,
    replyTo: CERCLE_EMAIL,
    subject,
    html: rendreHtml(blocs, pied),
    text: rendreTexte(blocs, pied),
  };
}

// ── 1. Confirmation d'inscription (à la personne) ───────────────────

export function emailConfirmation(i: Inscription): EmailPret {
  const lien = `${urlSite()}/cercle/renoncer`;
  const blocs: Bloc[] = [
    { type: "p", texte: `Bonjour ${i.prenom},` },
    {
      type: "p",
      texte: "Ta place est réservée. Merci d'avoir fait ce premier pas : il n'est pas toujours le plus simple.",
    },
    {
      type: "p",
      texte: `Tu as choisi : ${creneauDansPhrase(i.creneau)}. Le 13 novembre, je te confirme ton groupe. La veille de chaque rencontre, tu recevras le lien Zoom.`,
    },
    {
      type: "p",
      texte:
        "Pour les rencontres, un endroit calme suffit, avec un verre d'eau à portée de main. Des écouteurs aident aussi à garder la parole des autres pour toi.",
    },
  ];
  if (i.participation === "partager") {
    blocs.push({
      type: "p",
      texte:
        "Tu as indiqué que tu aimerais partager un moment de ton histoire. Je t'appellerai avant la deuxième rencontre pour en parler ensemble. Rien n'est engagé d'ici là.",
    });
  }
  blocs.push(
    {
      type: "p",
      texte: `Tu trouveras en pièce jointe les conditions d'inscription et le formulaire de rétractation. Tu peux changer d'avis pendant quatorze jours : il suffit de répondre à cet email, ou de passer par « Renoncer au contrat ici » : ${lien}.`,
      html: `Tu trouveras en pièce jointe les conditions d'inscription et le formulaire de rétractation. Tu peux changer d'avis pendant quatorze jours : il suffit de répondre à cet email, ou de passer par «&nbsp;<a href="${echapper(lien)}" style="color:${C.terra};">Renoncer au contrat ici</a>&nbsp;» : <a href="${echapper(lien)}" style="color:${C.terra};">${echapper(lien)}</a>.`,
    },
    { type: "p", texte: "Si quelque chose devient trop lourd d'ici là, le 3114 répond jour et nuit." },
    { type: "p", texte: "À très vite,\nAlyson" },
    {
      type: "recap",
      titre: "Récapitulatif",
      lignes: [
        ["Montant payé", euros(i.montantCentimes)],
        ["Date et heure", `${dateLongue(i.payeLe)} à ${heureCourte(i.payeLe)}`],
        ["Créneau", libelleCreneau(i.creneau)],
        ["Référence du paiement", i.reference],
      ],
    }
  );
  return email(i.email, "Ta place au Cercle est réservée", blocs);
}

// ── 2. Accusé de réception de rétractation (à la personne) ──────────

export function emailAccuse(prenom: string, to: string, recuLe: Date): EmailPret {
  const blocs: Bloc[] = [
    { type: "p", texte: `Bonjour ${prenom},` },
    {
      type: "p",
      texte: `J'ai bien reçu ta demande de rétractation, le ${dateLongue(recuLe)} à ${heureCourte(recuLe)}.`,
    },
    {
      type: "p",
      texte: "Je te rembourse dans un délai de quatorze jours au plus, par le même moyen de paiement.",
    },
    {
      type: "p",
      texte: "Merci de m'avoir prévenue. Ta place reste ouverte pour un prochain cycle, si un jour tu en as envie.",
    },
    { type: "p", texte: "Alyson" },
  ];
  return email(to, "Ta demande de rétractation est bien reçue", blocs);
}

// ── 3. Notification d'inscription (à Alyson) ────────────────────────
// Ni téléphone, ni commune, ni email : ils restent dans Stripe.

export function emailNotifInscription(i: Inscription): EmailPret {
  const veutPartager = i.participation === "partager";
  const court = i.creneau === "deux" ? "les deux" : i.creneau;
  const sujet = `Nouvelle inscription : ${i.prenom} · ${court}${veutPartager ? " · souhaite partager son histoire" : ""}`;
  const blocs: Bloc[] = [];
  if (veutPartager) {
    blocs.push({
      type: "alerte",
      texte: "Souhaite partager un moment de son histoire : à appeler avant la deuxième rencontre.",
    });
  }
  blocs.push({
    type: "recap",
    titre: "Nouvelle inscription",
    lignes: [
      ["Prénom", i.prenom],
      ["Créneau", libelleCreneau(i.creneau)],
      ["Façon de participer", libelleParticipation(i.participation)],
    ],
  });
  blocs.push({
    type: "p",
    texte: `Paiement dans Stripe : ${i.paiementUrl}`,
    html: `<span style="font-size:15px;">Paiement dans Stripe : <a href="${echapper(i.paiementUrl)}" style="color:${C.terra};">voir le paiement</a></span>`,
  });
  const e = email(CERCLE_EMAIL, sujet, blocs);
  // Ici, c'est une réponse de la boîte à elle-même : on laisse reply-to par défaut.
  return e;
}

// ── 4. Notification de rétractation (à Alyson) ──────────────────────

export type InfosRetractation = {
  prenomSaisi: string;
  emailSaisi: string;
  creneauSaisi: CreneauId;
  recuLe: Date;
  paiementTrouve: boolean;
  paiementUrl?: string;
  creneauPaiement?: CreneauId;
  payeLe?: Date;
  montantPayeCentimes?: number;
  horsDelai: boolean;
  remboursement?: {
    resume: string; // ex. « 12,00 € (avant la première rencontre) »
    detail: string[];
    aDecider: boolean; // créneau « les deux » non confirmé
  };
  autresPaiements: number;
};

export function emailNotifRetractation(r: InfosRetractation): EmailPret {
  const blocs: Bloc[] = [];
  if (r.horsDelai) {
    blocs.push({
      type: "alerte",
      texte: "HORS DÉLAI : la demande arrive plus de quatorze jours après l'inscription. À toi de décider.",
    });
  }
  if (!r.paiementTrouve) {
    blocs.push({
      type: "alerte",
      texte: "AUCUN PAIEMENT RETROUVÉ avec cet email. Aucun accusé n'a été envoyé : écris à la personne.",
    });
  }
  if (r.remboursement?.aDecider) {
    blocs.push({
      type: "alerte",
      texte: "Créneau « les deux » : pas encore de créneau confirmé pour cette personne. Montant à décider.",
    });
  }
  const lignes: [string, string][] = [
    ["Prénom", r.prenomSaisi],
    ["Email saisi", r.emailSaisi],
    ["Créneau indiqué", libelleCreneau(r.creneauSaisi)],
    ["Demande reçue", `${dateLongue(r.recuLe)} à ${heureCourte(r.recuLe)}`],
  ];
  if (r.paiementTrouve) {
    if (r.creneauPaiement) lignes.push(["Créneau du paiement", libelleCreneau(r.creneauPaiement)]);
    if (r.payeLe) lignes.push(["Inscription payée le", `${dateLongue(r.payeLe)} à ${heureCourte(r.payeLe)}`]);
    if (r.montantPayeCentimes != null) lignes.push(["Montant payé", euros(r.montantPayeCentimes)]);
    if (r.remboursement) lignes.push(["Montant à rembourser", r.remboursement.resume]);
  }
  if (r.autresPaiements > 0) {
    lignes.push(["Attention", `${r.autresPaiements} autre(s) paiement(s) avec cet email : vérifie dans Stripe`]);
  }
  blocs.push({ type: "recap", titre: "Demande de rétractation", lignes });
  if (r.remboursement && r.remboursement.detail.length) {
    blocs.push({ type: "p", texte: r.remboursement.detail.join("\n") });
  }
  if (r.paiementUrl) {
    blocs.push({
      type: "p",
      texte: `Rembourser dans Stripe : ${r.paiementUrl}`,
      html: `<span style="font-size:16px;">Rembourser dans Stripe : <a href="${echapper(r.paiementUrl)}" style="color:${C.terra};">ouvrir le paiement</a></span>`,
    });
  }
  const etiquette = r.horsDelai ? "HORS DÉLAI · " : !r.paiementTrouve ? "paiement introuvable · " : "";
  return email(CERCLE_EMAIL, `Rétractation : ${etiquette}${r.prenomSaisi}`, blocs);
}

// ── Envoi ───────────────────────────────────────────────────────────

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("[cercle-email] RESEND_API_KEY manquante");
  return new Resend(key);
}

export type OptionsEnvoi = {
  idempotencyKey?: string;
  pieceJointes?: boolean;
};

// Envoie un email. Lève une erreur si l'envoi échoue (l'appelant décide
// quoi faire : le webhook Stripe répond 500 pour qu'il soit rejoué).
export async function envoyer(e: EmailPret, opts: OptionsEnvoi = {}): Promise<void> {
  const attachments = opts.pieceJointes
    ? [
        { filename: "Conditions-inscription-Cercle-TRACEA.pdf", content: Buffer.from(await pdfConditions()) },
        {
          filename: "Formulaire-retractation-Cercle-TRACEA.pdf",
          content: Buffer.from(await pdfFormulaireRetractation()),
        },
      ]
    : undefined;
  const { error } = await getResend().emails.send(
    {
      from: e.from,
      to: e.to,
      replyTo: e.replyTo,
      subject: e.subject,
      html: e.html,
      text: e.text,
      attachments,
    },
    opts.idempotencyKey ? { idempotencyKey: opts.idempotencyKey } : undefined
  );
  if (error) throw new Error(`[cercle-email] envoi refusé : ${error.name} ${error.message}`);
}
