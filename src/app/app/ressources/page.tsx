"use client";

import { useState } from "react";

interface StepResource {
  number: number;
  letter: string;
  name: string;
  subtitle: string;
  dotColor: string;
  content: string[];
  highlightIndex?: number;
  scienceToggleLabel?: string;
  scienceContent?: string[];
}

const steps: StepResource[] = [
  {
    number: 1,
    letter: "T",
    name: "Traverser",
    subtitle: "Ce qui se passe dans ton corps",
    dotColor: "#C9907C",
    content: [
      "Quand une émotion surgit, ton corps réagit avant toi.\n\nLe cerveau déclenche une alarme.\nLe cœur s'accélère, les muscles se contractent,\nla respiration se raccourcit.\n\nTout ça en une fraction de seconde.\n\nCe que tu ressens n'est pas excessif.\nC'est une réaction.",
      "Et quand ça arrive, le réflexe naturel est de fuir :\npenser à autre chose, s'occuper, minimiser.\n\nMais fuir ne fait pas disparaître l'émotion.\nElle reste, elle revient autrement.",
      "Traverser, c'est autre chose.\n\nC'est rester là, présent, pendant que ça passe.\n\nPas pour souffrir davantage,\nmais parce que c'est le seul chemin pour que ça redescende vraiment.",
    ],
    scienceToggleLabel: "Pourquoi ça fait ça ?",
    scienceContent: [
      "Quand une émotion surgit, l'amygdale peut déclencher une réponse d'alerte très rapide.",
      "Le corps libère alors des hormones de stress, comme l'adrénaline et le cortisol. Le rythme cardiaque augmente, les muscles se préparent à agir, et la respiration devient plus courte.",
      "Ce mécanisme est utile : il sert à protéger.",
      "Mais quand l'alerte se déclenche dans une situation relationnelle, mentale ou émotionnelle, le corps peut réagir comme s'il y avait un danger immédiat.",
      "TRACÉA commence par Traverser parce qu'on ne peut pas apaiser durablement ce qu'on fuit systématiquement.",
    ],
  },
  {
    number: 2,
    letter: "R",
    name: "Reconnaître",
    subtitle: "Ce qui se passe dans ton corps",
    dotColor: "#835E54",
    content: [
      "Le cerveau possède deux voies de traitement émotionnel. La voie rapide, instinctive et automatique, réagit avant même que tu aies le temps de penser. La voie lente, portée par le cortex préfrontal, analyse, nuance, donne du sens.",
      "Reconnaître une émotion, c'est activer cette deuxième voie.",
      "Des recherches ont montré que nommer une émotion, simplement lui donner un mot, réduit son intensité dans le corps. C'est ce qu'on appelle l'affect labeling. Dire « j'ai peur » diminue l'activation de l'amygdale. Pas parce que la peur disparaît, mais parce que le cerveau passe du mode survie au mode compréhension.",
      "La colère protège souvent une peur.\nL'irritation cache parfois une tristesse.\n\nReconnaître la couche de dessous,\nc'est accéder à la vérité.",
    ],
    highlightIndex: 1,
  },
  {
    number: 3,
    letter: "A",
    name: "Ancrer",
    subtitle: "Ce qui se passe dans ton corps",
    dotColor: "#8A9E7A",
    content: [
      "Le système nerveux autonome régule tout ce que tu ne contrôles pas consciemment : ton rythme cardiaque, ta digestion, ta respiration. Il fonctionne en deux modes : le système sympathique (activation, stress, survie) et le système parasympathique (repos, récupération, sécurité).",
      "Quand une émotion intense surgit, le sympathique prend le dessus. Ancrer le corps, c'est réactiver le parasympathique. La respiration est le seul pont conscient entre ces deux systèmes.",
      "Expirer plus longtemps que tu n'inspires, comme dans le guide 4/6 secondes, active le nerf vague, qui envoie un signal de sécurité à tout le corps. Ce n'est pas de la relaxation. C'est de la régulation neurologique.",
    ],
  },
  {
    number: 4,
    letter: "C",
    name: "Comprendre",
    subtitle: "Ce qui se passe dans ton esprit",
    dotColor: "#A89080",
    content: [
      "Le cortex préfrontal, la partie la plus évoluée du cerveau, est le siège de la compréhension, du sens, de la mise en perspective. Mais il ne fonctionne bien que quand le système nerveux est suffisamment régulé. C'est pourquoi Comprendre vient après Ancrer, pas avant.",
      "Une fois le corps stabilisé, tu peux remonter le fil : pourquoi cette émotion ? Que te raconte-t-elle de tes besoins profonds ?",
      "Nos schémas émotionnels se forment tôt, souvent dans l'enfance. Ils se répètent parce qu'ils ont été utiles — des stratégies de survie devenues des réflexes. Les voir clairement, sans les juger, c'est déjà commencer à s'en libérer.",
    ],
  },
  {
    number: 5,
    letter: "É",
    name: "Émerger",
    subtitle: "Ce qui se transforme en toi",
    dotColor: "#C4998A",
    content: [
      "L'intégration émotionnelle est un processus neurologique réel. Quand une expérience difficile est traversée, nommée, régulée et mise en sens, le cerveau crée de nouvelles connexions, ce qu'on appelle la plasticité neuronale.",
      "Une nouvelle compréhension émerge. Ce n'est pas une conclusion intellectuelle. C'est souvent une sensation physique d'abord, un souffle qui se libère, une légèreté dans les épaules, une évidence qui arrive sans forcer.",
      "Émerger ne se commande pas. Ça se laisse venir. L'invitation de cette étape est simple : rester à l'écoute de ce qui change, sans l'anticiper.",
    ],
  },
  {
    number: 6,
    letter: "A",
    name: "Aligner",
    subtitle: "Ce qui change dans ta vie",
    dotColor: "#6B3D2E",
    content: [
      "La compréhension seule ne suffit pas à transformer. Le cerveau apprend par l'action répétée. Chaque micro-décision alignée avec ta vérité intérieure crée une nouvelle voie neuronale. Au fil du temps, ces nouvelles voies deviennent des réflexes, des façons d'être plutôt que des efforts conscients.",
      "Aligner, c'est donc choisir un geste concret, aussi petit soit-il, qui honore ce que tu viens de traverser. Pas une résolution héroïque. Juste une direction.",
      "Un pas dans le sens de qui tu deviens.",
    ],
  },
];

