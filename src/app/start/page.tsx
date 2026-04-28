import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commencer | TRACEA",
  description:
    "Commence ta traversee emotionnelle guidee. 2 a 10 minutes, gratuit, sans engagement.",
};

// ── Design tokens V3 stricts (tracea_preview_v3.html) ────────────────
// --t-bg-deep        #120D09
// --t-surface-taupe  rgba(111,106,100,0.14)
// --t-accent-light   #C97B6A
// --t-cream          #F0E6D6
// --t-cream-dim      rgba(240,230,214,0.44)
// --t-cream-soft     rgba(240,230,214,0.30)
// --t-cream-faint    rgba(240,230,214,0.085)
// --font-title       'Cormorant Garamond', serif
// --font-ui          'DM Sans', sans-serif
// --radius-lg        24px
// --shadow-card      0 18px 48px rgba(0,0,0,0.38)

type Option = {
  href: string;
  label: string;
  title: string;
  desc: string;
  tag: string;
  dot: string;
  border: string;
  recommended?: true;
  badge?: string;
  cardOpacity?: number;
  titleColor?: string;
};

const options: Option[] = [
  {
    href: "/app/urgence",
    label: "URGENCE",
    title: "Je veux redescendre vite",
    desc: "Quand c'est trop intense. Directement par le corps.",
    tag: "2 min",
    dot: "#C97B6A",
    border: "rgba(240,230,214,0.085)",
  },
  {
    href: "/app/traversee-courte",
    label: "TRAVERSÉE",
    title: "Je veux être guidé(e)",
    desc: "Pour déposer, revenir au corps, puis choisir un geste simple.",
    tag: "5 min",
    recommended: true,
    dot: "#C97B6A",
    border: "rgba(240,230,214,0.14)",
  },
  {
    href: "/app/session",
    label: "APPROFONDIR",
    title: "Je veux comprendre ce qui se joue",
    desc: "Une traversée complète avec analyse et mémoire de tes repères.",
    tag: "15 min",
    badge: "Compte requis",
    dot: "rgba(240,230,214,0.30)",
    border: "rgba(240,230,214,0.085)",
    cardOpacity: 0.86,
    titleColor: "rgba(240,230,214,0.82)",
  },
];

// Carte V3 — surface taupe, sans glow, sans dégradé
const cardBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  background: "rgba(111,106,100,0.14)",
  borderRadius: 24,
  padding: "20px 22px",
  textDecoration: "none",
  textAlign: "left",
  boxShadow: "0 18px 48px rgba(0,0,0,0.38)",
  transition: "opacity 0.2s ease",
};

// Tag durée V3 — cream neutre
const tagStyle: React.CSSProperties = {
  fontSize: 9,
  color: "rgba(240,230,214,0.45)",
  background: "rgba(240,230,214,0.07)",
  border: "1px solid rgba(240,230,214,0.10)",
  borderRadius: 999,
  padding: "1px 7px",
  letterSpacing: "0.04em",
};

// Badge "recommandé" — distinct du tag durée
const recommendedStyle: React.CSSProperties = {
  fontSize: 9,
  color: "rgba(240,230,214,0.58)",
  background: "rgba(240,230,214,0.07)",
  border: "1px solid rgba(240,230,214,0.12)",
  borderRadius: 999,
  padding: "1px 7px",
  letterSpacing: "0.06em",
};

export default function StartPage() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        // Fond exact V3 body — tracea_preview_v3.html
        background:
          "radial-gradient(ellipse at 18% 8%, rgba(111,106,100,0.18) 0%, rgba(46,40,37,0.12) 34%, transparent 62%)," +
          "radial-gradient(ellipse at 30% 0%, rgba(184,99,79,0.11) 0%, rgba(18,13,9,0.70) 42%, rgba(7,5,3,0.95) 100%)," +
          "#120D09",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Grain texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.022,
          pointerEvents: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div
        style={{
          maxWidth: 390,
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo + halo */}
        <div style={{ marginBottom: 20 }}>
          <img
            src="/images/tracea-logo-terra-transparent.png"
            alt="TRACEA"
            style={{
              height: 72,
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              boxShadow: "0 0 40px rgba(184,99,79,0.25)",
            }}
          />
        </div>

        {/* Titre — font-title V3 */}
        <h1
          className="font-body"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(32px, 8vw, 42px)",
            color: "#F0E6D6",
            lineHeight: 1.05,
            fontWeight: 300,
            marginBottom: 8,
            letterSpacing: "-0.01em",
          }}
        >
          Tu veux redescendre comment&nbsp;?
        </h1>

        {/* Sous-titre */}
        <p
          className="font-sans"
          style={{
            fontSize: 14,
            color: "rgba(240,230,214,0.44)",
            lineHeight: 1.4,
            marginBottom: 24,
          }}
        >
          Choisis le chemin qui correspond à ton état maintenant.
        </p>

        {/* Cartes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {options.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              style={{
                ...cardBase,
                border: `1px solid ${opt.border}`,
                opacity: opt.cardOpacity ?? 1,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: opt.dot,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />

              {/* Contenu */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Label + durée + badge recommandé */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 5,
                    flexWrap: "wrap" as const,
                  }}
                >
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.14em",
                      color: opt.dot,
                    }}
                  >
                    {opt.label}
                  </span>
                  <span className="font-sans" style={tagStyle}>
                    {opt.tag}
                  </span>
                  {opt.recommended && (
                    <span className="font-sans" style={recommendedStyle}>
                      recommandé
                    </span>
                  )}
                </div>

                {/* Titre carte */}
                <p
                  className="font-body"
                  style={{
                    fontSize: 16,
                    color: opt.titleColor ?? "#F0E6D6",
                    fontWeight: 300,
                    margin: "0 0 4px",
                    lineHeight: 1.2,
                  }}
                >
                  {opt.title}
                </p>

                {/* Description */}
                <p
                  className="font-sans"
                  style={{
                    fontSize: 12,
                    color: "rgba(240,230,214,0.44)",
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  {opt.desc}
                </p>

                {/* Badge compte requis */}
                {opt.badge && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 10,
                      color: "rgba(240,230,214,0.34)",
                      margin: "5px 0 0",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {opt.badge}
                  </p>
                )}
              </div>

              {/* Flèche */}
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                style={{ flexShrink: 0, opacity: 0.25 }}
              >
                <path
                  d="M6 3l5 5-5 5"
                  stroke="#F0E6D6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ))}
        </div>

        {/* Microtexte bas */}
        <p
          className="font-sans"
          style={{
            fontSize: 12,
            color: "rgba(240,230,214,0.25)",
            marginTop: 20,
            lineHeight: 1.55,
            letterSpacing: "0.01em",
          }}
        >
          Tu peux commencer sans compte. Tu restes libre d&apos;arrêter.
        </p>
      </div>
    </div>
  );
}
