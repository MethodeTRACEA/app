import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commencer | TRACEA",
  description:
    "Commence ta traversee emotionnelle guidee. 2 a 10 minutes, gratuit, sans engagement.",
};

const options = [
  {
    href: "/app/urgence",
    label: "URGENCE",
    title: "Ça monte fort",
    desc: "Un ancrage immédiat. Tu n'as pas le temps de réfléchir.",
    tag: "2 min",
    accent: "rgba(184,99,79,0.22)",
    border: "rgba(184,99,79,0.30)",
    dot: "#B8634F",
  },
  {
    href: "/app/traversee-courte",
    label: "TRAVERSÉE",
    title: "Passer à travers",
    desc: "Un protocole guidé pour traverser ce que tu ressens maintenant.",
    tag: "5 min",
    accent: "rgba(201,123,106,0.18)",
    border: "rgba(201,123,106,0.28)",
    dot: "#C97B6A",
  },
  {
    href: "/app/session",
    label: "APPROFONDIR",
    title: "Aller plus loin",
    desc: "Une session complète pour comprendre et travailler en profondeur.",
    tag: "15 min",
    badge: "Compte requis",
    accent: "rgba(111,106,100,0.18)",
    border: "rgba(240,230,214,0.10)",
    dot: "rgba(240,230,214,0.45)",
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
        padding: "48px 16px",
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
          style={{ height: 48, margin: "0 auto 52px", objectFit: "contain" }}
        />

        {/* Titre */}
        <h1
          className="font-body"
          style={{
            fontSize: "clamp(1.5rem, 4.5vw, 2rem)",
            color: "#F0E6D6",
            lineHeight: 1.25,
            marginBottom: 8,
            fontWeight: 300,
          }}
        >
          Qu&apos;est-ce qui t&apos;aiderait maintenant&nbsp;?
        </h1>

        <p
          className="font-sans"
          style={{
            fontSize: 14,
            color: "rgba(240,230,214,0.45)",
            marginBottom: 40,
            lineHeight: 1.5,
          }}
        >
          Choisis selon ce que tu ressens.
        </p>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {options.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: opt.accent,
                border: `1px solid ${opt.border}`,
                borderRadius: 16,
                padding: "18px 20px",
                textDecoration: "none",
                textAlign: "left",
                backdropFilter: "blur(8px)",
                transition: "transform 0.15s, background 0.15s",
              }}
            >
              {/* Dot indicator */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: opt.dot,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
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
                      padding: "2px 8px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {opt.tag}
                  </span>
                </div>
                <p
                  className="font-body"
                  style={{
                    fontSize: 17,
                    color: "#F0E6D6",
                    fontWeight: 300,
                    margin: "0 0 4px",
                    lineHeight: 1.2,
                  }}
                >
                  {opt.title}
                </p>
                <p
                  className="font-sans"
                  style={{
                    fontSize: 13,
                    color: "rgba(240,230,214,0.50)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {opt.desc}
                </p>
                {"badge" in opt && opt.badge && (
                  <p
                    className="font-sans"
                    style={{
                      fontSize: 11,
                      color: "rgba(240,230,214,0.30)",
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
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ flexShrink: 0, opacity: 0.35 }}
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
            marginTop: 32,
            lineHeight: 1.6,
            letterSpacing: "0.03em",
          }}
        >
          Commence gratuitement · Sans compte · Arrête quand tu veux
        </p>
      </div>
    </div>
  );
}
