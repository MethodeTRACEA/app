// Test de la logique de gestion du Cercle (confirmations, liens Zoom,
// annulation, effacement) avec un FAUX Stripe en mémoire et un envoi
// SIMULÉ : aucun email, aucun appel réseau.
//   npx tsx --tsconfig tsconfig.scripts.json scripts/cercle-test-gestion.ts
import { CYCLE_ID } from "../src/lib/cercle/config";
import { _remplacerEnvoyeurPourTests, type EmailPret } from "../src/lib/cercle/emails";
import {
  actionAnnulerCycle, actionConfirmer, actionEffacer, actionEnvoyerLiens, actionMarquerRemboursement, actionProposerAutre,
  listerPersonnes, resteARembourser,
} from "../src/lib/cercle/gestion";

process.env.CERCLE_ZOOM_VENDREDI = "https://zoom.example/vendredi";
// CERCLE_ZOOM_MARDI volontairement absent

type Fake = { id: string; created: number; email: string; md: Record<string, string>; refunded: number };
const base = { cercle: CYCLE_ID, telephone: "0600000000", commune: "Albi", participation: "ecouter", participation_libelle: "x" };
const mkP = (n: string, email: string, creneau: string, extra: Record<string, string> = {}, refunded = 0): Fake => ({
  id: "pi_" + n, created: Math.floor(new Date("2026-10-20T10:00:00Z").getTime() / 1000) + Number(n.length), email, refunded,
  md: { ...base, creneau, prenom: "P" + n, email_inscription: email, prochain_cycle: "non", ...extra },
});
const gens: Fake[] = [
  mkP("A", "a@example.com", "vendredi"),
  mkP("B", "b@example.com", "mardi"),
  mkP("C", "c@example.com", "deux", { participation: "partager", prochain_cycle: "oui, cochée le x" }),
  mkP("D", "d@example.com", "vendredi", { retractation_recue_le: "2026-10-21T10:00:00Z", retractation_a_rembourser: "1200" }),
  mkP("E", "e@example.com", "mardi", {}, 1200),
  mkP("F", "f@example.com", "vendredi"),
];
const faux: any = {
  checkout: { sessions: { list: () => ({ async *[Symbol.asyncIterator]() {
    for (const g of gens) yield {
      id: "cs_" + g.id, status: "complete", payment_status: "paid", amount_total: 1200, created: g.created,
      customer_email: g.email, customer_details: { email: g.email }, metadata: { cercle: CYCLE_ID, creneau: g.md.creneau },
      payment_intent: { id: g.id, metadata: { ...g.md }, latest_charge: { amount_refunded: g.refunded } },
    };
  } }) } },
  paymentIntents: { update: async (id: string, { metadata }: any) => {
    const g = gens.find((x) => x.id === id)!;
    for (const [k, v] of Object.entries(metadata as Record<string, string>)) { if (v === "") delete g.md[k]; else g.md[k] = v; }
  } },
};

const envoyes: EmailPret[] = [];
_remplacerEnvoyeurPourTests(async (e) => { envoyes.push(e); });
const ok = (nom: string, cond: boolean, detail = "") => console.log((cond ? "OK   " : "ÉCHEC") + " " + nom + (detail ? " : " + detail : ""));
const dernier = () => envoyes[envoyes.length - 1];

