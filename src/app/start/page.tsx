import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commencer | TRACEA",
  description:
    "Commence ta traversee emotionnelle guidee. 10 minutes, gratuit, sans engagement.",
};

export default function StartPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(ellipse 70% 50% at 30% 20%, rgba(201,144,124,0.08) 0%, transparent 65%),
          radial-gradient(ellipse 60% 40% at 70% 80%, rgba(131,94,84,0.06) 0%, transparent 60%),
          linear-gradient(180deg, #1C1410 0%, #1E1612 50%, #1C1410 100%)
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
          opacity: 0.03,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div style={{ maxWidth: 440, width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <img
          src="/images/tracea-logo-terra-transparent.png"
          alt="TRACEA"
          style={{ height: 56, margin: "0 auto 56px", objectFit: "contain" }}
        />

        {/* Titre */}
        <h1
          className="font-body"
          style={{
            fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
            color: "#F5EFE6",
            lineHeight: 1.2,
            marginBottom: 24,
            fontWeight: 500,
          }}
        >
          Ca peut redescendre. Maintenant.
        </h1>

        {/* Texte principal */}
        <p
          className="font-sans"
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
            color: "#A89080",
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Ton corps sait d&eacute;j&agrave;.
        </p>

        {/* Sous-texte */}
        <p
          className="font-sans"
          style={{ fontSize: 14, color: "rgba(168,144,128,0.6)", lineHeight: 1.6, marginBottom: 4 }}
        >
          Tu vas juste te laisser guider.
        </p>
        <p
          className="font-sans"
          style={{ fontSize: 14, color: "rgba(168,144,128,0.55)", lineHeight: 1.6, marginBottom: 48 }}
        >
          Pendant quelques minutes.
        </p>

        {/* Rassurance */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px 16px",
            marginBottom: 48,
          }}
        >
          {["10 minutes", "Gratuit", "Sans engagement", "Arrête quand tu veux"].map((item) => (
            <span
              key={item}
              className="font-sans"
              style={{
                fontSize: 12,
                color: "rgba(168,144,128,0.45)",
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Accroche pre-CTA */}
        <p
          className="font-body"
          style={{ fontSize: 18, color: "rgba(245,239,230,0.5)", marginBottom: 24 }}
        >
          On commence ?
        </p>

        {/* CTA principal */}
        <Link
          href="/app"
          className="font-sans"
          style={{
            display: "inline-block",
            width: "100%",
            maxWidth: 320,
            background: "#C9907C",
            color: "#1C1410",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 40px",
            borderRadius: 40,
            textDecoration: "none",
            boxShadow: "0 8px 32px rgba(201,144,124,0.18), 0 2px 8px rgba(0,0,0,0.15)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          Commencer maintenant
        </Link>

        {/* Micro texte */}
        <p
          className="font-sans"
          style={{ fontSize: 12, color: "rgba(168,144,128,0.35)", marginTop: 24, lineHeight: 1.6 }}
        >
          Acc&egrave;s imm&eacute;diat. Sans engagement.
        </p>
      </div>
    </div>
  );
}
