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
// Card   : rgba(111,106,100,0.18), border rgba(240,230,214,0.10), r28
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
    border: "rgba(240,230,214,0.26)",
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
    cardOpacity: 0.97,
    titleColor: "rgba(240,230,214,0.92)",
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

      {/* Layout top-down — px-6 pt-6 pb-4, pas de justify-center */}
      <div
        className="relative min-h-[100dvh] flex flex-col items-center px-6 pt-6 pb-4 overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <div className="w-full flex flex-col items-center text-center" style={{ maxWidth: 420 }}>

          {/* Logo — w-16 max-w-[64px] h-auto, drop-shadow uniquement */}
          <div className="mb-6">
            <img
              src="/images/tracea-logo-terra-transparent.png"
              alt="TRACÉA"
              className="mx-auto object-contain w-16 max-w-[64px] h-auto"
              style={{ filter: "drop-shadow(0 0 14px rgba(201,123,106,0.20))" }}
            />
          </div>

          {/* Titre — 38px / leading 0.98 / tracking -0.02em */}
          <h1
            className="font-light w-full text-[38px] max-[370px]:text-[34px] leading-[0.98] tracking-[-0.02em] mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', 'EB Garamond', serif",
              color: "#F0E6D6",
            }}
          >
            Tu veux redescendre comment&nbsp;?
          </h1>

          {/* Sous-titre */}
          <p
            className="font-sans text-[16px] max-[370px]:text-[15px] leading-[1.35] mb-6 max-[370px]:mb-5 max-w-[320px]"
            style={{ color: "rgba(240,230,214,0.50)" }}
          >
            Choisis le chemin qui correspond à ton état maintenant.
          </p>

          {/* Cartes — space-y-3 / h-[124px] */}
          <div className="w-full max-w-[612px] space-y-3">
            {options.map((opt) => (
              <Link
                key={opt.href}
                href={opt.href}
                className="flex items-center min-h-0 h-[124px] max-[370px]:h-[116px] px-5 max-[370px]:px-4 py-4 max-[370px]:py-3 rounded-[28px] overflow-hidden"
                style={{
                  gap: 12,
                  background: opt.recommended
                    ? "rgba(111,106,100,0.22)"
                    : "rgba(111,106,100,0.18)",
                  border: `1px solid ${opt.border}`,
                  textDecoration: "none",
                  textAlign: "left",
                  boxShadow: opt.recommended
                    ? "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 18px rgba(201,123,106,0.10)"
                    : "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
                  opacity: opt.cardOpacity ?? 1,
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
                    opacity: 0.85,
                  }}
                />

                {/* Contenu */}
                <div className="flex-1 min-w-0">

                  {/* Label + badges */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="font-sans text-[12px] leading-none tracking-[0.18em] font-semibold"
                      style={{ color: opt.dot }}
                    >
                      {opt.label}
                    </span>

                    {/* Tag durée */}
                    <span
                      className="font-sans h-7 max-[370px]:h-6 px-3 max-[370px]:px-2 text-[13px] max-[370px]:text-[12px] leading-none flex items-center rounded-full"
                      style={{
                        color: "rgba(240,230,214,0.45)",
                        background: "rgba(240,230,214,0.07)",
                        border: "1px solid rgba(240,230,214,0.10)",
                      }}
                    >
                      {opt.tag}
                    </span>

                    {/* Badge recommandé */}
                    {opt.recommended && (
                      <span
                        className="font-sans h-7 max-[370px]:h-6 px-3 max-[370px]:px-2 text-[13px] max-[370px]:text-[12px] leading-none flex items-center rounded-full"
                        style={{
                          color: "rgba(240,230,214,0.55)",
                          background: "rgba(240,230,214,0.07)",
                          border: "1px solid rgba(240,230,214,0.12)",
                        }}
                      >
                        recommandé
                      </span>
                    )}
                  </div>

                  {/* Titre carte — 28px / lh 1.02 */}
                  <p
                    className="font-body text-[28px] max-[370px]:text-[25px] leading-[1.02] tracking-[-0.01em]"
                    style={{
                      color: opt.titleColor ?? "#F0E6D6",
                      fontWeight: 300,
                      margin: 0,
                    }}
                  >
                    {opt.title}
                  </p>

                  {/* Description — line-clamp-2 */}
                  <p
                    className="font-sans text-[16px] max-[370px]:text-[15px] leading-[1.45] max-[370px]:leading-[1.35] mt-1 line-clamp-2"
                    style={{ color: "rgba(240,230,214,0.44)" }}
                  >
                    {opt.desc}
                  </p>

                  {/* Badge Compte requis */}
                  {opt.badge && (
                    <p
                      className="font-sans text-[14px] max-[370px]:text-[13px] mt-2 max-[370px]:mt-1 leading-none"
                      style={{ color: "rgba(240,230,214,0.50)" }}
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
            className="font-sans text-[14px] max-[370px]:text-[13px] mt-4 max-[370px]:mt-3 leading-[1.3] max-w-[320px]"
            style={{
              color: "rgba(240,230,214,0.28)",
              letterSpacing: "0.01em",
            }}
          >
            Tu peux commencer sans compte. Tu restes libre d&apos;arrêter.
          </p>

        </div>
      </div>
    </div>
  );
}
