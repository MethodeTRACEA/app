"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getApprofondiSessionEndCount, trackEvent } from "@/lib/supabase-store";

interface StepResource {
  number: number;
  letter: string;
  name: string;
  subtitle: string;
  dotColor: string;
  content: string[];
  highlightIndex?: number;
  highlightClass?: string;
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
    content: [],
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
    content: [],
    scienceToggleLabel: "Comprendre ce qui se passe",
    scienceContent: [
      "Le système nerveux autonome fonctionne en deux modes :",
      "• le système sympathique : activation, stress, survie",
      "• le système parasympathique : repos, récupération, sécurité",
      "Quand une émotion intense surgit, le sympathique prend le dessus.",
      "Respirer lentement, et surtout expirer plus longtemps, aide à réactiver le parasympathique.",
      "C'est ce qui permet au corps de redescendre.",
    ],
  },
  {
    number: 4,
    letter: "C",
    name: "Comprendre",
    subtitle: "Ce qui se passe dans ton esprit",
    dotColor: "#A89080",
    content: [],
    scienceToggleLabel: "Comprendre le fonctionnement du cerveau",
    scienceContent: [
      "Le cortex préfrontal est la partie du cerveau qui permet de comprendre, nuancer et donner du sens.",
      "Mais il ne fonctionne pleinement que lorsque le système nerveux est régulé.",
      "C'est pour cela que Comprendre vient après Ancrer.",
    ],
  },
  {
    number: 5,
    letter: "É",
    name: "Émerger",
    subtitle: "Ce qui se transforme en toi",
    dotColor: "#C4998A",
    content: [],
    scienceToggleLabel: "Pourquoi ça change ?",
    scienceContent: [
      "L'intégration émotionnelle est un processus neurologique réel.",
      "Quand une expérience difficile est traversée, nommée, régulée et mise en sens, le cerveau peut créer de nouvelles connexions.",
      "C'est ce qu'on appelle la plasticité neuronale.",
      "Une nouvelle compréhension peut alors émerger.",
      "Ce n'est pas une conclusion intellectuelle. C'est souvent une sensation physique d'abord : un souffle qui se libère, une légèreté dans les épaules, une évidence qui arrive sans forcer.",
    ],
  },
  {
    number: 6,
    letter: "A",
    name: "Aligner",
    subtitle: "Ce qui change dans ta vie",
    dotColor: "#6B3D2E",
    content: [],
    scienceToggleLabel: "Pourquoi ça transforme ?",
    scienceContent: [
      "Le cerveau change par répétition.",
      "Chaque fois que tu fais un geste aligné après une émotion, tu renforces une nouvelle voie neuronale.",
      "C'est ce qu'on appelle la neuroplasticité.",
      "Au début, ce n'est pas naturel. C'est parfois inconfortable.",
      "Mais à force de répéter, ce qui demandait un effort devient plus simple.",
      "Puis automatique.",
      "C'est comme ça que de nouveaux réflexes se construisent.",
      "Pas en comprenant une fois.",
      "Mais en pratiquant, encore et encore.",
    ],
  },
];

const pNormal = {
  fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
  fontSize: 15,
  lineHeight: 1.65,
  margin: 0,
  color: "rgba(240,230,214,0.68)",
} as const;

const blockStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(120,110,100,0.22) 0%, rgba(72,52,42,0.18) 100%)",
  border: "1px solid rgba(240,230,214,0.10)",
  borderRadius: 24,
  boxShadow: "0 24px 64px rgba(0,0,0,0.38), 0 0 48px rgba(201,123,106,0.10), inset 0 1px 0 rgba(255,255,255,0.05)",
};

const kickerStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
  fontSize: 12,
  fontWeight: 400,
  color: "#C97B6A",
  letterSpacing: "0.20em",
  textTransform: "uppercase",
  marginBottom: 18,
};

