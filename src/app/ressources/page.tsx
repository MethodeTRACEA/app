"use client";

import { useState } from "react";

interface StepResource {
  number: number;
  letter: string;
  name: string;
  subtitle: string;
  accentColor: string;
  bgGradient: string;
  dotColor: string;
  content: string[];
}

const steps: StepResource[] = [
  {
    number: 1,
    letter: "T",
    name: "Traverser",
    subtitle: "Ce qui se passe dans ton corps",
    accentColor: "text-terra-dark",
    bgGradient: "from-terra-light/40 to-terra-light/10",
    dotColor: "bg-terra",
    content: [
      "Quand une émotion surgit, ton cerveau déclenche une réaction en chaîne\u00A0: l'amygdale, ce petit noyau au centre du cerveau, envoie un signal d'alarme. Le cortisol et l'adrénaline inondent le corps. Le cœur s'accélère, les muscles se contractent, la respiration se raccourcit. Tout ça en moins d'une seconde.",
      "La tentation naturelle est de fuir cette vague, de penser à autre chose, de s'occuper, de minimiser. Mais fuir une émotion ne la dissout pas. Elle s'enkystera, trouvera d'autres chemins.",
      "Traverser, c'est accepter de rester là, présent, pendant que la vague passe. Pas pour souffrir davantage, mais parce que c'est le seul chemin vers l'autre rive.",
    ],
  },
  {
    number: 2,
    letter: "R",
    name: "Reconnaître",
    subtitle: "Ce qui se passe dans ton corps",
    accentColor: "text-terra-dark",
    bgGradient: "from-[#F5EDE8] to-[#FAF7F2]",
    dotColor: "bg-terra/70",
    content: [
      "Le cerveau possède deux voies de traitement émotionnel. La voie rapide, instinctive et automatique, réagit avant même que tu aies le temps de penser. La voie lente, portée par le cortex préfrontal, analyse, nuance, donne du sens.",
      "Reconnaître une émotion, c'est activer cette deuxième voie. Des recherches ont montré que nommer une émotion, simplement lui donner un mot, réduit son intensité dans le corps. C'est ce qu'on appelle l'affect labeling. Dire « j'ai peur » diminue l'activation de l'amygdale. Pas parce que la peur disparaît, mais parce que le cerveau passe du mode survie au mode compréhension.",
      "La distinction entre émotion primaire et secondaire est cruciale\u00A0: la colère protège souvent une peur. L'irritation cache parfois une tristesse profonde. Reconnaître la couche de dessous, c'est accéder à la vérité.",
    ],
  },
  {
    number: 3,
    letter: "A",
    name: "Ancrer",
    subtitle: "Ce qui se passe dans ton corps",
    accentColor: "text-sage-dark",
    bgGradient: "from-sage/15 to-sage/5",
    dotColor: "bg-sage",
    content: [
      "Le système nerveux autonome régule tout ce que tu ne contrôles pas consciemment\u00A0: ton rythme cardiaque, ta digestion, ta respiration. Il fonctionne en deux modes\u00A0: le système sympathique (activation, stress, survie) et le système parasympathique (repos, récupération, sécurité).",
      "Quand une émotion intense surgit, le sympathique prend le dessus. Ancrer le corps, c'est réactiver le parasympathique. La respiration est le seul pont conscient entre ces deux systèmes.",
      "Expirer plus longtemps que tu n'inspires, comme dans le guide 4/6 secondes, active le nerf vague, qui envoie un signal de sécurité à tout le corps. Ce n'est pas de la relaxation. C'est de la régulation neurologique.",
    ],
  },
  {
    number: 4,
    letter: "C",
    name: "Conscientiser",
    subtitle: "Ce qui se passe dans ton corps",
    accentColor: "text-espresso",
    bgGradient: "from-beige/80 to-beige/30",
    dotColor: "bg-espresso/60",
    content: [
      "Le cortex préfrontal, la partie la plus évoluée du cerveau, est le siège de la compréhension, du sens, de la mise en perspective. Mais il ne fonctionne bien que quand le système nerveux est suffisamment régulé. C'est pourquoi Conscientiser vient après Ancrer, pas avant.",
      "Une fois le corps stabilisé, on peut remonter le fil\u00A0: pourquoi cette émotion\u00A0? Que raconte-t-elle de mes besoins profonds\u00A0?",
      "Nos schémas émotionnels se forment tôt, souvent dans l'enfance. Ils se répètent parce qu'ils ont été utiles, des stratégies de survie devenues des réflexes. Les conscientiser, c'est les voir sans les juger. Et voir quelque chose clairement, c'est déjà commencer à s'en libérer.",
    ],
  },
  {
    number: 5,
    letter: "É",
    name: "Émerger",
    subtitle: "Ce qui se passe dans ton corps",
    accentColor: "text-dusty-dark",
    bgGradient: "from-dusty/15 to-dusty/5",
    dotColor: "bg-dusty",
    content: [
      "L'intégration émotionnelle est un processus neurologique réel. Quand une expérience difficile est traversée, nommée, régulée et mise en sens, le cerveau crée de nouvelles connexions, ce qu'on appelle la plasticité neuronale.",
      "Une nouvelle compréhension émerge. Ce n'est pas une conclusion intellectuelle. C'est souvent une sensation physique d'abord, un souffle qui se libère, une légèreté dans les épaules, une évidence qui arrive sans forcer.",
      "Émerger ne se commande pas. Ça se laisse venir. L'invitation de cette étape est simple\u00A0: rester à l'écoute de ce qui change, sans l'anticiper.",
    ],
  },
  {
    number: 6,
    letter: "A",
    name: "Aligner",
    subtitle: "Ce qui se passe dans ton corps",
    accentColor: "text-terra-dark",
    bgGradient: "from-terra-light/30 to-terra-light/10",
    dotColor: "bg-terra-dark",
    content: [
      "La compréhension seule ne suffit pas à transformer. Le cerveau apprend par l'action répétée. Chaque micro-décision alignée avec ta vérité intérieure crée une nouvelle voie neuronale. Au fil du temps, ces nouvelles voies deviennent des réflexes, des façons d'être plutôt que des efforts conscients.",
      "Aligner, c'est donc choisir un geste concret, aussi petit soit-il, qui honore ce que tu viens de traverser. Pas une résolution héroïque. Juste une direction.",
      "Un pas dans le sens de qui tu deviens.",
    ],
  },
];

