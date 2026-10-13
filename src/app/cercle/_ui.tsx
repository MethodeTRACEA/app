import type { CSSProperties, ReactNode } from "react";

// ===================================================================
// Le Cercle TRACÉA en ligne — habillage commun des pages /cercle/*
//
// Reprend le langage visuel de la page d'accueil (LandingPage.tsx) :
// fond brun nuit #1A120D + halo terracotta, titres clairs #F0E6D6 en
// graisse légère, accents terracotta #C97B6A / #D99A84 en italique,
// cartes translucides taupe, bouton dégradé doré → terracotta, chiffres
// en Cormorant Garamond. Valeurs reprises telles quelles de l'accueil.
//
// Isolement : aucun lien vers l'application, aucun traceur.
// Les liens du pied de page sont des <a> simples (rechargement complet)
// et non des <Link> Next : une page du Cercle ne doit jamais hériter
// d'un script de mesure chargé sur une autre page du site.
// ===================================================================

export const FONT_SANS = "var(--font-sans, 'DM Sans', sans-serif)";
export const FONT_CHIFFRE = "var(--font-body, 'Cormorant Garamond', serif)";

export const colors = {
  bg: "#1A120D",
  bgAlt: "#221813", // second ton de fond, pour alterner les sections
  title: "#F5EFE6",
  heading: "#F0E6D6",
  body: "rgba(240,230,214,0.80)",
  muted: "rgba(240,230,214,0.66)",
  terra: "#C97B6A",
  accent: "#D99A84",
  link: "#E0A893",
  line: "rgba(240,230,214,0.10)",
  surface: "rgba(111,106,100,0.18)", // cartes (comme l'accueil)
  surfaceDeep: "rgba(26,18,13,0.35)", // petites cartes intérieures
};

export const GRADIENT_CTA =
  "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)";

export const CARD_SHADOW =
  "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)";

export const pageStyle: CSSProperties = {
  flex: 1,
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  background: colors.bg,
};

export const containerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 720,
  margin: "0 auto",
  padding: "0 20px",
  boxSizing: "border-box",
};

export const h1Style: CSSProperties = {
  fontFamily: FONT_SANS,
  fontWeight: 300,
  fontSize: "clamp(1.9rem, 6.5vw, 2.6rem)",
  color: colors.heading,
  lineHeight: 1.22,
  letterSpacing: "-0.01em",
  margin: 0,
};

export const h2Style: CSSProperties = {
  fontFamily: FONT_SANS,
  fontWeight: 400,
  fontSize: "clamp(1.5rem, 5vw, 1.95rem)",
  color: colors.heading,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  margin: "0 0 20px",
};

export const h3Style: CSSProperties = {
  fontFamily: FONT_SANS,
  fontWeight: 500,
  fontSize: "1.125rem",
  color: colors.heading,
  lineHeight: 1.35,
  margin: "0 0 8px",
};

export const pStyle: CSSProperties = {
  fontFamily: FONT_SANS,
  fontSize: "1.0625rem",
  lineHeight: 1.75,
  color: colors.body,
  margin: "0 0 16px",
};

export const accentStyle: CSSProperties = {
  ...pStyle,
  color: colors.accent,
  fontStyle: "italic",
  fontWeight: 500,
};

