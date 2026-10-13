import { writeFileSync } from "fs";
import {
  emailConfirmation, emailAccuse, emailNotifInscription, emailNotifRetractation, envoyer,
  type Inscription, type InfosRetractation, type EmailPret,
} from "../src/lib/cercle/emails";
import { calculerRemboursement } from "../src/lib/cercle/inscriptions";
import { pdfConditions, pdfFormulaireRetractation } from "../src/lib/cercle/pdf";

// Outil de test des emails du Cercle. Fabrique chaque email avec des
// données d'exemple et l'enregistre dans public/_tmp-emails/ (à supprimer
// avant la mise en production). Avec --envoyer, envoie les tests
// UNIQUEMENT à cercledeparole@methodetracea.fr (objet précédé de [TEST]).
//   Aperçu seul : npx tsx --tsconfig tsconfig.scripts.json scripts/cercle-test-emails.ts
//   Avec envoi  : (idem) --envoyer   (RESEND_API_KEY doit être valide)
const TO = "cercledeparole@methodetracea.fr";
const envoyerVraiment = process.argv.includes("--envoyer");

const base: Inscription = {
  prenom: "Camille", email: TO, creneau: "vendredi", participation: "micro", prochainCycle: false,
  montantCentimes: 1200, payeLe: new Date("2026-10-14T12:05:00+02:00"),
  reference: "pi_3TEST0000000000000000001", sessionId: "cs_test_x",
  paiementUrl: "https://dashboard.stripe.com/test/payments/pi_3TEST0000000000000000001",
};
const partager: Inscription = { ...base, participation: "partager", creneau: "deux" };

const recu = new Date("2026-10-20T09:30:00+02:00");
const rembNormal = calculerRemboursement("vendredi", recu);
const ret1: InfosRetractation = {
  prenomSaisi: "Camille", emailSaisi: TO, creneauSaisi: "vendredi", recuLe: recu, paiementTrouve: true,
  paiementUrl: base.paiementUrl, creneauPaiement: "vendredi", payeLe: base.payeLe, montantPayeCentimes: 1200,
  horsDelai: false, remboursement: rembNormal, autresPaiements: 0,
};
const apres = new Date("2026-11-28T10:00:00+01:00"); // après 2 rencontres du vendredi, hors délai
const ret2: InfosRetractation = {
  ...ret1, recuLe: apres, horsDelai: true, remboursement: calculerRemboursement("vendredi", apres),
};
const ret3: InfosRetractation = {
  prenomSaisi: "Camille", emailSaisi: "camille.erreur@example.com", creneauSaisi: "mardi", recuLe: recu,
  paiementTrouve: false, horsDelai: false, autresPaiements: 0,
};

const liste: [string, EmailPret][] = [
  ["01-confirmation-sans-partage", emailConfirmation(base)],
  ["02-confirmation-avec-partage", emailConfirmation(partager)],
  ["03-accuse-retractation", emailAccuse("Camille", TO, recu)],
  ["04-notif-inscription", emailNotifInscription(base)],
  ["05-notif-inscription-partage", emailNotifInscription(partager)],
  ["06-notif-retractation-normale", emailNotifRetractation(ret1)],
  ["07-notif-retractation-hors-delai", emailNotifRetractation(ret2)],
  ["08-notif-retractation-introuvable", emailNotifRetractation(ret3)],
];

(async () => {
  for (const [nom, e] of liste) writeFileSync(`public/_tmp-emails/${nom}.html`, e.html, "utf-8");
  const items = liste.map(([n, e]) => `<li><a href="${n}.html">${n}</a> : ${e.subject.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</li>`).join("");
  writeFileSync(
    "public/_tmp-emails/index.html",
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Aperçu des emails du Cercle</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:Georgia,serif;max-width:640px;margin:40px auto;padding:0 16px;color:#2C1F14;line-height:1.7"><h1>Aperçu des emails du Cercle (données d'exemple)</h1><ul>${items}<li><a href="conditions.pdf">conditions.pdf</a> : pièce jointe</li><li><a href="formulaire.pdf">formulaire.pdf</a> : pièce jointe</li></ul></body></html>`,
    "utf-8"
  );
  writeFileSync("public/_tmp-emails/conditions.pdf", await pdfConditions());
  writeFileSync("public/_tmp-emails/formulaire.pdf", await pdfFormulaireRetractation());
  console.log("Rembt normal:", rembNormal.resume, "|", "hors délai:", calculerRemboursement("vendredi", apres).resume);
  console.log("Deux, avant début:", calculerRemboursement("deux", new Date("2026-11-10T10:00:00+01:00")).resume);
  console.log("Deux, 18/11 :", calculerRemboursement("deux", new Date("2026-11-18T10:00:00+01:00")).resume);
  console.log("Mardi, 3e rencontre passée:", calculerRemboursement("mardi", new Date("2026-12-02T10:00:00+01:00")).resume);
  console.log("Sujets:"); for (const [n, e] of liste) console.log(" ", n, "→", e.subject, "→", e.to);
  if (envoyerVraiment) {
    for (const [nom, e] of liste) {
      if (e.to !== TO) throw new Error("Destinataire inattendu, arrêt : " + e.to);
      await envoyer({ ...e, subject: `[TEST] ${e.subject}` }, { pieceJointes: nom.startsWith("01") || nom.startsWith("02") });
      console.log("envoyé:", nom);
      await new Promise((r) => setTimeout(r, 900));
    }
  }
})().catch((e) => { console.error("ERREUR:", e.message); process.exit(1); });