export default function RessourcesPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [scienceOpen, setScienceOpen] = useState<number | null>(null);
  const { user, hasPremiumAccess } = useAuth();
  const [sessionCount, setSessionCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    getApprofondiSessionEndCount(user.id).then(setSessionCount);
  }, [user]);

  const ctaDestination =
    hasPremiumAccess || sessionCount === 0 || sessionCount === null
      ? "/start"
      : "/app/subscribe";

  return (
    <div
      style={{
        minHeight: "calc(100svh - 56px)",
        background:
          "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
          "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%), " +
          "#1A120D",
        position: "relative",
      }}
    >
      {/* Halo V3 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: "radial-gradient(circle at 50% 18%, rgba(201,123,106,0.07) 0%, transparent 52%)",
        }}
      />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "56px 16px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            className="font-sans"
            style={{
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              color: "#C97B6A",
              marginBottom: 12,
            }}
          >
            Comprendre le protocole
          </p>
          <h1
            className="font-body"
            style={{
              fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
              fontWeight: 300,
              color: "#F5EFE6",
              lineHeight: 1.2,
              marginBottom: 28,
            }}
          >
            Ressources TRAC&Eacute;A
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            <p
              className="font-sans"
              style={{ fontSize: 15, lineHeight: 1.7, color: "#F5EFE6", margin: 0 }}
            >
              Tu ressens des choses que tu ne contr&ocirc;les pas toujours.
            </p>
            <p
              className="font-sans"
              style={{ fontSize: 15, lineHeight: 1.7, color: "#A89080", margin: 0 }}
            >
              TRAC&Eacute;A t&apos;aide &agrave; comprendre ce qui se passe,<br />
              mais surtout &agrave; le vivre autrement, dans ton corps.
            </p>
            <p
              className="font-sans"
              style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(168,144,128,0.7)", margin: 0, marginTop: 8 }}
            >
              Chaque &eacute;tape du protocole TRAC&Eacute;A s&apos;appuie sur des m&eacute;canismes neurophysiologiques r&eacute;els.
              Voici, en langage accessible, ce qui se passe dans ton corps et ton cerveau &agrave; chaque &eacute;tape,
              pour que tu comprennes non seulement <em style={{ color: "#F5EFE6", fontStyle: "italic" }}>quoi</em> faire, mais <em style={{ color: "#F5EFE6", fontStyle: "italic" }}>pourquoi</em>.
            </p>
          </div>
        </div>

        {/* Branding TRACÉA */}
        <div style={{ marginBottom: 48 }}>
          <div className="mt-12 flex items-center justify-center gap-2 sm:gap-3 whitespace-nowrap">
            {[
              { letter: "T", color: "#C9907C" },
              { letter: "R", color: "#835E54" },
              { letter: "A", color: "#8A9E7A" },
              { letter: "C", color: "#A89080" },
              { letter: "É", color: "#C4998A" },
              { letter: "A", color: "#6B3D2E" },
            ].map((item, i) => (
              <div
                key={i}
                className="font-sans flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#D99A84]/25 text-sm font-semibold tracking-[0.12em] text-[#F7EFE6] shadow-sm"
                style={{ background: item.color }}
              >
                {item.letter}
              </div>
            ))}
          </div>
          <p className="mt-5 text-center font-sans text-sm tracking-[0.08em] text-[#C8B3A8]">
            Un chemin pour revenir &agrave; toi
          </p>
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
                  ...blockStyle,
                  transition: "all 0.5s",
                  opacity: isOpen ? 1 : 0.25,
                  transform: isOpen ? "scale(1)" : "scale(0.97)",
                  pointerEvents: isOpen ? "auto" : "none",
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
                      color: "rgba(240,230,214,0.50)",
                      fontSize: 14,
                      display: "inline-block",
                      transition: "transform 0.25s ease",
                      transform: activeStep === step.number ? "rotate(90deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}
                  >
                    ›
                  </div>
                </button>

                {/* Card content */}
                {isExpanded && (
                  <div style={{ padding: "0 20px 24px" }}>
                    {/* Separator */}
                    <div
                      style={{
                        height: 1,
                        background: "rgba(240,230,214,0.05)",
                        marginBottom: 20,
                      }}
                    />

                    {/* — TRAVERSER : paragraphes dédiés — */}
                    {step.number === 1 ? (
                      <div className="space-y-5">
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Quand une &eacute;motion surgit, ton corps r&eacute;agit avant toi.
                        </p>
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Le cerveau d&eacute;clenche une alarme. Le c&oelig;ur s&apos;acc&eacute;l&egrave;re, les muscles se contractent, la respiration se raccourcit.
                        </p>
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Tout &ccedil;a en une fraction de seconde.
                        </p>
                        <p className="my-6 text-[1.15em] font-semibold leading-relaxed text-[#F0E6D6]">
                          Ce que tu ressens n&apos;est pas excessif. C&apos;est une r&eacute;action.
                        </p>
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Et quand &ccedil;a arrive, le r&eacute;flexe naturel est de fuir&nbsp;: penser &agrave; autre chose, s&apos;occuper, minimiser. Mais fuir ne fait pas dispara&icirc;tre l&apos;&eacute;motion. Elle reste, elle revient autrement.
                        </p>
                        <p className="font-sans mt-6 italic text-[#D99A84] leading-relaxed" style={{ fontSize: 15 }}>
                          Traverser, c&apos;est autre chose. C&apos;est rester l&agrave;, pr&eacute;sent, pendant que &ccedil;a passe. Pas pour souffrir davantage, mais parce que c&apos;est le seul chemin pour que &ccedil;a redescende vraiment.
                        </p>
                      </div>

                    ) : step.number === 3 ? (
                      /* — ANCRER : paragraphes dédiés — */
                      <div className="space-y-5">
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Ton corps passe en mode alerte.
                        </p>
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Tu peux l&apos;aider &agrave; redescendre.
                        </p>
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Respire lentement. Expire plus longtemps que tu n&apos;inspires. C&apos;est comme &ccedil;a que ton syst&egrave;me nerveux retrouve un signal de s&eacute;curit&eacute;.
                        </p>
                        <p className="mt-6 italic text-[#D99A84] leading-relaxed" style={{ fontSize: 15 }}>
                          Expirer plus longtemps active un signal de s&eacute;curit&eacute; dans ton corps.
                          <br /><br />
                          Ce n&apos;est pas de la relaxation.<br />
                          C&apos;est de la r&eacute;gulation.
                        </p>
                      </div>

                    ) : step.number === 4 ? (
                      /* — COMPRENDRE : paragraphes dédiés — */
                      <div className="space-y-5">
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Une fois ton corps stabilis&eacute;, tu peux commencer &agrave; comprendre.
                        </p>
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Pourquoi cette &eacute;motion&nbsp;?
                        </p>
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Qu&apos;est-ce qu&apos;elle vient toucher&nbsp;?<br />
                          Qu&apos;est-ce qu&apos;elle essaie de dire&nbsp;?
                        </p>
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Souvent, derri&egrave;re une r&eacute;action, il y a un besoin.
                        </p>
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Un besoin non respect&eacute;, non entendu ou menac&eacute;.
                        </p>
                        <p className="mt-6 italic text-[#D99A84] leading-relaxed" style={{ fontSize: 15 }}>
                          Nos sch&eacute;mas &eacute;motionnels se forment t&ocirc;t, souvent dans l&apos;enfance.
                          <br /><br />
                          Ils se r&eacute;p&egrave;tent parce qu&apos;ils ont &eacute;t&eacute; utiles &mdash; des strat&eacute;gies de survie devenues des r&eacute;flexes.
                          <br /><br />
                          Les voir clairement, sans les juger, c&apos;est d&eacute;j&agrave; commencer &agrave; s&apos;en lib&eacute;rer.
                        </p>
                      </div>

                    ) : step.number === 5 ? (
                      /* — ÉMERGER : paragraphes dédiés — */
                      <div className="space-y-5">
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          Quelque chose a peut-&ecirc;tre chang&eacute;.
                        </p>
                        <p className="font-sans leading-relaxed" style={{ ...pNormal, marginTop: 28 }}>
                          Pas forc&eacute;ment une pens&eacute;e.<br />
                          Plut&ocirc;t une sensation.
                        </p>
                        <p className="font-sans leading-relaxed" style={{ ...pNormal, marginTop: 28 }}>
                          Un peu plus d&apos;espace.<br />
                          Un souffle diff&eacute;rent.<br />
                          Une tension qui l&acirc;che.
                        </p>
                        <p className="font-sans leading-relaxed" style={{ ...pNormal, marginTop: 28 }}>
                          Tu n&apos;as rien &agrave; faire de plus.
                        </p>
                        <p className="font-sans leading-relaxed" style={{ ...pNormal, marginTop: 16 }}>
                          Juste remarquer.
                        </p>
                        <p className="mt-6 italic text-[#D99A84] leading-relaxed" style={{ fontSize: 15 }}>
                          &Eacute;merger ne se commande pas.<br />
                          &Ccedil;a se laisse venir.
                        </p>
                      </div>

                    ) : step.number === 6 ? (
                      /* — ALIGNER : paragraphes dédiés — */
                      <div className="space-y-5">
                        <p className="font-sans leading-relaxed" style={pNormal}>
                          La compr&eacute;hension seule ne suffit pas.
                        </p>
                        <p className="font-sans leading-relaxed" style={{ ...pNormal, marginTop: 28 }}>
                          Ce qui transforme, c&apos;est ce que tu fais apr&egrave;s.
                        </p>
                        <p className="font-sans leading-relaxed" style={{ ...pNormal, marginTop: 28 }}>
                          Aligner, c&apos;est choisir un geste simple,<br />
                          en lien avec ce que tu viens de traverser.
                        </p>
                        <p className="font-sans leading-relaxed" style={{ ...pNormal, marginTop: 16 }}>
                          Quelque chose de concret.<br />
                          M&ecirc;me minuscule.
                        </p>
                        <p className="font-sans leading-relaxed" style={{ ...pNormal, marginTop: 16 }}>
                          Un message.<br />
                          Un non.<br />
                          Un pas de c&ocirc;t&eacute;.<br />
                          Ou juste ne pas r&eacute;agir comme avant.
                        </p>
                        <p className="font-sans leading-relaxed" style={{ ...pNormal, marginTop: 28 }}>
                          Pas parfait.<br />
                          Pas h&eacute;ro&iuml;que.
                        </p>
                        <p className="font-sans leading-relaxed" style={{ ...pNormal, marginTop: 16 }}>
                          Juste ce qu&apos;il faut.
                        </p>
                        <p className="mt-6 italic text-[#D99A84] leading-relaxed" style={{ fontSize: 15 }}>
                          Un petit mouvement dans la bonne direction.
                        </p>
                      </div>

                    ) : (
                      /* — AUTRES ÉTAPES : renderer générique — */
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {step.content.map((paragraph, i) => {
                          const isLast = i === step.content.length - 1;
                          const isHighlight = step.highlightIndex === i;
                          return (
                            <p
                              key={i}
                              className={
                                isHighlight
                                  ? (step.highlightClass ?? "font-sans my-8 text-[1.15em] font-semibold leading-relaxed text-[#F0E6D6]")
                                  : "font-sans"
                              }
                              style={{
                                fontSize: isHighlight ? undefined : 15,
                                lineHeight: isHighlight ? undefined : 1.65,
                                margin: isHighlight ? undefined : 0,
                                whiteSpace: "pre-line",
                                color: isHighlight
                                  ? undefined
                                  : isLast
                                  ? "#D99A84"
                                  : "rgba(240,230,214,0.68)",
                                fontStyle: isHighlight ? undefined : isLast ? "italic" : "normal",
                                fontWeight: isHighlight ? undefined : isLast ? 500 : 400,
                              }}
                            >
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    )}

                    {/* Science toggle */}
                    {step.scienceToggleLabel && step.scienceContent && (
                      <div className="mt-5">
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
                            color: "rgba(240,230,214,0.45)",
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
                              background: "rgba(10,8,7,0.35)",
                              border: "1px solid rgba(240,230,214,0.06)",
                              borderRadius: 16,
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
                                  color: "rgba(240,230,214,0.52)",
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

        {/* CTA final */}
        <div style={{ marginTop: 56 }}>
          <div
            style={{
              ...blockStyle,
              padding: "36px 28px",
              textAlign: "center",
            }}
          >
            <p
              className="font-sans"
              style={{ fontSize: 13, fontWeight: 400, letterSpacing: "0.20em",
                textTransform: "uppercase", color: "#C97B6A", marginBottom: 20 }}
            >
              Passer &agrave; l&apos;exp&eacute;rience
            </p>
            <p
              className="font-sans"
              style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(245,239,230,0.75)",
                marginBottom: 10 }}
            >
              Tu comprends maintenant ce qui se passe en toi.
            </p>
            <p
              className="font-sans"
              style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(245,239,230,0.75)",
                marginBottom: 10 }}
            >
              Mais comprendre ne suffit pas &agrave; transformer.
            </p>
            <p
              className="font-sans"
              style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(245,239,230,0.75)",
                marginBottom: 24 }}
            >
              Ce qui change vraiment, c&apos;est quand tu le vis,<br />
              quand &ccedil;a t&apos;arrive,<br />
              et que tu ne fuis plus.<br />
              <br />
              TRAC&Eacute;A est con&ccedil;u pour t&apos;accompagner &agrave; ce moment-l&agrave;.<br />
              Pas apr&egrave;s.<br />
              Pas en th&eacute;orie.<br />
              Quand &ccedil;a se passe vraiment.
            </p>
            <a
              href={ctaDestination}
              onClick={() => trackEvent(user?.id ?? null, "CTA_RESSOURCES_CLICK", { destination: ctaDestination })}
              className="font-sans"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                borderRadius: 40,
                fontSize: 14,
                fontWeight: 500,
                background: "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
                color: "#1A120D",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
            >
              Commencer l&apos;exp&eacute;rience TRAC&Eacute;A
            </a>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 56, textAlign: "center" }}>
          <div
            style={{
              ...blockStyle,
              display: "inline-block",
              padding: "20px 28px",
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
