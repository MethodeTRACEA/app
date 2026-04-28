import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commencer | TRACEA",
  description:
    "Commence ta traversee emotionnelle guidee. 2 a 10 minutes, gratuit, sans engagement.",
};

// ── Shell visuel identique à src/app/page.tsx ────────────────────────
// Base   : #1A120D
// Halo   : radial-gradient(ellipse at 50% 0%, rgba(201,123,106,0.28) …)
// Bg     : radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) …)
//           + radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) …)
// Card   : rgba(111,106,100,0.18), border rgba(240,230,214,0.10), r24
// Shadow : 0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)
// Dot    : #C97B6A
// Cream  : #F0E6D6

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
    border: "rgba(240,230,214,0.10)",
  },
  {
    href: "/app/traversee-courte",
    label: "TRAVERSÉE",
    title: "Je veux être guidé(e)",
    desc: "Pour déposer, revenir au corps, puis choisir un geste simple.",
    tag: "5 min",
    recommended: true,
    dot: "#C97B6A",
    border: "rgba(240,230,214,0.22)",
  },
  {
    href: "/app/session",
    label: "APPROFONDIR",
    title: "Je veux comprendre ce qui se joue",
    desc: "Une traversée complète avec analyse et mémoire de tes repères.",
    tag: "15 min",
    badge: "Compte requis",
    dot: "rgba(240,230,214,0.28)",
    border: "rgba(240,230,214,0.10)",
    cardOpacity: 0.94,
    titleColor: "rgba(240,230,214,0.90)",
  },
];

export default function StartPage() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: "100dvh", background: "#1A120D" }}
    >
      {/* Couche 1 — gradients fond identiques à la landing */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
            "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%)",
        }}
      />

      {/* Couche 2 — halo accent en haut, identique à la landing */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(201,123,106,0.28) 0%, rgba(201,123,106,0) 75%)",
          zIndex: 0,
        }}
      />

      {/* Contenu centré */}
      <section
        className="relative flex items-center justify-center px-6 py-6"
        style={{ minHeight: "100dvh", zIndex: 1 }}
      >
        <div className="relative z-10 w-full text-center" style={{ maxWidth: 420 }}>

          {/* Logo — rendu identique à la landing, sans wrapper avec fond */}
          <div className="mb-3">
            <img
              src="/images/tracea-logo-terra-transparent.png"
              alt="TRACÉA"
              className="mx-auto object-contain"
              style={{ height: "clamp(64px, 10vw, 80px)" }}
            />
          </div>

          {/* Titre */}
          <h1
            className="tracking-tight"
            style={{
              fontFamily: "'Cormorant Garamond', 'EB Garamond', serif",
              fontSize: "clamp(26px, 7vw, 34px)",
              fontWeight: 300,
              lineHeight: 1.15,
              color: "#F0E6D6",
              marginBottom: 4,
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
              color: "rgba(240,230,214,0.50)",
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            Choisis le chemin qui correspond à ton état maintenant.
          </p>

          {/* Les 3 cartes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {options.map((opt) => (
              <Link
                key={opt.href}
                href={opt.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: opt.recommended
                    ? "rgba(111,106,100,0.22)"
                    : "rgba(111,106,100,0.18)",
                  border: `1px solid ${opt.border}`,
                  borderRadius: 24,
                  padding: "16px 20px",
                  textDecoration: "none",
                  textAlign: "left",
                  boxShadow: opt.recommended
                    ? "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 18px rgba(201,123,106,0.10)"
                    : "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
                  opacity: opt.cardOpacity ?? 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: opt.dot,
                    flexShrink: 0,
                    marginTop: 1,
                    opacity: 0.85,
                  }}
                />

                {/* Contenu */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Label + tag durée + badge recommandé */}
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

                    {/* Tag durée */}
                    <span
                      className="font-sans"
                      style={{
                        fontSize: 9,
                        color: "rgba(240,230,214,0.45)",
                        background: "rgba(240,230,214,0.07)",
                        border: "1px solid rgba(240,230,214,0.10)",
                        borderRadius: 999,
                        padding: "1px 7px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {opt.tag}
                    </span>

                    {/* Badge recommandé — neutre, sans or */}
                    {opt.recommended && (
                      <span
                        className="font-sans"
                        style={{
                          fontSize: 9,
                          color: "rgba(240,230,214,0.55)",
                          background: "rgba(240,230,214,0.07)",
                          border: "1px solid rgba(240,230,214,0.12)",
                          borderRadius: 999,
                          padding: "1px 7px",
                          letterSpacing: "0.05em",
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
                      fontSize: 16,
                      color: opt.titleColor ?? "#F0E6D6",
                      fontWeight: 300,
                      margin: "0 0 4px",
                      lineHeight: 1.25,
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
                        color: "rgba(240,230,214,0.42)",
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
                  style={{ flexShrink: 0, opacity: 0.22 }}
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
              color: "rgba(240,230,214,0.28)",
              marginTop: 10,
              lineHeight: 1.55,
              letterSpacing: "0.01em",
            }}
          >
            Tu peux commencer sans compte. Tu restes libre d&apos;arrêter.
          </p>
        </div>
      </section>
    </div>
  );
}
