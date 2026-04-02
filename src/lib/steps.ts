import { StepDefinition } from "./types";

export const STEPS: StepDefinition[] = [
  {
    id: "traverser",
    number: 1,
    name: "Traverser",
    verb: "T",
    description:
      "Entrer en contact direct avec ce qui se vit intérieurement, sans fuir, sans analyser, sans chercher à apaiser immédiatement.",
    question:
      "Qu'est-ce qui est là, maintenant ?",
    help: {
      comprendre:
        "Traverser ne veut pas dire comprendre, ni résoudre. Ça veut dire rester là, avec ce qui est présent, sans le fuir et sans le forcer à partir. L'émotion que tu portes en ce moment a quelque chose à te dire — mais elle ne peut le dire que si tu acceptes de la regarder en face, même une seconde. C'est ça, traverser.",
      sousQuestions: [
        "Où est-ce que tu sens quelque chose dans ton corps en ce moment — ventre, poitrine, gorge, épaules ?",
        "Si tu devais donner une forme ou une couleur à ce que tu ressens, ce serait quoi ?",
        "Est-ce que c'est lourd, serré, vide, agité, engourdi ?",
        "Depuis combien de temps tu portes ça ?",
        "Est-ce qu'il y a quelque chose que tu évites de regarder là-dedans ?",
      ],
      exemples: [
        "J'ai une boule au ventre depuis ce matin, je sais pas vraiment pourquoi.",
        "Je sens une pression dans la poitrine, comme si quelque chose pesait.",
        "Je suis agitée, mes pensées tournent en boucle et je n'arrive pas à me poser.",
        "Il y a comme un vide. Pas de larmes, pas de mots. Juste un vide.",
        "Je me sens à fleur de peau. La moindre chose me touche trop fort.",
      ],
      bloque:
        "Si les mots ne viennent pas, commence par le corps. Pose une main sur ton ventre ou ta poitrine. Sens ce qui se passe là, maintenant. Même 'je ne sais pas ce que je ressens' est une vraie réponse — écris-le. Le simple fait de se tourner vers l'intérieur, c'est déjà traverser.",
    },
  },
  {
    id: "reconnaitre",
    number: 2,
    name: "Reconnaître",
    verb: "R",
    description:
      "Identifier l'émotion réelle, la nommer. Distinguer l'émotion primaire de l'émotion secondaire ou des réactions défensives.",
    question:
      "Sous ce que tu ressens là… est-ce qu'il y a autre chose aussi :\n– de la tristesse\n– de la peur\n– de la fatigue\n– ou autre chose ?",
    help: {
      comprendre:
        "Ce qu'on ressent en premier — la colère, l'agitation, le contrôle, l'irritation — est souvent une couche de protection. En dessous, il y a quelque chose de plus tendre, de plus vulnérable : une peur, une tristesse, une honte, un besoin d'amour. Reconnaître, c'est descendre sous la première couche pour toucher ce qui est vraiment là. Ce n'est pas toujours confortable — mais c'est là que se trouve la vérité.",
      sousQuestions: [
        "Est-ce que ce que tu ressens en surface cache autre chose en dessous ?",
        "Si tu enlèves la colère ou l'agitation, qu'est-ce qui reste ?",
        "Est-ce que tu as peur de quelque chose ? Peur de quoi exactement ?",
        "Est-ce qu'il y a de la tristesse là-dedans, même cachée ?",
        "Est-ce qu'une partie de toi se sent seule, incomprise, ou indigne ?",
      ],
      exemples: [
        "Je croyais être en colère mais en fait j'ai peur d'être abandonné·e.",
        "Sous mon irritation, il y a de la tristesse. Je me sens invisible.",
        "Je contrôle tout parce que j'ai peur que si je lâche, tout s'effondre.",
        "L'émotion primaire c'est la honte. Je me sens de trop.",
        "En dessous de la fatigue, il y a un chagrin que je n'ai jamais vraiment accueilli.",
      ],
      bloque:
        "Les émotions primaires les plus courantes sont : la peur, la tristesse, la colère profonde, la honte, et le besoin d'amour ou de connexion. Pose-toi cette question simple : si j'enlevais toutes mes défenses, si je n'avais plus besoin de me protéger, qu'est-ce que je ressentirais vraiment ?",
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
