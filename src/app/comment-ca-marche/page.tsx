"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SafetyResources } from "@/components/SafetyResources";

// ── Styles V3 ────────────────────────────────────────────────────────────────

const blockStyle: CSSProperties = {
  background: "rgba(111,106,100,0.18)",
  border: "1px solid rgba(240,230,214,0.10)",
  borderRadius: 24,
  padding: "28px 26px",
  boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const usageCardStyle: CSSProperties = {
  background: "rgba(26,18,13,0.35)",
  border: "1px solid rgba(240,230,214,0.07)",
  borderRadius: 18,
  padding: 18,
};

const pNormal: CSSProperties = {
  fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
  fontSize: 15,
  fontWeight: 300,
  lineHeight: 1.65,
  color: "rgba(240,230,214,0.68)",
  margin: 0,
};

const kickerText: CSSProperties = {
  fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
  fontSize: 12,
  fontWeight: 400,
  letterSpacing: "0.20em",
  textTransform: "uppercase",
  color: "#C97B6A",
  margin: 0,
  marginBottom: 18,
};

const listStyle: CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

// ── Styles dédiés au bloc méthode ────────────────────────────────────────────

const stepLetterStyle: CSSProperties = {
  fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
  fontSize: "1.75rem",
  fontWeight: 400,
  color: "#F0E6D6",
  lineHeight: 1,
  letterSpacing: "0.02em",
};

const stepNameStyle: CSSProperties = {
  fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
  fontSize: 14,
  fontWeight: 500,
  color: "#C97B6A",
  letterSpacing: "0.04em",
};

const stepTextStyle: CSSProperties = {
  fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
  fontSize: "1.05rem",
  fontWeight: 300,
  lineHeight: 1.55,
  color: "rgba(240,230,214,0.78)",
  margin: 0,
  whiteSpace: "pre-line",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CommentCaMarchePage() {
  const methodRef = useRef<HTMLDivElement | null>(null);
  const [methodVisible, setMethodVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReducedMotion(true);
      setMethodVisible(true);
      return;
    }
    const el = methodRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMethodVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const sensations = [
    "ça serre dans ta poitrine",
    "ton souffle se coupe",
    "tes pensées tournent en boucle",
  ];

  const steps: { letter: string; name: string; text: string }[] = [
    {
      letter: "T",
      name: "Traverser",
      text: "Tu restes face à ce qui est là, sans fuir.\nC'est le point de départ.\nPas une performance.",
    },
    {
      letter: "R",
      name: "Reconnaître",
      text: "Tu nommes ce que tu ressens.\nL'émotion, la sensation, l'intensité. Sans te juger.",
    },
    {
      letter: "A",
      name: "Ancrer",
      text: "Tu reviens au corps avec un geste court.\nUtilisable partout, même en 30 secondes.",
    },
    {
      letter: "C",
      name: "Comprendre",
      text: "Tu vois un peu mieux ce qui se passe.\nPas une analyse.\nJuste un peu de clarté sur ce qui a déclenché ça.",
    },
    {
      letter: "E",
      name: "Émerger",
      text: "Tu identifies ce dont tu as besoin dans ce moment.\nQuelque chose de concret, pas une solution complète.",
    },
    {
      letter: "A",
      name: "Aligner",
      text: "Tu choisis un micro-geste, le plus petit possible,\ncohérent avec ce que tu viens de traverser.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
          "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%), " +
          "#1A120D",
        position: "relative",
      }}
    >
      {/* Halo léger */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 18%, rgba(201,123,106,0.14) 0%, transparent 58%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 640,
          margin: "0 auto",
          padding: "64px 20px 72px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ── Titre ── */}
        <h1
          className="font-body"
          style={{
            fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
            fontWeight: 300,
            color: "#F0E6D6",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            marginBottom: 0,
          }}
        >
          Comment fonctionne TRAC&Eacute;A
        </h1>

        {/* ── Sous-texte ── */}
        <p
          className="font-sans"
          style={{
            fontSize: "1rem",
            fontWeight: 300,
            color: "rgba(240,230,214,0.60)",
            lineHeight: 1.6,
            marginTop: -4,
          }}
        >
          6 &eacute;tapes. Pour ne pas &ecirc;tre emport&eacute;.
        </p>

        {/* ── Bloc 1 — Sensations ── */}
        <div style={blockStyle}>
          <p style={pNormal}>
            Quand &ccedil;a monte dans ton corps, tu le sens tout de suite.
          </p>
          <ul style={{ ...listStyle, marginTop: 16 }}>
            {sensations.map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    color: "#C97B6A",
                    fontSize: 14,
                    lineHeight: 1.65,
                    flexShrink: 0,
                  }}
                >
                  ·
                </span>
                <span style={pNormal}>{item}</span>
              </li>
            ))}
          </ul>
          <p style={{ ...pNormal, marginTop: 16 }}>
            C&apos;est l&agrave; que tout se joue.
          </p>
        </div>

        {/* ── Bloc 2 — Bascule ── */}
        <div style={blockStyle}>
          <p
            className="font-body"
            style={{
              fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
              fontSize: "1.1rem",
              fontWeight: 400,
              color: "#F0E6D6",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Tu n&apos;as pas besoin de comprendre.
          </p>
          <p style={{ ...pNormal, marginTop: 14 }}>
            Quand &ccedil;a d&eacute;borde, r&eacute;fl&eacute;chir ne suffit plus.
            <br />
            Le corps sait quoi faire.
          </p>
        </div>

        {/* ── Bloc Méthode T·R·A·C·E·A ── */}
        <div ref={methodRef} style={blockStyle}>
          <p style={kickerText}>La m&eacute;thode</p>
          <p
            className="font-body"
            style={{
              fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
              fontSize: "1.1rem",
              fontWeight: 400,
              color: "#F0E6D6",
              lineHeight: 1.4,
              margin: 0,
              marginBottom: 24,
            }}
          >
            La m&eacute;thode T&middot;R&middot;A&middot;C&middot;E&middot;A structure chaque travers&eacute;e.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  paddingBottom: i < steps.length - 1 ? 22 : 0,
                  borderBottom:
                    i < steps.length - 1
                      ? "1px solid rgba(240,230,214,0.06)"
                      : "none",
                  opacity: reducedMotion ? 1 : methodVisible ? 1 : 0,
                  transform: reducedMotion
                    ? "none"
                    : methodVisible
                    ? "translateY(0)"
                    : "translateY(12px)",
                  transitionProperty: reducedMotion ? "none" : "opacity, transform",
                  transitionDuration: reducedMotion ? "0ms" : "500ms",
                  transitionTimingFunction: "ease-out",
                  transitionDelay: reducedMotion ? "0ms" : `${i * 80}ms`,
                  willChange: reducedMotion ? "auto" : "opacity, transform",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <span style={stepLetterStyle}>{step.letter}</span>
                  <span style={{ color: "rgba(240,230,214,0.40)" }}>·</span>
                  <span style={stepNameStyle}>{step.name}</span>
                </div>
                <p style={stepTextStyle}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bloc usages ── */}
        <div style={blockStyle}>
          <p style={kickerText}>Tu peux l&apos;utiliser de plusieurs fa&ccedil;ons</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Usage 1 — Urgence */}
            <div style={usageCardStyle}>
              <p
                className="font-sans"
                style={{ fontSize: 14, fontWeight: 500, color: "#F0E6D6", margin: 0, marginBottom: 6, lineHeight: 1.4 }}
              >
                Urgence
              </p>
              <p
                className="font-sans"
                style={{ fontSize: 13, color: "rgba(240,230,214,0.55)", margin: 0, marginBottom: 14, lineHeight: 1.55 }}
              >
                sans r&eacute;fl&eacute;chir
              </p>
              <Link
                href="/app/urgence"
                className="font-sans"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#C97B6A",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid rgba(201,123,106,0.30)",
                  paddingBottom: 1,
                }}
              >
                M&apos;aider maintenant &rsaquo;
              </Link>
            </div>

            {/* Usage 2 — Traversée */}
            <div style={usageCardStyle}>
              <p
                className="font-sans"
                style={{ fontSize: 14, fontWeight: 500, color: "#F0E6D6", margin: 0, marginBottom: 6, lineHeight: 1.4 }}
              >
                Parcours guid&eacute;
              </p>
              <p
                className="font-sans"
                style={{ fontSize: 13, color: "rgba(240,230,214,0.55)", margin: 0, marginBottom: 14, lineHeight: 1.55 }}
              >
                &eacute;tape par &eacute;tape
              </p>
              <Link
                href="/app"
                className="font-sans"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#C97B6A",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid rgba(201,123,106,0.30)",
                  paddingBottom: 1,
                }}
              >
                Faire une travers&eacute;e &rsaquo;
              </Link>
            </div>

            {/* Usage 3 — Entraînement */}
            <div style={usageCardStyle}>
              <p
                className="font-sans"
                style={{ fontSize: 14, fontWeight: 500, color: "#F0E6D6", margin: 0, marginBottom: 6, lineHeight: 1.4 }}
              >
                Aller plus loin
              </p>
              <p
                className="font-sans"
                style={{ fontSize: 13, color: "rgba(240,230,214,0.55)", margin: 0, marginBottom: 14, lineHeight: 1.55 }}
              >
                &agrave; ton rythme
              </p>
              <Link
                href="/app/entrainement"
                className="font-sans"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#C97B6A",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid rgba(201,123,106,0.30)",
                  paddingBottom: 1,
                }}
              >
                M&apos;entra&icirc;ner &rsaquo;
              </Link>
            </div>

          </div>
        </div>

        {/* ── Disclaimer (texte simple) ── */}
        <div style={{ padding: "4px 4px" }}>
          <p style={pNormal}>
            TRAC&Eacute;A peut t&apos;aider quand &ccedil;a monte fort.
          </p>
          <p style={{ ...pNormal, marginTop: 8 }}>
            Mais ce n&apos;est pas un outil pour les situations de d&eacute;tresse grave ou d&apos;urgence m&eacute;dicale.
          </p>
          <p style={{ ...pNormal, marginTop: 8 }}>
            Si tu es en danger, contacte les services adapt&eacute;s.
          </p>
        </div>

        {/* ── Bloc sécurité (composant unifié) ── */}
        <SafetyResources />

        {/* ── Tension ── */}
        <p
          className="font-sans"
          style={{
            textAlign: "center",
            fontSize: 14,
            fontWeight: 300,
            color: "rgba(240,230,214,0.50)",
            lineHeight: 1.6,
            marginTop: 8,
          }}
        >
          Quand &ccedil;a monte, tu n&apos;as pas le temps de r&eacute;fl&eacute;chir.
        </p>

        {/* ── CTA ── */}
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link
            href="/app"
            className="font-sans"
            style={{
              display: "inline-block",
              padding: "16px 40px",
              borderRadius: 40,
              fontSize: 16,
              fontWeight: 600,
              background:
                "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
              color: "#1A120D",
              textDecoration: "none",
              boxShadow:
                "0 8px 32px rgba(201,144,124,0.18), 0 2px 8px rgba(0,0,0,0.15), 0 0 40px rgba(200,120,90,0.35)",
            }}
          >
            Commencer ma travers&eacute;e
          </Link>
          <p
            className="font-sans"
            style={{
              fontSize: 13,
              color: "rgba(240,230,214,0.40)",
              marginTop: 12,
              fontWeight: 300,
            }}
          >
            2 minutes. Sans r&eacute;fl&eacute;chir.
          </p>
        </div>
      </div>
    </div>
  );
}
