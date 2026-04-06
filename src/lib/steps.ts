import { StepDefinition } from "./types";

export const STEPS: StepDefinition[] = [
  {
    id: "traverser",
    number: 1,
    name: "Traverser",
    verb: "T",
    description:
      "Prends un instant.\nLaisse sortir ce qui est là.",
    question: "",
    help: {
      comprendre:
        "Tu n'as pas besoin de comprendre.\n\nJuste sentir ce qui est là,\nmême un tout petit peu.",
      sousQuestions: [
        "Où tu sens ça ?",
        "Plutôt : serré, lourd, vide ou agité ?",
        "Même flou, ça suffit.",
      ],
      exemples: [
        "Ça serre dans ma poitrine.",
        "J'ai une boule au ventre.",
        "Je me sens agitée.",
        "Il y a comme un vide.",
      ],
      bloque:
        "Si rien ne vient :\n\npose une main sur ton corps,\net sens juste ce qui est là.\n\n\"Je ne sais pas\" est déjà une réponse.",
    },
  },
  {
    id: "reconnaitre",
    number: 2,
    name: "Reconnaître",
    verb: "R",
    description:
      "",
    question:
      "Ça se rapproche de quoi ?",
    help: {
      comprendre:
        "Ce que tu ressens en premier n'est pas toujours le plus profond.\nParfois, il y a quelque chose de plus sensible dessous.",
      sousQuestions: [
        "Si tu restes un instant dessous, qu'est-ce que tu trouves ?",
        "Est-ce qu'il y a de la tristesse, de la peur, de la fatigue… ou autre chose ?",
        "Qu'est-ce qui semble le plus sensible là, maintenant ?",
        "Même si ce n'est pas clair, qu'est-ce qui se laisse juste deviner ?",
      ],
      exemples: [
        "Sous mon agitation, il y a surtout de la tristesse.",
        "Je croyais être tendue, mais en dessous je me sens fatiguée.",
        "Il y a quelque chose de plus fragile que ce que je montre.",
        "Je sens surtout de la peur.",
        "Je ne sais pas exactement, mais je sens que ce n'est pas seulement de la colère.",
      ],
      bloque:
        "Si rien ne vient, ne force pas.\nMême \"je ne sais pas\" est déjà une réponse.",
    },
  },
  {
    id: "ancrer",
    number: 3,
    name: "Ancrer",
    verb: "A",
    description:
      "On va juste ralentir ici.",
    question:
      "Là, c'est comment ?",
    help: {
      comprendre:
        "Quand une émotion forte est présente, le corps entre dans un état d'alerte — le souffle se raccourcit, les muscles se contractent, la pensée s'emballe. Ancrer, c'est revenir dans le corps pour lui dire : tu peux relâcher un peu. Pas en niant ce qui se passe — en créant assez de stabilité pour que la suite soit possible. Le guide de respiration est là pour t'aider. Utilise-le.",
      sousQuestions: [
        "Est-ce que tu sens tes pieds au sol en ce moment ?",
        "Pose les deux mains à plat sur tes cuisses — qu'est-ce que tu sens sous tes paumes ?",
        "Après quelques respirations lentes, qu'est-ce qui a changé dans ton corps ?",
        "Y a-t-il un endroit dans ton corps qui se sent calme ou stable, même légèrement ?",
        "Qu'est-ce que tu entends autour de toi là, maintenant ?",
      ],
      exemples: [
        "En respirant, la pression dans ma poitrine diminue un peu.",
        "Je sens mes pieds, le sol est solide. Ça m'aide à me recentrer.",
        "Mon ventre se détend légèrement. L'agitation baisse d'un cran.",
        "Je remarque la chaleur de mes mains. Ça m'ancre dans mon corps.",
        "En comptant mes souffles, les pensées ralentissent un peu.",
      ],
      bloque:
        "Essaie la respiration guidée : inspire 4 secondes, expire 6 secondes. Répète doucement. Si même ça c'est trop, pose juste une main sur ton cœur et reste là une minute. Sens le mouvement de ta respiration sous ta main. C'est suffisant.",
    },
  },
  {
    id: "conscientiser",
    number: 4,
    name: "Conscientiser",
    verb: "C",
    description:
      "",
    question:
      "Sous ce que tu ressens, qu'est-ce qui aiderait un peu ?",
    help: {
      comprendre:
        "L'émotion que tu as traversée n'est pas un accident. Elle porte un message — sur un besoin non satisfait, sur une blessure ancienne, sur quelque chose qui compte profondément pour toi. Conscientiser, c'est écouter ce message. C'est aussi l'étape où tu peux commencer à regarder tes réactions non pas comme des défauts, mais comme des mécanismes de survie qui ont eu une raison d'être. Ce que tu ressens a du sens.\nÇa protège quelque chose en toi.",
      sousQuestions: [
        "Qu'est-ce que cette émotion essaie de protéger ou d'obtenir ?",
        "Est-ce que tu as déjà ressenti quelque chose de semblable, plus tôt dans ta vie ?",
        "Y a-t-il une partie de toi qui a l'habitude de réagir comme ça pour se protéger ?",
        "Si cette émotion pouvait parler, que dirait-elle ?",
        "Où dans ton corps est-ce que cette histoire vit depuis longtemps ?",
        "Y a-t-il un lien avec ta foi, avec le sens, avec quelque chose de plus grand que toi ?",
      ],
      exemples: [
        "Cette peur d'abandon révèle mon besoin de sécurité affective — j'ai appris très tôt que les gens partent.",
        "Ma colère me dit que quelque chose d'important pour moi n'a pas été respecté.",
        "Je comprends que je porte le poids d'une attente qui n'est pas la mienne — j'ai appris à disparaître pour survivre.",
        "Il y a une partie de moi qui fait tout pour être aimée, même au prix de se perdre.",
        "Quelque chose en moi cherche la paix — pas juste l'absence de conflit, mais une paix vraie.",
      ],
      bloque:
        "Si c'est flou, reste simple.\n\nDemande-toi juste :\nqu'est-ce qui est le plus important pour moi, là, maintenant ?\n\nMême une réponse incomplète suffit.",
    },
  },
  {
    id: "emerger",
    number: 5,
    name: "Émerger",
    verb: "E",
    description:
      "",
    question:
      "À partir de là, qu'est-ce qui semble le plus juste maintenant ?",
    help: {
      comprendre:
        "L'émergence, ce n'est pas quelque chose que tu forces — c'est quelque chose qui apparaît. Après avoir traversé, reconnu, ancré et conscientisé, quelque chose se dépose. Une évidence, un soulagement, un regard différent sur toi-même ou sur la situation. Ce n'est pas toujours spectaculaire. Parfois c'est juste une phrase simple qui sonne juste. Parfois c'est un silence qui dit tout. Les deux sont valides.",
      sousQuestions: [
        "Qu'est-ce qui est plus clair qu'au début ?",
        "Est-ce qu'une phrase simple résume ce que tu comprends ?",
        "Est-ce que quelque chose s'est apaisé ou déplacé ?",
        "Qu'est-ce que tu vois différemment maintenant ?",
      ],
      exemples: [
        "Je n'ai pas besoin de l'approbation des autres pour me sentir valable.",
        "Ma fatigue n'est pas de la faiblesse — c'est un signal que je m'oublie depuis trop longtemps.",
        "J'ai le droit de poser des limites, même avec les gens que j'aime.",
        "Ce que je prenais pour de l'échec était en fait de la survie.",
        "Je commence à comprendre que je mérite d'être vu·e — pas seulement utile.",
      ],
      bloque:
        "Si rien ne vient, reste simple.\n\nCommence par :\n'Ce que je vois plus clairement, c'est que…'\n\nMême une phrase incomplète suffit.",
    },
  },
  {
    id: "aligner",
    number: 6,
    name: "Aligner",
    verb: "A",
    description:
      "",
    question:
      "Tu peux le faire comme ça… ou encore plus simple.",
    help: {
      comprendre:
        "Aligner, c'est choisir un geste — même minuscule — qui honore ce qui vient d'émerger. Juste un geste cohérent avec ta vérité. Ça peut être une conversation, une limite, un temps pour toi, ou même un acte symbolique — allumer une bougie, écrire une lettre que tu n'envoies pas, marcher en portant consciemment ce que tu viens de traverser. Ces gestes ancrent la transformation dans le corps et dans le temps.",
      sousQuestions: [
        "Quel geste simple te ferait du bien maintenant ?",
        "Est-ce que tu peux le faire tout de suite ?",
        "Qu'est-ce que tu peux commencer maintenant, même très légèrement ?",
        "Est-ce qu'un geste symbolique t'appelle ?",
      ],
      exemples: [
        "Je vais dire à mon collègue que j'ai besoin de plus de clarté dans nos échanges.",
        "Ce soir, je m'accorde 20 minutes sans écran, juste pour être avec moi.",
        "J'écris cette lettre que je repousse depuis des semaines — même si je ne l'envoie pas.",
        "Je dis non à cette invitation qui ne me ressemble pas.",
        "J'allume une bougie et je pose consciemment ce que j'ai traversé aujourd'hui.",
      ],
      bloque:
        "Si tu hésites, choisis le plus simple.\n\nMême respirer consciemment 3 fois suffit.\nMême poser une main sur toi suffit.\n\nFais quelque chose, maintenant.",
    },
  },
];
