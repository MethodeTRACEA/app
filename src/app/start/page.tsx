import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commencer | TRACEA",
  description:
    "Commence ta traversee emotionnelle guidee. 2 a 10 minutes, gratuit, sans engagement.",
};

type Option = {
  href: string;
  label: string;
  title: string;
  desc: string;
  tag: string;
  accent: string;
  border: string;
  dot: string;
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
    // Présent mais non dominant — accessible sans agressivité
    accent: "rgba(184,99,79,0.16)",
    border: "rgba(184,99,79,0.24)",
    dot: "#B8634F",
  },
  {
    href: "/app/traversee-courte",
    label: "TRAVERSÉE",
    title: "Je veux être guidé(e)",
    desc: "Pour déposer, revenir au corps, puis choisir un geste simple.",
    tag: "5 min",
    recommended: true,
    // Plus chaud, plus lumineux — choix central recommandé
    accent: "rgba(201,123,106,0.24)",
    border: "rgba(201,123,106,0.52)",
    dot: "#C97B6A",
  },
  {
    href: "/app/session",
    label: "APPROFONDIR",
    title: "Je veux comprendre ce qui se joue",
    desc: "Une traversée complète avec analyse et mémoire de tes repères.",
    tag: "15 min",
    badge: "Compte requis",
    // Plus sobre, premium, légèrement en retrait
    accent: "rgba(111,106,100,0.10)",
    border: "rgba(240,230,214,0.08)",
    dot: "rgba(240,230,214,0.35)",
  },
];

export default function StartPage() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100svh",
        background: `
          radial-gradient(ellipse 70% 50% at 30% 20%, rgba(201,123,106,0.07) 0%, transparent 65%),
          radial-gradient(ellipse 60% 40% at 70% 80%, rgba(131,94,84,0.05) 0%, transparent 60%),
          linear-gradient(180deg, #1A120D 0%, #1C1410 100%)
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      {/* Grain texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.025,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
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
            "radial-gradient(circle at 50% 35%, rgba(255,160,100,0.12) 0%, rgba(28,20,16,0) 60%)",
        }}
      />

      <div
        style={{
          maxWidth: 420,
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
          style={{ height: 44, margin: "0 auto 36px", objectFit: "contain" }}
        />

        {/* Titre */}
        <h1
          className="font-body"
          style={{
            fontSize: "clamp(1.4rem, 4.2vw, 1.85rem)",
            color: "#F0E6D6",
            lineHeight: 1.25,
            marginBottom: 8,
            fontWeight: 300,
          }}
        >
          Tu veux redescendre comment&nbsp;?
        </h1>

        <p
          className="font-sans"
          style={{
            fontSize: 13,
            color: "rgba(240,230,214,0.42)",
            marginBottom: 32,
            lineHeight: 1.5,
          }}
        >
          Choisis le chemin qui correspond à ton état maintenant.
        </p>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {options.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: opt.accent,
                border: `1px solid ${opt.border}`,
                borderRadius: 16,
                padding: opt.recommended ? "18px 18px" : "15px 18px",
                textDecoration: "none",
                textAlign: "left",
                backdropFilter: "blur(8px)",
                transition: "transform 0.15s, background 0.15s",
                // Légère ombre sur la carte recommandée
                boxShadow: opt.recommended
                  ? "0 0 0 1px rgba(201,123,106,0.18), 0 4px 20px rgba(201,123,106,0.08)"
                  : "none",
              }}
            >
              {/* Dot indicator */}
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: opt.dot,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Label row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 3,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      color: opt.dot,
                    }}
                  >
                    {opt.label}
                  </span>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: 10,
                      color: "rgba(240,230,214,0.35)",
                      background: "rgba(111,106,100,0.20)",
                      border: "1px solid rgba(240,230,214,0.07)",
                      borderRadius: 999,
                      padding: "2px 7px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {opt.tag}
                  </span>
                  {/* Badge recommandé — TRAVERSÉE uniquement */}
                  {opt.recommended && (
                    <span
                      className="font-sans"
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        color: "rgba(201,123,106,0.85)",
                        background: "rgba(201,123,106,0.12)",
                        border: "1px solid rgba(201,123,106,0.22)",
                        borderRadius: 999,
                        padding: "2px 7px",
                        textTransform: "uppercase" as const,
                      }}
                    >
                      recommandé
                    </span>
                  )}
                </div>

                {/* Titre */}
                <p
                  className="font-body"
                  style={{
                    fontSize: opt.recommended ? 17 : 16,
                    color: opt.badge && !opt.recommended
                      ? "rgba(240,230,214,0.75)"
                      : "#F0E6D6",
                    fontWeight: 300,
                    margin: "0 0 3px",
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
                    color: opt.badge && !opt.recommended
                      ? "rgba(240,230,214,0.38)"
                      : "rgba(240,230,214,0.48)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {opt.desc}
                </p>

                {/* Badge secondaire (ex: Compte requis) */}
                {opt.badge && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 10,
                      color: "rgba(240,230,214,0.28)",
                      margin: "5px 0 0",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {opt.badge}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  flexShrink: 0,
                  opacity: opt.badge && !opt.recommended ? 0.22 : 0.32,
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
            color: "rgba(240,230,214,0.26)",
            marginTop: 28,
            lineHeight: 1.65,
            letterSpacing: "0.02em",
          }}
        >
          Tu peux commencer sans compte. Tu restes libre d&apos;arrêter.
        </p>
      </div>
    </div>
  );
}