export default function RessourcesPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="section-label">Comprendre le protocole</p>
        <h1 className="font-serif text-3xl md:text-4xl text-espresso mb-4">
          Ressources TRACÉA
        </h1>
        <p className="font-body text-warm-gray text-base leading-relaxed max-w-2xl mx-auto">
          Chaque étape du protocole TRACÉA s&apos;appuie sur des mécanismes
          neurophysiologiques réels. Voici, en langage accessible, ce qui se passe
          dans ton corps et ton cerveau à chaque étape, pour que tu comprennes
          non seulement <em className="text-espresso">quoi</em> faire, mais <em className="text-espresso">pourquoi</em>.
        </p>
      </div>

      {/* Step navigation pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {steps.map((step) => (
          <button
            key={step.number}
            onClick={() =>
              setActiveStep(activeStep === step.number ? null : step.number)
            }
            className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              activeStep === step.number
                ? "bg-terra text-cream shadow-lg scale-105"
                : "bg-beige/80 text-espresso hover:bg-terra-light hover:text-terra-dark hover:shadow-md"
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                activeStep === step.number
                  ? "bg-cream/30 text-cream"
                  : "bg-white text-terra"
              }`}
            >
              {step.letter}
            </span>
            {step.name}
          </button>
        ))}
      </div>

      {/* Step cards */}
      <div className="space-y-8">
        {steps.map((step) => {
          const isOpen = activeStep === null || activeStep === step.number;
          return (
            <div
              key={step.number}
              id={`step-${step.number}`}
              className={`rounded-[22px] overflow-hidden transition-all duration-500 shadow-sm hover:shadow-md ${
                isOpen
                  ? "opacity-100"
                  : "opacity-30 scale-[0.97] pointer-events-none"
              }`}
            >
              {/* Card with gradient background */}
              <div className={`bg-gradient-to-br ${step.bgGradient} border border-white/60`}
                style={{ borderRadius: "22px" }}
              >
                {/* Card header */}
                <button
                  onClick={() =>
                    setActiveStep(activeStep === step.number ? null : step.number)
                  }
                  className="w-full px-8 md:px-10 py-7 flex items-center gap-6 text-left group"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center font-serif text-2xl flex-shrink-0 transition-all duration-300 ${
                      activeStep === step.number
                        ? "bg-terra text-cream shadow-lg rotate-0"
                        : "bg-white/80 text-terra shadow-sm"
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h2
                      className={`font-serif text-2xl md:text-[1.65rem] ${step.accentColor} transition-colors`}
                    >
                      {step.name}
                    </h2>
                    <p className="text-sm text-warm-gray mt-1 font-body">
                      {step.subtitle}
                    </p>
                  </div>
                  <div
                    className={`text-warm-gray/60 transition-transform duration-300 text-lg ${
                      activeStep === step.number ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </div>
                </button>

                {/* Card content */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    activeStep === step.number || activeStep === null
                      ? "max-h-[800px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-8 md:px-10 pb-9 pt-0">
                    <div className="ml-[88px] space-y-5">
                      {step.content.map((paragraph, i) => (
                        <p
                          key={i}
                          className={`font-body text-[15px] leading-[1.8] ${
                            i === step.content.length - 1
                              ? `${step.accentColor} font-medium italic text-base`
                              : "text-espresso/80"
                          }`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-14 text-center">
        <div className="inline-block px-8 py-5 rounded-[22px] bg-beige/40 border border-beige-dark/50">
          <p className="font-body text-sm text-warm-gray leading-relaxed">
            Ces contenus s&apos;appuient sur les neurosciences affectives et la
            recherche en régulation émotionnelle.
            <br />
            <span className="italic mt-1 inline-block">
              TRACÉA n&apos;est pas un outil thérapeutique, c&apos;est un
              entraînement à la stabilité intérieure.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
