"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

// ── Styles V3 ────────────────────────────────────────────────────────────────

const blockStyle: CSSProperties = {
  background: "rgba(111,106,100,0.18)",
  border: "1px solid rgba(240,230,214,0.10)",
  borderRadius: 24,
  padding: "28px 26px",
  boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const warningBlockStyle: CSSProperties = {
  background: "rgba(111,106,100,0.18)",
  border: "1px solid rgba(240,230,214,0.14)",
  borderRadius: 24,
  padding: "24px 26px",
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

const olStyle: CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  counterReset: "step-counter",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CommentCaMarchePage() {
  const steps = [
    "Tu poses ce qui est là",
    "Tu reviens à ton corps",
    "Tu ralentis",
    "Tu vois plus clair",
    "Tu choisis un geste simple",
  ];

  const sensations = [
    "ça serre dans ta poitrine",
    "ton souffle se coupe",
    "tes pensées tournent en boucle",
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
          padding: "64px 20px 88px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
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
            marginTop: -8,
          }}
        >
          Un protocole simple pour redescendre quand &ccedil;a monte.
          <br />
          Sans analyser. En revenant au corps.
        </p>

        {/* ── Bloc 1 ── */}
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
                  —
                </span>
                <span style={pNormal}>{item}</span>
              </li>
            ))}
          </ul>
          <p style={{ ...pNormal, marginTop: 16 }}>
            C&apos;est l&agrave; que tout se joue.
          </p>
        </div>

        {/* ── Bloc 2 ── */}
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
            Il faut redescendre.
          </p>
        </div>

        {/* ── Bloc 3 ── */}
        <div style={blockStyle}>
          <p style={kickerText}>En 2 &agrave; 5 minutes&nbsp;:</p>
          <ol style={olStyle}>
            {steps.map((step, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
                    fontSize: 15,
                    color: "#C97B6A",
                    lineHeight: 1.65,
                    minWidth: 18,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}.
                </span>
                <span style={pNormal}>{step}</span>
              </li>
            ))}
          </ol>
          <p
            style={{
              ...pNormal,
              marginTop: 20,
              fontStyle: "italic",
              color: "#D99A84",
            }}
          >
            Et quelque chose change.
          </p>
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
                Quand &ccedil;a monte d&apos;un coup
              </p>
              <p
                className="font-sans"
                style={{ fontSize: 13, color: "rgba(240,230,214,0.55)", margin: 0, marginBottom: 14, lineHeight: 1.55 }}
              >
                Un acc&egrave;s rapide pour redescendre sans r&eacute;fl&eacute;chir.
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
                Quand tu veux faire une travers&eacute;e compl&egrave;te
              </p>
              <p
                className="font-sans"
                style={{ fontSize: 13, color: "rgba(240,230,214,0.55)", margin: 0, marginBottom: 14, lineHeight: 1.55 }}
              >
                Le parcours guid&eacute; &eacute;tape par &eacute;tape.
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
                Quand tu veux aller plus loin
              </p>
              <p
                className="font-sans"
                style={{ fontSize: 13, color: "rgba(240,230,214,0.55)", margin: 0, marginBottom: 14, lineHeight: 1.55 }}
              >
                Une travers&eacute;e plus approfondie pour mieux comprendre ce qui se joue et avancer dans le temps.
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

        {/* ── Bloc 6 — Cadre disclaimer ── */}
        <div style={warningBlockStyle}>
          <p style={pNormal}>
            TRAC&Eacute;A peut t&apos;aider quand &ccedil;a monte fort.
          </p>
          <p style={{ ...pNormal, marginTop: 10 }}>
            Mais ce n&apos;est pas un outil pour les situations de d&eacute;tresse grave ou d&apos;urgence m&eacute;dicale.
          </p>
          <p style={{ ...pNormal, marginTop: 10 }}>
            Si tu es en danger, contacte les services adapt&eacute;s.
          </p>
        </div>

        {/* ── Bloc cadre ── */}
        <div
          style={{
            background: "rgba(111,106,100,0.18)",
            border: "1px solid rgba(240,230,214,0.10)",
            borderRadius: 24,
            padding: "28px 24px",
            boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: "0.20em",
              textTransform: "uppercase" as const,
              color: "#C97B6A",
              marginBottom: 18,
            }}
          >
            Un rep&egrave;re important
          </p>
          <p
            style={{
              fontSize: 16,
              fontWeight: 300,
              lineHeight: 1.65,
              color: "rgba(240,230,214,0.68)",
              marginBottom: 14,
            }}
          >
            TRAC&Eacute;A est un appui.
          </p>
          <p
            style={{
              fontSize: 16,
              fontWeight: 300,
              lineHeight: 1.65,
              color: "rgba(240,230,214,0.68)",
              marginBottom: 0,
            }}
          >
            Si tu es compl&egrave;tement submerg&eacute;(e) ou en d&eacute;tresse,{" "}
            <span style={{ color: "#F0E6D6", fontWeight: 600 }}>
              ne reste pas seul(e).
            </span>
            <br />
            Ce que tu vis m&eacute;rite aussi d&apos;&ecirc;tre accompagn&eacute;.
          </p>
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
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
            Essayer ma premi&egrave;re travers&eacute;e
          </Link>
        </div>
      </div>
    </div>
  );
}