(async () => {
  let r = await actionConfirmer(faux, false, "pi_A", "vendredi");
  ok("confirmer A", r.ok && dernier().subject === "Ton groupe du Cercle est confirmé" && dernier().to === "a@example.com", r.message);
  ok("  texte groupe", dernier().text.includes("Tu fais partie du groupe du vendredi, de 21 h à 22 h 30.") && dernier().text.includes("les vendredis 20 et 27 novembre, 4 et 11 décembre"));
  r = await actionConfirmer(faux, false, "pi_A", "vendredi");
  ok("confirmer A deux fois refusé", !r.ok && envoyes.length === 1, r.message);
  r = await actionConfirmer(faux, false, "pi_D", "vendredi");
  ok("confirmer D (rétractée) refusé", !r.ok, r.message);
  r = await actionConfirmer(faux, false, "pi_E", "mardi");
  ok("confirmer E (remboursée) refusé", !r.ok, r.message);
  r = await actionConfirmer(faux, false, "pi_B", "samedi");
  ok("créneau invalide refusé", !r.ok, r.message);

  r = await actionProposerAutre(faux, false, "pi_B");
  ok("proposer autre à B", r.ok && dernier().subject === "Ton créneau du Cercle n'aura pas lieu cette fois", r.message);
  ok("  texte autre créneau", dernier().text.includes("Le groupe du mardi n'a pas réuni") && dernier().text.includes("groupe du vendredi. Les rencontres ont lieu les vendredis 20 et 27 novembre, 4 et 11 décembre, de 21 h à 22 h 30."));
  r = await actionProposerAutre(faux, false, "pi_B");
  ok("proposer deux fois refusé", !r.ok, r.message);
  r = await actionProposerAutre(faux, false, "pi_C");
  ok("proposer à « les deux » refusé", !r.ok, r.message);
  r = await actionConfirmer(faux, false, "pi_B", "vendredi");
  ok("B accepte : confirmée vendredi", r.ok, r.message);

  // Bouton « À rembourser » (F : autre créneau proposé, puis réponse « remboursement »)
  r = await actionMarquerRemboursement(faux, false, "pi_F");
  ok("« À rembourser » sans proposition : refusé", !r.ok, r.message);
  r = await actionProposerAutre(faux, false, "pi_F");
  r = await actionMarquerRemboursement(faux, false, "pi_F");
  ok("« À rembourser » après proposition", r.ok && "remboursement_demande_le" in gens.find((g) => g.id === "pi_F")!.md, r.message);
  r = await actionMarquerRemboursement(faux, false, "pi_F");
  ok("« À rembourser » deux fois refusé", !r.ok, r.message);
  r = await actionConfirmer(faux, false, "pi_F", "mardi");
  ok("plus d'email à F après remboursement demandé", !r.ok, r.message);
  r = await actionMarquerRemboursement(faux, false, "pi_B");
  ok("« À rembourser » pour une personne déjà confirmée : refusé", !r.ok, r.message);
  const pF = (await listerPersonnes(faux, false)).find((p) => p.reference === "pi_F")!;
  ok("F : 12 € à rembourser, plus active", resteARembourser(pF) === 1200 && !pF.autreProposeLe === false, String(resteARembourser(pF)));

  const avantLiens = envoyes.length;
  r = await actionEnvoyerLiens(faux, false, "vendredi", 1, { manuel: true, rapport: false });
  ok("liens vendredi 1 : A et B", r.ok && (r as any).envoyes === 2 && envoyes.length === avantLiens + 2, r.message);
  ok("  objet et lien", envoyes.some((e) => e.subject === "Demain, 21 h, le Cercle" && e.text.includes("https://zoom.example/vendredi")));
  r = await actionEnvoyerLiens(faux, false, "vendredi", 1, { manuel: true, rapport: false });
  ok("liens vendredi 1 : pas de doublon", (r as any).envoyes === 0 && (r as any).dejaEnvoyes === 2, r.message);
  r = await actionEnvoyerLiens(faux, false, "mardi", 1, { manuel: true, rapport: false });
  ok("liens mardi : lien non réglé", !r.ok && r.message.includes("CERCLE_ZOOM_MARDI"), r.message);
  r = await actionEnvoyerLiens(faux, false, "vendredi", 9, { manuel: true, rapport: false });
  ok("rencontre inconnue refusée", !r.ok, r.message);

  const avantAnnul = envoyes.length;
  r = await actionAnnulerCycle(faux, false);
  const dest = envoyes.slice(avantAnnul).map((e) => e.to).sort().join(",");
  ok("annuler le cycle : A, B, C seulement", (r as any).envoyes === 3 && dest === "a@example.com,b@example.com,c@example.com", dest);
  ok("  objet", envoyes[avantAnnul].subject === "Le Cercle n'aura pas lieu cette fois");
  r = await actionAnnulerCycle(faux, false);
  ok("annuler le cycle : pas de doublon", (r as any).envoyes === 0, r.message);
  r = await actionEnvoyerLiens(faux, false, "vendredi", 2, { manuel: true, rapport: false });
  ok("plus de liens après annulation", (r as any).envoyes === 0, r.message);

  const pers = await listerPersonnes(faux, false);
  const resteA = pers.find((p) => p.reference === "pi_A")!, resteD = pers.find((p) => p.reference === "pi_D")!, resteE = pers.find((p) => p.reference === "pi_E")!;
  ok("à rembourser : A 12 €, D 12 €, E rien", resteARembourser(resteA) === 1200 && resteARembourser(resteD) === 1200 && resteARembourser(resteE) === null,
    `${resteARembourser(resteA)} ${resteARembourser(resteD)} ${resteARembourser(resteE)}`);

  // Effacement
  let rr = await actionEffacer(faux, false, { manuel: false, maintenant: new Date("2026-12-01T08:00:00Z") });
  ok("effacement avant échéance : rien", rr.effaces === 0, rr.message);
  rr = await actionEffacer(faux, false, { manuel: false, maintenant: new Date("2026-12-16T08:00:00Z") });
  const B = gens.find((g) => g.id === "pi_E")!, A = gens.find((g) => g.id === "pi_A")!, C = gens.find((g) => g.id === "pi_C")!;
  ok("16/12 : groupe mardi effacé (E), vendredi pas encore (A, B accepté vendredi)", !("telephone" in B.md) && !("commune" in B.md) && !("prenom" in B.md) && "telephone" in A.md, `effaces=${rr.effaces}`);
  ok("  C (« les deux », sans groupe) effacée, email gardé", !("telephone" in C.md) && "email_inscription" in C.md && rr.emailsConserves === 1);
  ok("  E : email supprimé", !("email_inscription" in B.md));
  ok("  compte rendu envoyé à cercledeparole@", dernier().to === "cercledeparole@methodetracea.fr" && dernier().subject.startsWith("Effacement"));
  const nbAvant = envoyes.length;
  rr = await actionEffacer(faux, false, { manuel: false, maintenant: new Date("2026-12-17T08:00:00Z") });
  ok("17/12 : rien de nouveau, pas d'email", rr.effaces === 0 && envoyes.length === nbAvant, rr.message);
  rr = await actionEffacer(faux, false, { manuel: false, maintenant: new Date("2026-12-19T08:00:00Z") });
  ok("19/12 : vendredi effacé (A, D)", !("telephone" in A.md) && !("prenom" in A.md), `effaces=${rr.effaces}`);
  rr = await actionEffacer(faux, false, { manuel: false, maintenant: new Date("2027-12-20T08:00:00Z") });
  ok("20/12/2027 : adresse « prochain cycle » supprimée", !("email_inscription" in C.md) && rr.emailsSupprimes === 1, rr.message);
  const liste = await listerPersonnes(faux, false);
  ok("après effacement, les personnes restent listées", liste.length === 6&& liste.every((p) => !!p.effaceLe));
  ok("aucun téléphone ni commune dans les emails envoyés", !envoyes.some((e) => /0600000000|Albi/.test(e.text + e.html)));
})();
