import { StepDefinition } from "./types";

export const STEPS: StepDefinition[] = [
  {
    id: "traverser",
    number: 1,
    name: "Traverser",
    verb: "T",
    description:
      "Reste juste avec ce qui est là, sans chercher à changer quoi que ce soit.",
    question:
      "Qu'est-ce qui est le plus présent en toi, là, maintenant ?",
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
      "Approche doucement ce qu'il y a dessous.",
    question:
      "Sous ce que tu ressens…\n\nest-ce qu'il y a quelque chose de plus sensible ?",
    help: {
      comprendre:
        "Ce qu'on ressent en premier n'est pas toujours le plus profond.\n\nParfois, en dessous, il y a quelque chose de plus fragile ou de plus sensible.\n\nReconnaître, ici, c'est juste l'approcher.",
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
        "Si rien ne vient, ne force pas.\n\nDemande-toi juste :\nest-ce qu'en dessous, c'est plutôt triste, inquiet, fatigué… ou autre chose ?\n\nMême \"je ne sais pas encore\" est déjà une vraie réponse.",
    },
  },
  {
    id: "ancrer",
    number: 3,
    name: "Ancrer",
    verb: "A",
    description:
      "Stabiliser le système nerveux, revenir dans le corps, réduire la charge émotionnelle. L'ancrage est une étape somatique essentielle.",
    question:
      "Et maintenant dans ton corps…\nest-ce que c'est :\n– un peu plus calme\n– toujours pareil\n– ou différent autrement ?",
    help: {
      comprendre:
        "Quand une émotion forte est présente, le corps entre dans un état d'alerte — le souffle se raccourcit, les muscles se contractent, la pensée s'emballe. Ancrer, c'est revenir dans le corps pour lui dire : tu es en sécurité maintenant. Pas en niant ce qui se passe — en créant assez de stabilité pour que la suite soit possible. Le guide de respiration est là pour t'aider. Utilise-le.",
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
        "Essaie la respiration guidée : inspire 4 secondes, expire 6 secondes. Répète trois fois. Si même ça c'est trop, pose juste une main sur ton cœur et reste là une minute. Sens le mouvement de ta respiration sous ta main. C'est suffisant.",
    },
  },
  {
    id: "conscientiser",
    number: 4,
    name: "Conscientiser",
    verb: "C",
    description:
      "Éclairer le message profond de l'émotion, relier l'expérience du moment à ce qu'elle révèle. Comprendre ce qui se joue réellement.",
    question:
      "Avec ce que tu ressens là… ton corps aurait plutôt besoin de ralentir, d'être soutenu, de se relâcher… ou d'autre chose ?",
    help: {
      comprendre:
        "L'émotion que tu as traversée n'est pas un accident. Elle porte un message — sur un besoin non satisfait, sur une blessure ancienne, sur quelque chose qui compte profondément pour toi. Conscientiser, c'est écouter ce message. C'est aussi l'étape où tu peux commencer à regarder tes réactions non pas comme des défauts, mais comme des mécanismes de survie qui ont eu une raison d'être. Ce que tu portes avait du sens. Il protège quelque chose.",
      sousQuestions: [
        "Quel besoin cette émotion révèle-t-elle — besoin de sécurité, d'amour, de reconnaissance, de liberté ?",
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
        "Demande-toi simplement : si cette émotion était une enfant en moi, que vivrait-elle ? De quoi aurait-elle besoin ? Parfois, nommer la partie blessée suffit à commencer à comprendre. Tu n'as pas besoin de tout expliquer — une seule phrase juste vaut mieux qu'un long raisonnement.",
    },
  },
  {
    id: "emerger",
    number: 5,
    name: "Émerger",
    verb: "E",
    description:
      "Laisser apparaître une nouvelle vérité intérieure issue du processus. Ce qui est juste, clair et aligné après le travail émotionnel.",
    question:
      "Avec ce que tu ressens maintenant… Qu'est-ce que tu sens émerger maintenant, même si c'est encore léger ou fragile ?",
    help: {
      comprendre:
        "L'émergence n'est pas quelque chose que tu fabriques — c'est quelque chose que tu laisses venir. Après avoir traversé, reconnu, ancré et conscientisé, quelque chose se dépose. Une évidence, un soulagement, un regard différent sur toi-même ou sur la situation. Ce n'est pas toujours spectaculaire. Parfois c'est juste une phrase simple qui sonne juste. Parfois c'est un silence qui dit tout. Les deux sont valides.",
      sousQuestions: [
        "Qu'est-ce qui est devenu plus clair après cette traversée ?",
        "Est-ce qu'il y a une phrase qui résume ce que tu comprends maintenant ?",
        "Est-ce que quelque chose s'est allégé, même légèrement ?",
        "Qu'est-ce que tu voudrais te dire à toi-même après ce parcours ?",
        "Si tu regardes la situation depuis maintenant, qu'est-ce que tu vois différemment ?",
      ],
      exemples: [
        "Je n'ai pas besoin de l'approbation des autres pour me sentir valable.",
        "Ma fatigue n'est pas de la faiblesse — c'est un signal que je m'oublie depuis trop longtemps.",
        "J'ai le droit de poser des limites, même avec les gens que j'aime.",
        "Ce que je prenais pour de l'échec était en fait de la survie.",
        "Je commence à comprendre que je mérite d'être vu·e — pas seulement utile.",
      ],
      bloque:
        "Ne cherche pas une vérité parfaite ou profonde. C'est souvent une phrase simple, qui te touche quand tu la formules. Si rien ne vient, essaie cette amorce : 'Ce que je sais maintenant, c'est que...' et laisse venir ce qui vient, sans le juger. Le vide aussi peut être une émergence — il dit que quelque chose s'est posé.",
    },
  },
  {
    id: "aligner",
    number: 6,
    name: "Aligner",
    verb: "A",
    description:
      "Mettre en actes concrets la vérité intérieure émergée. L'alignement est l'intégration dans la matière, la cohérence retrouvée.",
    question:
      "Avec ce que tu ressens maintenant…\nquel est le plus petit geste que tu peux faire tout de suite ?",
    help: {
      comprendre:
        "Aligner, c'est choisir un geste — même minuscule — qui honore ce qui vient d'émerger. Pas une transformation héroïque. Pas une résolution de tout changer. Juste un geste cohérent avec ta vérité. Ça peut être une conversation, une limite, un temps pour toi, ou même un acte symbolique — allumer une bougie, écrire une lettre que tu n'envoies pas, marcher en portant consciemment ce que tu viens de traverser. Ces gestes ancrent la transformation dans le corps et dans le temps.",
      sousQuestions: [
        "Quel est le plus petit geste que tu peux poser dès aujourd'hui ?",
        "Y a-t-il quelque chose que tu dois arrêter de faire pour honorer cette vérité ?",
        "Y a-t-il quelque chose que tu dois commencer à faire, même tout doucement ?",
        "Est-ce qu'il y a une conversation à avoir, une limite à poser, une décision à honorer ?",
        "Est-ce qu'un geste symbolique te parle — quelque chose qui ancre ça dans ton corps ?",
      ],
      exemples: [
        "Je vais dire à mon collègue que j'ai besoin de plus de clarté dans nos échanges.",
        "Ce soir, je m'accorde 20 minutes sans écran, juste pour être avec moi.",
        "J'écris cette lettre que je repousse depuis des semaines — même si je ne l'envoie pas.",
        "Je dis non à cette invitation qui ne me ressemble pas.",
        "J'allume une bougie et je pose consciemment ce que j'ai traversé aujourd'hui.",
      ],
      bloque:
        "L'action n'a pas besoin d'être visible ou spectaculaire. 'Je vais prendre 5 minutes pour moi ce soir' est un alignement valide. 'Je vais remarquer quand je m'oublie' aussi. L'important, c'est que le geste soit en lien avec ce qui a émergé — pas avec ce que tu penses devoir faire.",
    },
  },
];
