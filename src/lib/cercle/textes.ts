// ===================================================================
// Le Cercle TRACÉA en ligne — textes de référence (source unique).
//
// Utilisés à la fois par la page /cercle/conditions et par le PDF joint
// à l'email de confirmation : les deux affichent exactement les mêmes
// mots. Textes d'Alyson (13 oct. 2026), mot pour mot. Toute modification
// ici change la page ET le PDF.
// ===================================================================

export const CERCLE_EMAIL = "cercledeparole@methodetracea.fr";

export const VENDEUR = {
  nom: "Alyson Sire EI",
  statut: "entrepreneuse individuelle",
  siret: "512 468 174 00036",
  adresse: "57 chemin des Marronniers, 81630 Salvagnac",
  email: CERCLE_EMAIL,
};

export type SectionConditions = {
  id: string;
  titre: string;
  paragraphes: string[];
};

export const CONDITIONS_TITRE = "Les conditions d'inscription";

export const CONDITIONS: SectionConditions[] = [
  {
    id: "qui",
    titre: "Qui peut s'inscrire",
    paragraphes: [
      "Le Cercle est ouvert à toute personne de 18 ans et plus. Chaque groupe accueille douze personnes au plus. Pour protéger chacun, les messages privés entre participants sont désactivés sur Zoom, et ce qui touche à des violences est accueilli en privé, après la rencontre, jamais devant le groupe.",
    ],
  },
  {
    id: "creneaux",
    titre: "Les créneaux",
    paragraphes: [
      "Deux créneaux sont proposés : le vendredi de 21 h à 22 h 30, et le mardi de 14 h à 15 h 30, du 17 novembre au 11 décembre 2026. Chaque créneau a lieu s'il réunit au moins quatre personnes inscrites au 13 novembre 2026. Ce jour-là, je confirme à chaque personne son créneau par email.",
    ],
  },
  {
    id: "tarif",
    titre: "Le tarif et le paiement",
    paragraphes: [
      "L'inscription coûte 12 € pour les quatre rencontres. C'est un tarif pilote, propre à ce premier cycle. TVA non applicable, article 293 B du CGI. Le paiement se fait en une fois, en ligne, par Stripe. Je ne vois jamais tes coordonnées bancaires. Un email de confirmation t'est envoyé, avec ces conditions et le formulaire de rétractation.",
    ],
  },
  {
    id: "retractation",
    titre: "Ton droit de rétractation",
    paragraphes: [
      "Tu as quatorze jours après ton inscription pour changer d'avis, sans avoir à te justifier. Il suffit de cliquer sur « Renoncer au contrat ici », en bas de la page du Cercle, ou de m'écrire. Je te rembourse sous quatorze jours, par le même moyen de paiement.",
      "Le Cercle peut commencer avant la fin de ces quatorze jours. Dans ce cas, le formulaire te demande ton accord. Si tu te rétractes alors que le Cercle a déjà commencé, je te rembourse les rencontres qui restent : 3 € par rencontre.",
      "Une absence n'est pas une rétractation. Si tu ne viens pas à une rencontre sans m'avoir écrit, elle n'est pas remboursée.",
    ],
  },
  {
    id: "remboursements",
    titre: "Les autres remboursements",
    paragraphes: [
      "Je te rembourse entièrement si ton créneau n'a pas lieu et que l'autre ne te convient pas, ou si j'annule le cycle. Après la fin de ton délai de rétractation, l'inscription n'est plus remboursée, sauf situation particulière : écris-moi, on en parlera.",
    ],
  },
  {
    id: "report",
    titre: "Si une rencontre est reportée",
    paragraphes: [
      "En cas d'imprévu de mon côté, la rencontre est reportée à la semaine suivante, et je te préviens par email au plus vite. Si la nouvelle date ne te convient pas, je te rembourse cette rencontre.",
    ],
  },
  {
    id: "engagement",
    titre: "Ton engagement",
    paragraphes: [
      "En t'inscrivant, tu t'engages à garder pour toi ce que tu entends, à ne rien enregistrer, filmer ni photographier, et à parler de toi plutôt que des autres. Si cet engagement n'est pas respecté, je peux mettre fin à la participation d'une personne, pour protéger le groupe. Les rencontres restantes lui sont alors remboursées.",
    ],
  },
  {
    id: "nest-pas",
    titre: "Ce que le Cercle n'est pas",
    paragraphes: [
      "Le Cercle est un espace de parole entre pairs. Ce n'est ni une thérapie, ni un soin, ni du coaching. Il ne remplace pas un suivi médical, psychologique, en addictologie ou juridique. Je m'engage à tenir le cadre décrit sur cette page. Je ne promets aucun effet.",
    ],
  },
  {
    id: "desaccord",
    titre: "En cas de désaccord",
    paragraphes: [
      "Écris-moi d'abord, on cherchera ensemble une solution. Si elle ne vient pas, tu peux saisir gratuitement le médiateur de la consommation : CM2C, 49 rue de Ponthieu, 75008 Paris, www.cm2c.net, 01 89 47 00 14.",
    ],
  },
  {
    id: "vendeur",
    titre: "Qui vend",
    paragraphes: [
      `${VENDEUR.nom}, ${VENDEUR.statut} · SIRET ${VENDEUR.siret} · ${VENDEUR.adresse} · ${VENDEUR.email}`,
    ],
  },
];

// ── Formulaire type de rétractation ─────────────────────────────────
// Modèle de l'annexe à l'article R221-1 du Code de la consommation,
// reproduit tel quel, complété avec les coordonnées de la vendeuse.
export const FORMULAIRE_RETRACTATION = {
  titre: "Formulaire de rétractation",
  consigne:
    "(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)",
  destinataire: `À l'attention de ${VENDEUR.nom}, ${VENDEUR.adresse}, ${VENDEUR.email} :`,
  lignes: [
    "Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*)/pour la prestation de services (*) ci-dessous :",
    "Commandé le (*)/reçu le (*) :",
    "Nom du (des) consommateur(s) :",
    "Adresse du (des) consommateur(s) :",
    "Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :",
    "Date :",
  ],
  note: "(*) Rayez la mention inutile.",
};
