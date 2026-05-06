"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SafetyResources } from "@/components/SafetyResources";

export default function LandingPage() {
  const finalCtaRef = useRef<HTMLDivElement | null>(null);
  const [finalCtaVisible, setFinalCtaVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setFinalCtaVisible(true);
      return;
    }
    const el = finalCtaRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFinalCtaVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const traceaSteps: { letter: string; name: string; text: string }[] = [
    { letter: "T", name: "Traverser",   text: "Tu restes là, sans fuir." },
    { letter: "R", name: "Reconnaître", text: "Tu nommes ce que tu ressens." },
    { letter: "A", name: "Ancrer",      text: "Tu reviens au corps." },
    { letter: "C", name: "Comprendre",  text: "Tu vois un peu mieux ce qui se passe." },
    { letter: "E", name: "Émerger",     text: "Tu identifies ce dont tu as besoin." },
    { letter: "A", name: "Aligner",     text: "Tu choisis un geste simple." },
  ];

  const faqs: { q: string; a: string }[] = [
    {
      q: "Quelle est la différence avec une appli de méditation ?",
      a: "Une appli de méditation t'aide à gérer le stress sur le long terme, souvent via une pratique régulière. TRACEA est conçu pour un moment précis : quand ça déborde déjà. Tu n'as pas besoin de t'asseoir, de fermer les yeux ou d'avoir 20 minutes. Tu l'ouvres quand tu es en plein dedans.",
    },
    {
      q: "Est-ce que c'est de la thérapie ?",
      a: "Non. TRACEA n'est pas un outil thérapeutique et ne remplace pas un suivi psychologique. C'est un appui pour traverser un moment intense. Pas une analyse, pas un traitement. Si tu traverses des difficultés importantes, un professionnel de santé reste la bonne ressource.",
    },
    {
      q: "Combien ça coûte ?",
      a: "L'essai est gratuit pendant 7 jours, sans carte bancaire. Tu peux faire jusqu'à 5 traversées approfondies pendant cette période. Ensuite, TRACEA est à 9€/mois, sans engagement, résiliable à tout moment.",
    },
    {
      q: "Est-ce que ça marche quand je suis vraiment submergée ?",
      a: "C'est pour ça qu'il a été conçu. TRACEA part du corps, pas de la tête, ce qui le rend utilisable même quand tu n'arrives plus à réfléchir. Les exercices sont courts et guidés. Certaines personnes remarquent que quelque chose change. D'autres moins. Dans tous les cas, tu as quelque chose à faire dans le moment.",
    },
    {
      q: "Est-ce que mes données sont protégées ?",
      a: "Oui. Ce que tu traverses dans l'app reste confidentiel. Nous ne vendons pas tes données. Tu peux consulter notre politique de confidentialité pour les détails.",
    },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#1A120D" }}
    >
      {/* Background gradients V3 */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
            "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%)",
        }}
      />

      {/* Halo V3 */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(201,123,106,0.28) 0%, rgba(201,123,106,0) 75%)",
          zIndex: 0,
        }}
      />

      {/* ════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] md:min-h-[95vh] flex items-center justify-center px-6 py-10 md:py-28" style={{ zIndex: 1 }}>
        <div className="relative z-10 w-full text-center" style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Logo */}
          <div className="mb-4 md:mb-14">
            <img
              src="/images/tracea-logo-terra-transparent.png"
              alt="TRACÉA"
              className="mx-auto object-contain"
              style={{ height: "clamp(72px, 10vw, 88px)" }}
            />
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5 md:mb-12"
            style={{
              background: "rgba(111,106,100,0.16)",
              border: "1px solid rgba(240,230,214,0.12)",
            }}
          >
            <span
              className="text-[13px] tracking-wide"
              style={{ color: "rgba(240,230,214,0.62)" }}
            >
              Essai gratuit 7 jours · sans carte bancaire
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-[30px] md:text-[40px] leading-[1.25] tracking-tight mb-4 md:mb-6" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            Quand ça te submerge,
            <br />
            tu fais quoi ?
          </h1>

          {/* Sous-titre */}
          <div
            className="mx-auto mb-6 md:mb-12"
            style={{
              maxWidth: 360,
              marginTop: 28,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              textAlign: "center",
            }}
          >
            {/* Symptômes */}
            <p
              style={{
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                fontSize: "clamp(1.02rem, 4vw, 1.18rem)",
                lineHeight: 1.65,
                fontWeight: 300,
                color: "rgba(240,230,214,0.52)",
                margin: 0,
              }}
            >
              Poitrine serr&eacute;e.<br />
              Souffle court.<br />
              Pens&eacute;es en boucle.
            </p>

            {/* Phrase centrale */}
            <p
              style={{
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                fontSize: "clamp(1.22rem, 4.8vw, 1.42rem)",
                lineHeight: 1.35,
                fontWeight: 500,
                color: "#F0E6D6",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              TRAC&Eacute;A te donne un point d&apos;appui.
            </p>

            {/* Promesse */}
            <p
              style={{
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                fontSize: "clamp(1.02rem, 4vw, 1.16rem)",
                lineHeight: 1.45,
                fontWeight: 400,
                color: "rgba(240,230,214,0.66)",
                margin: 0,
              }}
            >
              En quelques minutes.
            </p>

            {/* Différenciateur */}
            <p
              style={{
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                fontSize: "clamp(0.98rem, 3.8vw, 1.08rem)",
                lineHeight: 1.55,
                fontWeight: 300,
                color: "rgba(240,230,214,0.46)",
                margin: 0,
              }}
            >
              Sans r&eacute;fl&eacute;chir &agrave; l&apos;infini.<br />
              Sans tourner en boucle.
            </p>
          </div>

          {/* CTA principal */}
          <Link
            href="/start"
            className="font-sans inline-block w-full sm:w-auto text-center text-base md:text-lg px-8"
            style={{
              background: "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
              color: "#1A120D",
              borderRadius: 40,
              padding: "16px 40px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 8px 32px rgba(201,144,124,0.18), 0 2px 8px rgba(0,0,0,0.15), 0 0 40px rgba(200,120,90,0.35)",
            }}
          >
            Commencer gratuitement
          </Link>

          {/* CTA secondaire */}
          <div className="mt-4 md:mt-5">
            <Link
              href="/comment-ca-marche"
              className="text-sm transition-colors underline underline-offset-4"
              style={{ color: "rgba(201,123,106,0.60)", textDecorationColor: "rgba(201,123,106,0.20)" }}
            >
              Voir comment &ccedil;a marche
            </Link>
          </div>

          {/* Micro-texte */}
          <p className="text-[13px] mt-5 md:mt-8 tracking-wide" style={{ color: "rgba(240,230,214,0.35)" }}>
            7 jours gratuits · puis 9€/mois · sans engagement
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          IDENTIFICATION
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-14 md:py-18" style={{ zIndex: 1 }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            background: "rgba(111,106,100,0.18)",
            border: "1px solid rgba(240,230,214,0.10)",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <h2 className="text-[24px] md:text-[30px] tracking-tight mb-8 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            Tu connais ce moment pr&eacute;cis
          </h2>

          <div className="space-y-4 mb-8">
            {[
              "Ça serre dans ta poitrine",
              "Ton souffle se coupe",
              "Tu as des pensées qui tournent en boucle",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <span
                  style={{
                    display: "inline-block",
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: "#C97B6A",
                    opacity: 0.85,
                    flexShrink: 0,
                    marginTop: 10,
                  }}
                />
                <p className="text-base leading-relaxed" style={{ color: "rgba(240,230,214,0.68)" }}>
                  {item}
                </p>
              </div>
            ))}
          </div>

          <p className="text-base font-medium text-center" style={{ color: "#D99A84", fontStyle: "italic" }}>
            C&apos;est l&agrave; que tout se joue.
          </p>
          <p className="text-base text-center mt-4" style={{ color: "rgba(240,230,214,0.50)" }}>
            Et &ccedil;a peut durer longtemps.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          BASCULE
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-6 md:py-10" style={{ zIndex: 1 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: "rgba(240,230,214,0.70)", fontWeight: 300 }}>
            Tu n&apos;as pas besoin de comprendre.
          </p>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: "rgba(240,230,214,0.50)", fontWeight: 300 }}>
            Quand &ccedil;a d&eacute;borde, r&eacute;fl&eacute;chir ne suffit plus.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FONCTIONNEMENT — 6 étapes T·R·A·C·E·A
      ════════════════════════════════════════════════════════════ */}
      <section id="fonctionnement" className="relative px-6 py-14 md:py-18 scroll-mt-8" style={{ zIndex: 1 }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            background: "rgba(111,106,100,0.18)",
            border: "1px solid rgba(240,230,214,0.10)",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <h2 className="text-[24px] md:text-[30px] tracking-tight mb-6 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            La m&eacute;thode T&middot;R&middot;A&middot;C&middot;E&middot;A en 2 minutes
          </h2>

          <p className="text-base text-center mb-8" style={{ color: "rgba(240,230,214,0.50)", fontWeight: 300 }}>
            6 &eacute;tapes. Dans l&apos;ordre. Pour ne pas &ecirc;tre emport&eacute;e.
          </p>

          <div className="flex flex-col gap-5 mb-8">
            {traceaSteps.map((step, i) => (
              <div
                key={i}
                style={{
                  paddingBottom: i < traceaSteps.length - 1 ? 18 : 0,
                  borderBottom:
                    i < traceaSteps.length - 1
                      ? "1px solid rgba(240,230,214,0.06)"
                      : "none",
                }}
              >
                <div
                  className="flex items-baseline gap-2 mb-2"
                  style={{ color: "#C97B6A" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
                      fontSize: "1.5rem",
                      fontWeight: 400,
                      letterSpacing: "0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {step.letter}
                  </span>
                  <span style={{ color: "rgba(201,123,106,0.55)" }}>·</span>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {step.name}
                  </span>
                </div>
                <p
                  style={{
                    color: "rgba(240,230,214,0.68)",
                    fontSize: 15,
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-1 mt-2">
            <p style={{ color: "rgba(240,230,214,0.42)", fontWeight: 300, fontSize: "1rem", lineHeight: 1.6 }}>
              &Agrave; la fin&hellip;
            </p>
            <p style={{ color: "rgba(240,230,214,0.56)", fontWeight: 300, fontSize: "1rem", lineHeight: 1.6 }}>
              quelque chose se pose.
            </p>
            <p style={{ color: "#D99A84", fontStyle: "italic", fontWeight: 600, fontSize: "1rem", lineHeight: 1.6 }}>
              C&apos;est suffisant pour maintenant.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CAS D'USAGE
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-14 md:py-18" style={{ zIndex: 1 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              background: "rgba(111,106,100,0.18)",
              border: "1px solid rgba(240,230,214,0.10)",
              borderRadius: 24,
              padding: "32px 28px",
              boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <h2 className="text-[22px] md:text-[28px] tracking-tight mb-8 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
              Utilise TRAC&Eacute;A quand &ccedil;a monte
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "après un message qui te déclenche",
                "quand ton corps est trop tendu",
                "quand ça tourne sans arrêt",
                "quand tu sens que tu vas exploser",
                "quand tu es saturée",
                "avant une discussion difficile",
              ].map((text, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 16,
                    background: "rgba(26,18,13,0.35)",
                    border: "1px solid rgba(240,230,214,0.07)",
                  }}
                >
                  <p style={{ fontSize: 14, color: "rgba(240,230,214,0.65)", lineHeight: 1.55 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          IMPACT
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 pt-14 pb-6 md:pt-18 md:pb-6" style={{ zIndex: 1 }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            background: "rgba(111,106,100,0.18)",
            border: "1px solid rgba(240,230,214,0.10)",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <h2 className="text-[24px] md:text-[30px] tracking-tight mb-6 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            En quelques minutes
          </h2>

          <p className="text-base text-center mb-6" style={{ color: "rgba(240,230,214,0.50)", fontWeight: 300 }}>
            Ce que certains remarquent&nbsp;:
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              "Quelque chose relâche, parfois.",
              "La respiration change un peu.",
              "Un peu de clarté, peut-être.",
              "Un geste devient possible.",
            ].map((text, i) => (
              <div
                key={i}
                style={{
                  minHeight: 72,
                  padding: "14px 12px",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(26,18,13,0.35)",
                  border: "1px solid rgba(240,230,214,0.07)",
                }}
              >
                <p style={{ fontSize: 14, color: "rgba(240,230,214,0.72)", lineHeight: 1.35, textAlign: "center", margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm font-medium" style={{ color: "#D99A84", fontStyle: "italic" }}>
            C&apos;est d&eacute;j&agrave; suffisant.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-14 md:py-18" style={{ zIndex: 1 }}>
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            background: "rgba(111,106,100,0.18)",
            border: "1px solid rgba(240,230,214,0.10)",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
            textAlign: "center",
          }}
        >
          <h2 className="text-[24px] md:text-[30px] tracking-tight mb-8" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            Pour commencer
          </h2>

          <div className="flex flex-col gap-3 mb-8">
            <p style={{ color: "#F0E6D6", fontWeight: 500, fontSize: "1.05rem", lineHeight: 1.5, margin: 0 }}>
              Essai gratuit 7 jours
            </p>
            <p style={{ color: "rgba(240,230,214,0.66)", fontWeight: 300, fontSize: "0.98rem", lineHeight: 1.5, margin: 0 }}>
              5 travers&eacute;es approfondies incluses
            </p>
            <p style={{ color: "rgba(240,230,214,0.66)", fontWeight: 300, fontSize: "0.98rem", lineHeight: 1.5, margin: 0 }}>
              Sans carte bancaire
            </p>
          </div>

          <div
            aria-hidden="true"
            style={{
              height: 1,
              background: "rgba(240,230,214,0.10)",
              margin: "0 auto 24px",
              maxWidth: 200,
            }}
          />

          <div className="flex flex-col gap-2 mb-8">
            <p style={{ color: "#F0E6D6", fontWeight: 500, fontSize: "1.05rem", lineHeight: 1.5, margin: 0 }}>
              9€ / mois. Sans engagement.
            </p>
            <p style={{ color: "rgba(240,230,214,0.55)", fontWeight: 300, fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
              R&eacute;siliable &agrave; tout moment.
            </p>
          </div>

          <Link
            href="/start"
            className="font-sans inline-block w-full sm:w-auto text-center text-base"
            style={{
              background: "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
              color: "#1A120D",
              borderRadius: 40,
              padding: "14px 32px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 8px 32px rgba(201,144,124,0.18), 0 2px 8px rgba(0,0,0,0.15), 0 0 40px rgba(200,120,90,0.30)",
            }}
          >
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-14 md:py-18" style={{ zIndex: 1 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 className="text-[24px] md:text-[30px] tracking-tight mb-8 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            Questions fr&eacute;quentes
          </h2>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group"
                style={{
                  background: "rgba(111,106,100,0.18)",
                  border: "1px solid rgba(240,230,214,0.10)",
                  borderRadius: 16,
                  padding: "18px 22px",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              >
                <summary
                  className="cursor-pointer flex items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden"
                  style={{
                    color: "#F0E6D6",
                    fontWeight: 500,
                    fontSize: "1rem",
                    lineHeight: 1.45,
                  }}
                >
                  <span>{faq.q}</span>
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-open:rotate-180"
                    style={{
                      color: "#C97B6A",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    ▾
                  </span>
                </summary>
                <p
                  style={{
                    marginTop: 14,
                    color: "rgba(240,230,214,0.66)",
                    fontWeight: 300,
                    fontSize: "0.96rem",
                    lineHeight: 1.65,
                  }}
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 pt-4 pb-10" style={{ zIndex: 1 }}>
        <div
          ref={finalCtaRef}
          className={`mx-auto flex max-w-[640px] flex-col items-center text-center transition-all duration-700 ease-out ${
            finalCtaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h2 className="text-[26px] md:text-[32px] tracking-tight" style={{ fontWeight: 300, color: "#F0E6D6", marginBottom: 24 }}>
            Essaye maintenant
          </h2>

          <p className="text-base" style={{ color: "rgba(240,230,214,0.60)", marginBottom: 32 }}>
            Juste 2 minutes.
            <br />
            Juste voir.
          </p>

          <Link
            href="/start"
            className="font-sans inline-block w-full sm:w-auto text-center text-base md:text-lg"
            style={{
              background: "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
              color: "#1A120D",
              borderRadius: 40,
              padding: "16px 40px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 8px 32px rgba(201,144,124,0.18), 0 2px 8px rgba(0,0,0,0.15), 0 0 40px rgba(200,120,90,0.35)",
              marginBottom: 20,
            }}
          >
            Commencer gratuitement
          </Link>

          <p className="text-[13px] tracking-wide" style={{ color: "rgba(240,230,214,0.35)" }}>
            7 jours gratuits · sans carte bancaire
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SAFETY RESOURCES (avant footer, discret)
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 pb-10" style={{ zIndex: 1 }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <SafetyResources />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════ */}
      <footer className="relative px-6 py-10" style={{ borderTop: "1px solid rgba(240,230,214,0.06)", zIndex: 1 }}>
        <div className="flex flex-col items-center gap-5" style={{ maxWidth: 640, margin: "0 auto" }}>
          <img
            src="/images/tracea-logo-terra-transparent.png"
            alt="TRACÉA"
            className="h-7 object-contain"
            style={{ opacity: 0.4 }}
          />
          <div className="flex flex-wrap justify-center gap-5 text-[12px]" style={{ color: "rgba(240,230,214,0.35)" }}>
            <Link href="/mentions-legales" className="transition-colors" style={{ color: "rgba(240,230,214,0.35)" }}>
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="transition-colors" style={{ color: "rgba(240,230,214,0.35)" }}>
              Politique de confidentialité
            </Link>
            <Link href="/conditions-utilisation" className="transition-colors" style={{ color: "rgba(240,230,214,0.35)" }}>
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
