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
      "Que se passe-t-il en vous, là, maintenant ? Décrivez ce que vous ressentez sans chercher à l'expliquer.",
    help: {
      comprendre:
        "La traversée est la première étape obligatoire. Aucune clarification ni régulation n'est possible tant que l'émotion n'a pas été rencontrée telle qu'elle se présente. Il s'agit d'accueillir l'émotion brute au moment où elle surgit.",
      sousQuestions: [
        "Où sentez-vous cette émotion dans votre corps ?",
        "Si cette sensation avait une couleur, laquelle serait-ce ?",
        "À quelle intensité évaluez-vous ce que vous ressentez ?",
        "Depuis combien de temps portez-vous cela ?",
      ],
      exemples: [
        "J'ai une boule au ventre, je ne sais pas trop pourquoi.",
        "Je sens une pression dans la poitrine, comme un poids.",
        "Je suis agité, mes pensées tournent en boucle.",
      ],
      bloque:
        "Si vous ne trouvez pas les mots, commencez simplement par décrire une sensation physique. Même 'je ne sais pas ce que je ressens' est une réponse valide. L'important est de se tourner vers l'intérieur.",
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
      "Sous la surface de ce que vous ressentez, quelle est l'émotion véritable ? Quelle est l'émotion primaire ?",
    help: {
      comprendre:
        "Une émotion secondaire (colère, agacement) cache souvent une émotion primaire (peur, tristesse, honte). Reconnaître l'émotion primaire permet de retrouver la lucidité intérieure et d'accéder à la compréhension authentique.",
      sousQuestions: [
        "Est-ce que ce que vous ressentez cache autre chose en dessous ?",
        "Si vous enlevez la première couche, que reste-t-il ?",
        "Est-ce de la colère, de la tristesse, de la peur, ou de la honte ?",
        "À quel moment avez-vous déjà ressenti quelque chose de semblable ?",
      ],
      exemples: [
        "Je croyais être en colère mais en fait j'ai peur d'être abandonné.",
        "Sous mon irritation, il y a de la tristesse. Je me sens invisible.",
        "L'émotion primaire c'est la honte. Je me sens inadéquat.",
      ],
      bloque:
        "Les quatre émotions primaires principales sont : la peur, la colère, la tristesse et la joie. Parfois, la honte ou la culpabilité sont aussi présentes. Demandez-vous : si j'enlevais toutes les défenses, que resterait-il ?",
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
      "Prenez un instant pour respirer. Sentez vos pieds au sol, vos mains sur vos genoux. Décrivez votre état corporel maintenant.",
    help: {
      comprendre:
        "Sans ancrage, l'étape suivante (conscientiser) devient confuse ou impossible. L'apaisement somatique permet de rendre l'émotion travaillable et compréhensible. Le corps est un vecteur d'apaisement et un repère de sécurité interne.",
      sousQuestions: [
        "Pouvez-vous sentir vos pieds au sol ?",
        "En respirant lentement (4s inspiré, 6s expiré), que remarquez-vous ?",
        "Y a-t-il un endroit de votre corps qui est calme et stable ?",
        "Que se passe-t-il dans votre corps quand vous ralentissez ?",
      ],
      exemples: [
        "En respirant, la pression dans ma poitrine diminue un peu.",
        "Je sens mes pieds, le sol est solide. Ça m'aide à me recentrer.",
        "Mon ventre se détend légèrement. L'agitation baisse.",
      ],
      bloque:
        "Essayez la respiration 4/6 : inspirez par le nez pendant 4 secondes, expirez par la bouche pendant 6 secondes. Répétez 3 fois. Puis décrivez simplement ce qui a changé dans votre corps.",
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
      "Maintenant que vous êtes plus stable, que comprenez-vous de cette émotion ? Que révèle-t-elle sur ce qui est important pour vous ?",
    help: {
      comprendre:
        "La conscientisation transforme l'émotion en information intérieure. Elle permet de voir ce qui a été touché, qu'il s'agisse d'un besoin, d'une valeur ou d'une blessure, et de distinguer la réaction du besoin véritable.",
      sousQuestions: [
        "Quel besoin non satisfait cette émotion révèle-t-elle ?",
        "Quelle valeur profonde a été touchée ?",
        "Que vous dit cette émotion sur ce qui compte vraiment pour vous ?",
        "Y a-t-il un schéma qui se répète dans votre vie ?",
      ],
      exemples: [
        "Cette peur d'abandon révèle mon besoin de sécurité affective.",
        "Ma colère me dit que ma valeur de respect a été franchie.",
        "Je comprends que je porte le poids d'une attente qui n'est pas la mienne.",
      ],
      bloque:
        "Demandez-vous simplement : si cette émotion pouvait parler, que dirait-elle ? Quel message essaie-t-elle de me transmettre ? Qu'est-ce qui est vraiment important ici ?",
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
      "Après ce parcours intérieur, quelle vérité émerge ? Que savez-vous maintenant que vous ne voyiez pas clairement avant ?",
    help: {
      comprendre:
        "L'émergence n'est pas une fabrication mentale\u00A0: elle se produit lorsque l'émotion a été traversée, reconnue, ancrée et conscientisée. C'est un changement intérieur réel, une nouvelle compréhension de soi.",
      sousQuestions: [
        "Qu'est-ce qui est devenu plus clair ?",
        "Quelle phrase résume ce que vous comprenez maintenant ?",
        "Si vous deviez retenir une seule chose de cette session, ce serait quoi ?",
        "Que diriez-vous à quelqu'un qui vit la même chose ?",
      ],
      exemples: [
        "Je n'ai pas besoin de l'approbation des autres pour me sentir valable.",
        "Ma fatigue n'est pas de la faiblesse, c'est un signal que je m'oublie.",
        "J'ai le droit de poser des limites, même avec les gens que j'aime.",
      ],
      bloque:
        "Ne cherchez pas une vérité parfaite. C'est souvent une phrase simple, évidente, qui vous touche quand vous la formulez. Si rien ne vient, écrivez : 'Ce que je sais maintenant, c'est que...' et laissez la suite venir.",
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
      "Quelle action concrète, même petite, allez-vous poser pour honorer cette vérité ? Que changez-vous dès aujourd'hui ?",
    help: {
      comprendre:
        "Sans alignement, le processus reste théorique. L'action finalise la transformation et permet l'évolution durable. Il ne s'agit pas d'un grand bouleversement, mais d'un geste cohérent avec ce qui a émergé.",
      sousQuestions: [
        "Quel est le plus petit pas que vous pouvez faire dès maintenant ?",
        "Y a-t-il une conversation à avoir, une décision à prendre ?",
        "Qu'allez-vous arrêter de faire ? Commencer à faire ?",
        "Comment allez-vous vous rappeler cette vérité demain ?",
      ],
      exemples: [
        "Je vais dire à mon collègue que j'ai besoin de plus de clarté dans nos échanges.",
        "Je m'accorde 15 minutes de silence chaque matin, sans écran.",
        "Je vais écrire cette lettre que je repousse depuis des semaines.",
      ],
      bloque:
        "L'action n'a pas besoin d'être spectaculaire. 'Je vais prendre 5 minutes pour moi ce soir' est un alignement valide. L'important est que l'action soit en lien avec la vérité qui a émergé.",
    },
  },
];
