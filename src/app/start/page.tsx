import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commencer | TRACEA",
  description:
    "Commence ta traversee emotionnelle guidee. 2 a 10 minutes, gratuit, sans engagement.",
};

// ── Palette V3 ──────────────────────────────────────────────────────
// Fond : #1A120D · Ivoire : #F0E6D6
// Cuivre doux : #C97B6A · Or doux : #D4A96A · Brun chaud : rgba(111,106,100,…)
// Pas de rouge saturé — tout reste dans le registre brun/cuivre/ivoire.

type Option = {
  href: string;
  label: string;
  title: string;
  desc: string;
  tag: string;
  dot: string;
  accent: string;
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
    dot: "#C97B6A",
    accent: "rgba(201,123,106,0.12)",
    border: "rgba(201,123,106,0.22)",
  },
  {
    href: "/app/traversee-courte",
    label: "TRAVERSÉE",
    title: "Je veux être guidé(e)",
    desc: "Pour déposer, revenir au corps, puis choisir un geste simple.",
    tag: "5 min",
    recommended: true,
    dot: "#D4A96A",
    accent: "rgba(212,169,106,0.14)",
    border: "rgba(212,169,106,0.42)",
  },
  {
    href: "/app/session",
    label: "APPROFONDIR",
    title: "Je veux comprendre ce qui se joue",
    desc: "Une traversée complète avec analyse et mémoire de tes repères.",
    tag: "15 min",
    badge: "Compte requis",
    dot: "rgba(240,230,214,0.40)",
    accent: "rgba(111,106,100,0.12)",
    border: "rgba(240,230,214,0.10)",
  },
];

export default function StartPage() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100svh",
        background:
          "radial-gradient(ellipse 80% 50% at 40% 15%, rgba(201,123,106,0.06) 0%, transparent 60%)," +
          "radial-gradient(ellipse 60% 40% at 65% 85%, rgba(131,94,84,0.04) 0%, transparent 55%)," +
          "linear-gradient(180deg, #1A120D 0%, #1C1410 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
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

      {/* Halo V3 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 32%, rgba(212,169,106,0.09) 0%, rgba(28,20,16,0) 58%)",
        }}
      />

      <div
        style={{
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <img
          src="/images/tracea-logo-terra-transparent.png"
          alt="TRACEA"
          style={{ height: 58, margin: "0 auto 28px", objectFit: "contain" }}
        />

        {/* Titre */}
        <h1
          className="font-body"
          style={{
            fontSize: "clamp(1.3rem, 4vw, 1.75rem)",
            color: "#F0E6D6",
            lineHeight: 1.22,
            marginBottom: 7,
            fontWeight: 300,
          }}
        >
          Tu veux redescendre comment&nbsp;?
        </h1>

        {/* Sous-titre */}
        <p
          className="font-sans"
          style={{
            fontSize: 12,
            color: "rgba(240,230,214,0.38)",
            marginBottom: 26,
            lineHeight: 1.55,
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
                display: "flex",
                alignItems: "center",
                gap: 13,
                background: opt.accent,
                border: `1px solid ${opt.border}`,
                borderRadius: 14,
                padding: opt.recommended ? "15px 16px" : "13px 16px",
                textDecoration: "none",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                transition: "opacity 0.15s",
                boxShadow: opt.recommended
                  ? "0 0 0 1px rgba(212,169,106,0.10), 0 4px 18px rgba(212,169,106,0.06)"
                  : "none",
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
                  opacity: opt.badge && !opt.recommended ? 0.7 : 1,
                }}
              />

              {/* Contenu */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Ligne label + durée + badge recommandé */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 3,
                    flexWrap: "wrap" as const,
                  }}
                >
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.13em",
                      color: opt.dot,
                      opacity: opt.badge && !opt.recommended ? 0.7 : 1,
                    }}
                  >
                    {opt.label}
                  </span>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 9,
                      color: "rgba(240,230,214,0.32)",
                      background: "rgba(111,106,100,0.18)",
                      border: "1px solid rgba(240,230,214,0.06)",
                      borderRadius: 999,
                      padding: "1px 6px",
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
                        color: "rgba(212,169,106,0.80)",
                        background: "rgba(212,169,106,0.10)",
                        border: "1px solid rgba(212,169,106,0.20)",
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
                    fontSize: opt.recommended ? 16 : 15,
                    color: opt.badge && !opt.recommended
                      ? "rgba(240,230,214,0.70)"
                      : "#F0E6D6",
                    fontWeight: 300,
                    margin: "0 0 2px",
                    lineHeight: 1.2,
                  }}
                >
                  {opt.title}
                </p>

                {/* Description */}
                <p
                  className="font-sans"
                  style={{
                    fontSize: 11,
                    color: opt.badge && !opt.recommended
                      ? "rgba(240,230,214,0.33)"
                      : "rgba(240,230,214,0.45)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {opt.desc}
                </p>

                {/* Badge secondaire (Compte requis) */}
                {opt.badge && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 10,
                      color: "rgba(240,230,214,0.26)",
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
                  opacity: opt.badge && !opt.recommended ? 0.18 : 0.28,
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

        {/* Micro texte bas */}
        <p
          className="font-sans"
          style={{
            fontSize: 11,
            color: "rgba(240,230,214,0.28)",
            marginTop: 22,
            lineHeight: 1.6,
            letterSpacing: "0.02em",
          }}
        >
          Tu peux commencer sans compte. Tu restes libre d&apos;arrêter.
        </p>
      </div>
    </div>
  );
}
