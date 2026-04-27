"use client";

import { useState, useEffect } from "react";
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
  fontSize: 15,
  lineHeight: 1.8,
  margin: 0,
  color: "rgba(245,239,230,0.75)",
} as const;

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
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {["T", "R", "A", "C", "É", "A"].map((letter, i) => (
              <div
                key={i}
                className="font-body"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#C9907C",
                  color: "#1C1410",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {letter}
              </div>
            ))}
          </div>
          <p
            className="font-sans"
            style={{
              fontSize: 13,
              color: "rgba(168,144,128,0.6)",
              letterSpacing: "0.05em",
              margin: 0,
            }}
          >
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

                {/* Card content */}
                {isExpanded && (
                  <div style={{ padding: "0 20px 24px" }}>
                    {/* Separator */}
                    <div
                      style={{
                        height: 1,
                        background: "rgba(61,42,34,0.5)",
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
                        <p className="my-6 text-[1.15em] font-semibold leading-relaxed text-[#F3E6D7]">
                          Ce que tu ressens n&apos;est pas excessif. C&apos;est une r&eacute;action.
                        </p>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
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
                                  ? (step.highlightClass ?? "font-sans my-8 text-[1.15em] font-semibold leading-relaxed text-[#F3E6D7]")
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

        {/* CTA final */}
        <div style={{ marginTop: 56 }}>
          <div
            style={{
              borderRadius: 20,
              padding: "36px 28px",
              background: "#2E1F17",
              border: "1px solid rgba(61,42,34,0.6)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
              textAlign: "center",
            }}
          >
            <p
              className="font-sans"
              style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "#C9907C", marginBottom: 20 }}
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
                background: "#C9907C",
                color: "#1C1410",
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
