import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commencer | TRACEA",
  description:
    "Commence ta traversee emotionnelle guidee. 2 a 10 minutes, gratuit, sans engagement.",
};

// ── Tokens stricts Preview V3 ────────────────────────────────────────
// --t-bg           #1A120D
// --t-bg-deep      #120D09
// --t-surface      rgba(46,40,37,0.82)
// --t-accent       #B8634F
// --t-accent-light #C97B6A
// --t-cream        #F0E6D6
// --t-cream-dim    rgba(240,230,214,0.44)
// --t-cream-soft   rgba(240,230,214,0.30)
// --t-cream-faint  rgba(240,230,214,0.08)
// --t-gold         #D4A96A

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
};

const options: Option[] = [
  {
    href: "/app/urgence",
    label: "URGENCE",
    title: "Je veux redescendre vite",
    desc: "Quand c'est trop intense. Directement par le corps.",
    tag: "2 min",
    dot: "#B8634F",
    border: "rgba(240,230,214,0.085)",
  },
  {
    href: "/app/traversee-courte",
    label: "TRAVERSÉE",
    title: "Je veux être guidé(e)",
    desc: "Pour déposer, revenir au corps, puis choisir un geste simple.",
    tag: "5 min",
    recommended: true,
    dot: "#D4A96A",
    border: "rgba(212,169,106,0.32)",
  },
  {
    href: "/app/session",
    label: "APPROFONDIR",
    title: "Je veux comprendre ce qui se joue",
    desc: "Une traversée complète avec analyse et mémoire de tes repères.",
    tag: "15 min",
    badge: "Compte requis",
    dot: "rgba(240,230,214,0.35)",
    border: "rgba(240,230,214,0.06)",
  },
];

// Style de carte glass V3 partagé
const cardBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  background: "linear-gradient(180deg, rgba(46,40,37,0.82) 0%, rgba(36,26,19,0.72) 100%)",
  border: "1px solid rgba(240,230,214,0.085)",
  borderRadius: 28,
  padding: "18px 20px",
  textDecoration: "none",
  textAlign: "left",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.42)",
  transition: "opacity 0.15s",
};

export default function StartPage() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        background:
          "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.16) 0%, rgba(184,99,79,0.06) 35%, transparent 68%)," +
          "radial-gradient(ellipse at 20% 0%, rgba(111,106,100,0.18) 0%, transparent 58%)," +
          "radial-gradient(ellipse at 80% 0%, rgba(184,99,79,0.055) 0%, transparent 52%)," +
          "#1A120D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 32px 24px",
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
        <div style={{ position: "relative", marginBottom: 22 }}>
          {/* Halo derrière le logo */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 160,
              height: 100,
              background:
                "radial-gradient(ellipse at center, rgba(184,99,79,0.20) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <img
            src="/images/tracea-logo-terra-transparent.png"
            alt="TRACEA"
            style={{
              height: 72,
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              position: "relative",
            }}
          />
        </div>

        {/* Titre — Cormorant / serif premium V3 */}
        <h1
          className="font-body"
          style={{
            fontFamily: "'Cormorant Garamond', 'EB Garamond', serif",
            fontSize: "clamp(36px, 9vw, 46px)",
            color: "#F0E6D6",
            lineHeight: 1.02,
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
            fontSize: 15,
            color: "rgba(240,230,214,0.44)",
            lineHeight: 1.35,
            marginBottom: 22,
          }}
        >
          Choisis le chemin qui correspond à ton état maintenant.
        </p>

        {/* Cartes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              style={{
                ...cardBase,
                border: `1px solid ${opt.border}`,
                boxShadow: opt.recommended
                  ? "0 18px 45px rgba(0,0,0,0.42), 0 0 28px rgba(212,169,106,0.08)"
                  : "0 18px 45px rgba(0,0,0,0.42)",
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: opt.dot,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />

              {/* Contenu */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Label + durée + badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 4,
                    flexWrap: "wrap" as const,
                  }}
                >
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      color: opt.dot,
                    }}
                  >
                    {opt.label}
                  </span>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 9,
                      color: "rgba(240,230,214,0.32)",
                      background: "rgba(111,106,100,0.20)",
                      border: "1px solid rgba(240,230,214,0.07)",
                      borderRadius: 999,
                      padding: "1px 7px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {opt.tag}
                  </span>
                  {opt.recommended && (
                    <span
                      className="font-sans"
                      style={{
                        fontSize: 8,
                        fontWeight: 600,
                        letterSpacing: "0.09em",
                        color: "#D4A96A",
                        background: "rgba(212,169,106,0.08)",
                        border: "1px solid rgba(212,169,106,0.18)",
                        borderRadius: 999,
                        padding: "1px 6px",
                        textTransform: "uppercase" as const,
                      }}
                    >
                      recommandé
                    </span>
                  )}
                </div>

                {/* Titre carte */}
                <p
                  className="font-body"
                  style={{
                    fontSize: opt.recommended ? 17 : 16,
                    color: "#F0E6D6",
                    fontWeight: 300,
                    margin: "0 0 3px",
                    lineHeight: 1.18,
                    opacity: opt.badge && !opt.recommended ? 0.82 : 1,
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
                    lineHeight: 1.48,
                    opacity: opt.badge && !opt.recommended ? 0.78 : 1,
                  }}
                >
                  {opt.desc}
                </p>

                {/* Badge secondaire */}
                {opt.badge && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 10,
                      color: "rgba(240,230,214,0.28)",
                      margin: "4px 0 0",
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
                style={{
                  flexShrink: 0,
                  opacity: opt.badge && !opt.recommended ? 0.20 : 0.28,
                }}
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
            fontSize: 13,
            color: "rgba(240,230,214,0.30)",
            marginTop: 14,
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
