import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commencer | TRACEA",
  description:
    "Commence ta traversee emotionnelle guidee. 2 a 10 minutes, gratuit, sans engagement.",
};

// Shell fond identique à src/app/page.tsx — inchangé.

type Option = {
  href: string;
  label: string;
  title: string;
  desc: string;
  tag: string;
  labelColor: string;
  recommended?: true;
  badge?: string;
  cardOpacity?: number;
  cardBorder?: string;
  cardBg?: string;
};

const options: Option[] = [
  {
    href: "/app/urgence",
    label: "URGENCE",
    title: "Je veux redescendre vite",
    desc: "Quand c'est trop intense. Directement par le corps.",
    tag: "2 min",
    labelColor: "#C97B6A",
    cardBorder: "rgba(255,255,255,0.08)",
    cardBg: "rgba(255,255,255,0.06)",
  },
  {
    href: "/app/traversee-courte",
    label: "TRAVERSÉE",
    title: "Je veux être guidé(e)",
    desc: "Pour déposer, revenir au corps, puis choisir un geste simple.",
    tag: "5 min",
    recommended: true,
    labelColor: "#C97B6A",
    cardBorder: "rgba(255,255,255,0.22)",
    cardBg: "rgba(255,255,255,0.12)",
  },
  {
    href: "/app/session",
    label: "APPROFONDIR",
    title: "Je veux comprendre ce qui se joue",
    desc: "Une traversée complète avec analyse et mémoire de tes repères.",
    tag: "15 min",
    badge: "Compte requis",
    labelColor: "rgba(240,230,214,0.38)",
    cardBorder: "rgba(255,255,255,0.08)",
    cardBg: "rgba(255,255,255,0.06)",
    cardOpacity: 0.72,
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

      {/* Couche 2 — halo accent en haut */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(201,123,106,0.28) 0%, rgba(201,123,106,0) 75%)",
          zIndex: 0,
        }}
      />

      {/* ── Container principal — h-[100dvh] justify-between ── */}
      <div
        className="relative h-[100dvh] flex flex-col justify-between px-5 pt-6 pb-4"
        style={{ zIndex: 1 }}
      >

        {/* LOGO */}
        <div className="flex justify-center">
          <img
            src="/images/tracea-logo-terra-transparent.png"
            alt="TRACÉA"
            className="w-9 h-9 object-contain"
            style={{
              opacity: 0.85,
              filter: "drop-shadow(0 0 12px rgba(201,123,106,0.25))",
            }}
          />
        </div>

        {/* TITRE + SOUS-TITRE */}
        <div className="text-center">
          <h1
            className="font-light text-[28px] leading-[32px] tracking-[-0.01em] text-center mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', 'EB Garamond', serif",
              color: "#F0E6D6",
            }}
          >
            Tu veux redescendre comment&nbsp;?
          </h1>

          <p
            className="font-sans text-[13px] leading-[18px] text-center"
            style={{ color: "rgba(240,230,214,0.60)" }}
          >
            Choisis le chemin qui correspond à ton état maintenant.
          </p>
        </div>

        {/* CARTES */}
        <div className="flex flex-col gap-2.5">
          {options.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              className="block rounded-[18px] px-5 py-4 no-underline"
              style={{
                background: opt.cardBg,
                border: `1px solid ${opt.cardBorder}`,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                textDecoration: "none",
                opacity: opt.cardOpacity ?? 1,
              }}
            >
              {/* TAG — label + durée + recommandé */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-sans text-[11px] tracking-[0.18em] leading-none font-semibold"
                  style={{ color: opt.labelColor }}
                >
                  {opt.label}
                </span>
                <span
                  className="font-sans text-[12px] leading-none px-2.5 py-1 rounded-full"
                  style={{
                    color: "rgba(255,255,255,0.40)",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {opt.tag}
                </span>
                {opt.recommended && (
                  <span
                    className="font-sans text-[12px] leading-none px-2.5 py-1 rounded-full"
                    style={{
                      color: "rgba(240,230,214,0.72)",
                      background: "rgba(240,230,214,0.08)",
                      border: "1px solid rgba(240,230,214,0.20)",
                    }}
                  >
                    recommandé
                  </span>
                )}
              </div>

              {/* TITRE CARTE */}
              <p
                className="font-body text-[24px] max-[370px]:text-[22px] leading-[1.08]"
                style={{
                  color: "#F0E6D6",
                  fontWeight: 300,
                  margin: "0 0 3px",
                }}
              >
                {opt.title}
              </p>

              {/* DESCRIPTION */}
              <p
                className="font-sans text-[15px] max-[370px]:text-[14px] leading-[1.35] line-clamp-2"
                style={{ color: "rgba(240,230,214,0.50)", margin: 0 }}
              >
                {opt.desc}
              </p>

              {/* COMPTE REQUIS */}
              {opt.badge && (
                <p
                  className="font-sans text-[11px] mt-1"
                  style={{ color: "rgba(240,230,214,0.38)", margin: "4px 0 0" }}
                >
                  {opt.badge}
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* FOOTER MICROTEXTE */}
        <p
          className="font-sans text-[11px] text-center"
          style={{ color: "rgba(240,230,214,0.38)" }}
        >
          Tu peux commencer sans compte. Tu restes libre d&apos;arrêter.
        </p>

      </div>
    </div>
  );
}