export default function RessourcesPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [scienceOpen, setScienceOpen] = useState<number | null>(null);

  return (
    <div
      style={{
        minHeight: "100%",
        background: `
          radial-gradient(ellipse 70% 50% at 25% 15%, rgba(201,144,124,0.06) 0%, transparent 65%),
          radial-gradient(ellipse 60% 40% at 75% 70%, rgba(131,94,84,0.04) 0%, transparent 60%),
          #1C1410
        `,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 16px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            className="font-sans"
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#C9907C",
              marginBottom: 12,
            }}
          >
            Comprendre le protocole
          </p>
          <h1
            className="font-body"
            style={{
              fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
              fontWeight: 500,
              color: "#F5EFE6",
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            Ressources TRAC&Eacute;A
          </h1>
          <p
            className="font-sans"
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "#A89080",
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            Chaque &eacute;tape du protocole TRAC&Eacute;A s&apos;appuie sur des m&eacute;canismes
            neurophysiologiques r&eacute;els. Voici, en langage accessible, ce qui se passe
            dans ton corps et ton cerveau &agrave; chaque &eacute;tape, pour que tu comprennes
            non seulement <em style={{ color: "#F5EFE6", fontStyle: "italic" }}>quoi</em> faire, mais <em style={{ color: "#F5EFE6", fontStyle: "italic" }}>pourquoi</em>.
          </p>
        </div>

        {/* Step navigation pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
            marginBottom: 48,
          }}
        >
          {steps.map((step) => {
            const isActive = activeStep === step.number;
            return (
              <button
                key={step.number}
                onClick={() =>
                  setActiveStep(activeStep === step.number ? null : step.number)
                }
                className="font-sans"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  borderRadius: 40,
                  fontSize: 13,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  background: isActive ? step.dotColor : "#251A14",
                  color: isActive ? "#1C1410" : "#A89080",
                  boxShadow: isActive
                    ? "0 4px 16px rgba(0,0,0,0.25)"
                    : "none",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    background: isActive
                      ? "rgba(28,20,16,0.25)"
                      : "rgba(201,144,124,0.15)",
                    color: isActive ? "#1C1410" : "#C9907C",
                    transition: "all 0.3s",
                  }}
                >
                  {step.letter}
                </span>
                {step.name}
              </button>
            );
          })}
        </div>

        {/* Step cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {steps.map((step) => {
            const isOpen = activeStep === null || activeStep === step.number;
            const isExpanded = activeStep === step.number || activeStep === null;
            const isScienceOpen = scienceOpen === step.number;
            return (
              <div
                key={step.number}
                id={`step-${step.number}`}
                style={{
                  borderRadius: 20,
                  transition: "all 0.5s",
                  opacity: isOpen ? 1 : 0.25,
                  transform: isOpen ? "scale(1)" : "scale(0.97)",
                  pointerEvents: isOpen ? "auto" : "none",
                  background: "#2E1F17",
                  border: "1px solid rgba(61,42,34,0.6)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
                }}
              >
                {/* Card header */}
                <button
                  onClick={() =>
                    setActiveStep(activeStep === step.number ? null : step.number)
                  }
                  style={{
                    width: "100%",
                    padding: "20px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="font-body"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 500,
                      flexShrink: 0,
                      background: step.dotColor,
                      color: "#1C1410",
                      transition: "all 0.3s",
                    }}
                  >
                    {step.number}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                      className="font-body"
                      style={{
                        fontSize: 20,
                        fontWeight: 500,
                        color: "#F5EFE6",
                        lineHeight: 1.3,
                        margin: 0,
                      }}
                    >
                      {step.name}
                    </h2>
                    <p
                      className="font-sans"
                      style={{
                        fontSize: 13,
                        color: "#A89080",
                        opacity: 0.7,
                        marginTop: 3,
                        lineHeight: 1.4,
                      }}
                    >
                      {step.subtitle}
                    </p>
                  </div>
                  <div
                    style={{
                      color: "rgba(168,144,128,0.5)",
                      fontSize: 16,
                      transition: "transform 0.3s",
                      transform: activeStep === step.number ? "rotate(180deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}
                  >
                    &#9662;
                  </div>
                </button>

                {/* Card content — NO max-height, NO overflow-hidden that clips */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "0 20px 24px",
                    }}
                  >
                    {/* Separator */}
                    <div
                      style={{
                        height: 1,
                        background: "rgba(61,42,34,0.5)",
                        marginBottom: 20,
                      }}
                    />

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {step.content.map((paragraph, i) => {
                        const isLast = i === step.content.length - 1;
                        const isHighlight = step.highlightIndex === i;
                        return (
                          <p
                            key={i}
                            className={
                              isHighlight
                                ? "font-sans my-8 text-[1.15em] font-semibold leading-relaxed text-[#F3E6D7]"
                                : "font-sans"
                            }
                            style={{
                              fontSize: isHighlight ? undefined : 15,
                              lineHeight: isHighlight ? undefined : 1.8,
                              margin: isHighlight ? undefined : 0,
                              whiteSpace: "pre-line",
                              color: isHighlight
                                ? undefined
                                : isLast
                                ? "#C9907C"
                                : "rgba(245,239,230,0.75)",
                              fontStyle: isHighlight ? undefined : isLast ? "italic" : "normal",
                              fontWeight: isHighlight ? undefined : isLast ? 500 : 400,
                            }}
                          >
                            {paragraph}
                          </p>
                        );
                      })}
                    </div>

                    {/* Science toggle */}
                    {step.scienceToggleLabel && step.scienceContent && (
                      <div style={{ marginTop: 20 }}>
                        <button
                          onClick={() =>
                            setScienceOpen(isScienceOpen ? null : step.number)
                          }
                          className="font-sans"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px 0",
                            fontSize: 13,
                            color: "rgba(168,144,128,0.6)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "color 0.2s",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              transition: "transform 0.2s",
                              display: "inline-block",
                              transform: isScienceOpen ? "rotate(90deg)" : "rotate(0deg)",
                            }}
                          >
                            &#9654;
                          </span>
                          {step.scienceToggleLabel}
                        </button>

                        {isScienceOpen && (
                          <div
                            style={{
                              marginTop: 12,
                              padding: "16px 18px",
                              borderRadius: 12,
                              background: "rgba(28,20,16,0.5)",
                              border: "1px solid rgba(61,42,34,0.4)",
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            {step.scienceContent.map((para, i) => (
                              <p
                                key={i}
                                className="font-sans"
                                style={{
                                  fontSize: 13,
                                  lineHeight: 1.7,
                                  margin: 0,
                                  color: "rgba(168,144,128,0.7)",
                                }}
                              >
                                {para}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 56, textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "20px 28px",
              borderRadius: 20,
              background: "#251A14",
              border: "1px solid rgba(61,42,34,0.5)",
            }}
          >
            <p
              className="font-sans"
              style={{
                fontSize: 13,
                color: "#A89080",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Ces contenus s&apos;appuient sur les neurosciences affectives et la
              recherche en r&eacute;gulation &eacute;motionnelle.
              <br />
              <span style={{ fontStyle: "italic", marginTop: 4, display: "inline-block" }}>
                TRAC&Eacute;A n&apos;est pas un outil th&eacute;rapeutique, c&apos;est un
                entra&icirc;nement &agrave; la stabilit&eacute; int&eacute;rieure.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
