// ===================================================================
// Les six mouvements de la Méthode TRACÉA, pour les pages publiques.
//
// SOURCE UNIQUE. Ces textes décrivent ce que fait réellement
// /app/session. Si un écran de l'app change, ce fichier change avec
// lui : c'est la seule façon d'éviter que le site raconte une chose
// et que l'application en fasse une autre.
//
// texteCourt   : version accueil (présentation en une phrase).
// texteDetail  : version longue, reprise telle quelle de la page
//                /comment-ca-marche. Pas encore branchée sur cette
//                page : elle y sera raccordée dans un second temps.
//
// Ne pas confondre avec src/lib/steps.ts, qui sert uniquement au
// composant StepIndicator (lettres et noms) dans l'application.
// ===================================================================

export type MouvementPublic = {
  lettre: string;
  nom: string;
  texteCourt: string;
  texteDetail: string;
};

export const MOUVEMENTS_PUBLICS: MouvementPublic[] = [
  {
    lettre: "T",
    nom: "Traverser",
    texteCourt: "Commencer là où tu es, avant d'expliquer ou de résoudre.",
    texteDetail:
      "Tu restes face à ce qui est là, sans fuir.\nC'est le point de départ.\nPas une performance.",
  },
  {
    lettre: "R",
    nom: "Reconnaître",
    texteCourt:
      "Mettre des mots sur ce qui se passe, sans avoir besoin de tout comprendre.",
    texteDetail:
      "Tu nommes ce que tu ressens.\nL'émotion, la sensation, l'intensité. Sans te juger.",
  },
  {
    lettre: "A",
    nom: "Ancrer",
    texteCourt: "Donner au corps un point d'appui concret.",
    texteDetail:
      "Tu reviens au corps avec un geste court.\nUtilisable partout, même en 30 secondes.",
  },
  {
    lettre: "C",
    nom: "Comprendre",
    texteCourt:
      "Regarder ce qui se joue, quand l'intensité le permet. Et surtout, ce dont tu aurais besoin, là.",
    texteDetail:
      "Tu vois ce qui aiderait, là.\nPas une analyse.\nJuste ce dont tu aurais besoin, dans ce moment.",
  },
  {
    lettre: "E",
    nom: "Émerger",
    texteCourt:
      "Laisser apparaître une direction. Pas forcément une solution complète. Quelque chose qui commence à se préciser.",
    texteDetail:
      "Tu laisses une direction apparaître.\nQuelque chose de concret, pas une solution complète.",
  },
  {
    lettre: "A",
    nom: "Aligner",
    texteCourt: "Choisir un geste qui semble juste maintenant.",
    texteDetail:
      "Tu choisis un micro-geste, le plus petit possible,\ncohérent avec ce que tu viens de traverser.",
  },
];