export const linkStyle: CSSProperties = {
  color: colors.link,
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

export const listStyle: CSSProperties = {
  ...pStyle,
  paddingLeft: 22,
  listStyle: "disc",
};

export const cardStyle: CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.line}`,
  borderRadius: 24,
  padding: "28px 22px",
  boxShadow: CARD_SHADOW,
};

export const smallCardStyle: CSSProperties = {
  background: colors.surfaceDeep,
  border: "1px solid rgba(240,230,214,0.08)",
  borderRadius: 16,
  padding: "18px 18px",
};

export const ctaStyle: CSSProperties = {
  display: "inline-block",
  fontFamily: FONT_SANS,
  fontSize: "1.0625rem",
  fontWeight: 600,
  color: "#1A120D",
  background: GRADIENT_CTA,
  borderRadius: 40,
  padding: "16px 40px",
  textDecoration: "none",
  textAlign: "center",
  boxShadow:
    "0 8px 32px rgba(201,144,124,0.18), 0 2px 8px rgba(0,0,0,0.15), 0 0 40px rgba(200,120,90,0.35)",
};

// Petit trait terracotta au-dessus des titres de section (décoratif).
function Trait() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "block",
        width: 36,
        height: 2,
        borderRadius: 2,
        background: colors.terra,
        opacity: 0.85,
        marginBottom: 16,
      }}
    />
  );
}

// Titre de section : trait + h2.
export function SectionTitle({
  id,
  children,
  center = false,
}: {
  id?: string;
  children: ReactNode;
  center?: boolean;
}) {
  return (
    <div style={center ? { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" } : undefined}>
      <Trait />
      <h2 id={id} style={h2Style}>
        {children}
      </h2>
    </div>
  );
}

// Bande pleine largeur, ton de fond A ou B, grand espacement vertical.
export function Band({
  tone = "a",
  id,
  labelledBy,
  children,
  narrow = false,
}: {
  tone?: "a" | "b";
  id?: string;
  labelledBy?: string;
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className="py-16 md:py-24"
      style={{
        background: tone === "a" ? "transparent" : colors.bgAlt,
        borderTop: tone === "b" ? "1px solid rgba(240,230,214,0.05)" : undefined,
        borderBottom: tone === "b" ? "1px solid rgba(240,230,214,0.05)" : undefined,
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ ...containerStyle, maxWidth: narrow ? 640 : 760 }}>{children}</div>
    </section>
  );
}

// Halo d'ambiance de l'accueil, en haut de page (décoratif).
export function Halo() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 900,
        pointerEvents: "none",
        zIndex: 0,
        background:
          "radial-gradient(ellipse 120% 70% at 50% 0%, rgba(201,123,106,0.24) 0%, rgba(201,123,106,0) 75%), " +
          "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%)",
      }}
    />
  );
}

// Logo TRACÉA (image seule, sans lien : aucune porte vers le site/l'app).
export function CercleLogo({ size = 64 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/tracea-logo-terra-transparent.png"
      alt="TRACÉA"
      style={{ height: size, width: "auto", objectFit: "contain", display: "block" }}
    />
  );
}

// En-tête sobre des pages secondaires (conditions, confidentialité…).
export function SimpleHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header style={{ position: "relative", zIndex: 1 }} className="pt-12 pb-10 md:pt-16 md:pb-12">
      <div style={containerStyle}>
        <div style={{ marginBottom: 28 }}>
          <CercleLogo size={52} />
        </div>
        <h1 style={h1Style}>{title}</h1>
        {sub && (
          <p style={{ ...pStyle, color: colors.muted, marginTop: 14, marginBottom: 0 }}>{sub}</p>
        )}
      </div>
    </header>
  );
}

// Section de texte des pages secondaires : trait + titre + contenu.
export function Section({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id ? `${id}-titre` : undefined}
      style={{ marginTop: 44 }}
    >
      <Trait />
      <h2
        id={id ? `${id}-titre` : undefined}
        style={{ ...h2Style, fontSize: "clamp(1.25rem, 4vw, 1.45rem)", margin: "0 0 14px" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

const footerLinks = [
  { href: "/cercle/conditions", label: "Conditions d'inscription" },
  { href: "/cercle/confidentialite", label: "Confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cercle/renoncer", label: "Renoncer au contrat ici" },
];

export function CercleFooter() {
  return (
    <footer
      style={{
        marginTop: "auto",
        borderTop: `1px solid ${colors.line}`,
        background: colors.bgAlt,
        padding: "32px 20px 40px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <nav aria-label="Informations du Cercle">
        <ul
          style={{
            listStyle: "none",
            margin: "0 auto",
            padding: 0,
            maxWidth: 720,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px 22px",
          }}
        >
          {footerLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="cercle-footer-link"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: "0.9375rem",
                  color: colors.muted,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  display: "inline-block",
                  padding: "6px 2px",
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <p
        style={{
          fontFamily: FONT_SANS,
          fontSize: "0.875rem",
          color: colors.muted,
          textAlign: "center",
          margin: "14px auto 0",
          maxWidth: 720,
        }}
      >
        {"Si ça devient trop lourd : "}
        <a
          href="tel:3114"
          style={{ color: colors.muted, textDecoration: "underline", textUnderlineOffset: "3px" }}
        >
          3114
        </a>
        {", jour et nuit."}
      </p>
    </footer>
  );
}
