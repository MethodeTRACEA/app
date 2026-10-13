import type { CSSProperties, ReactNode } from "react";

// ===================================================================
// Le Cercle TRACÉA en ligne — habillage commun des pages /cercle/*
//
// Les couleurs sont des variables CSS définies dans cercle.css (palette
// « aube », retenue le 13/10/2026). Les polices sont chargées par
// next/font dans layout.tsx et servies depuis le site (aucun serveur
// extérieur).
//
// Isolement : aucun lien vers l'application, aucun traceur.
// Les liens du pied de page sont des <a> simples (rechargement complet)
// et non des <Link> Next : une page du Cercle ne doit jamais hériter
// d'un script de mesure chargé sur une autre page du site.
// ===================================================================

export const FONT_SANS =
  "var(--font-cercle-sans), 'DM Sans', system-ui, sans-serif";
export const FONT_SERIF =
  "var(--font-cercle-serif), 'DM Serif Display', Georgia, serif";
export const FONT_CHIFFRE = FONT_SERIF;

export const colors = {
  bg: "var(--c-bg)",
  bgAlt: "var(--c-bg2)",
  title: "var(--c-title)",
  heading: "var(--c-heading)",
  body: "var(--c-body)",
  muted: "var(--c-muted)",
  terra: "var(--c-terra)",
  accent: "var(--c-accent)",
  link: "var(--c-link)",
  line: "var(--c-line)",
  surface: "var(--c-surface)",
  surfaceDeep: "var(--c-surface-deep)",
  surfaceBorder: "var(--c-surface-border)",
  inputBg: "var(--c-input-bg)",
  inputBorder: "var(--c-input-border)",
  inputText: "var(--c-input-text)",
  error: "var(--c-error)",
};

export const GRADIENT_CTA =
  "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)";

export const containerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 760,
  margin: "0 auto",
  padding: "0 20px",
  boxSizing: "border-box",
};

export const h1Style: CSSProperties = {
  fontFamily: FONT_SERIF,
  fontWeight: 400,
  fontSize: "clamp(2.1rem, 7vw, 3.25rem)",
  color: colors.title,
  lineHeight: 1.1,
  letterSpacing: "-0.01em",
  margin: 0,
};

export const h2Style: CSSProperties = {
  fontFamily: FONT_SERIF,
  fontWeight: 400,
  fontSize: "clamp(1.6rem, 5vw, 2.1rem)",
  color: colors.title,
  lineHeight: 1.15,
  margin: "0 0 20px",
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
  fontFamily: FONT_SERIF,
  color: colors.accent,
  fontStyle: "italic",
};

export const linkStyle: CSSProperties = {
  color: colors.link,
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

export const cardStyle: CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.surfaceBorder}`,
  borderRadius: 24,
  padding: "28px 22px",
  boxShadow: "var(--c-shadow)",
};

export const smallCardStyle: CSSProperties = {
  background: colors.surfaceDeep,
  border: `1px solid ${colors.surfaceBorder}`,
  borderRadius: 16,
  padding: "18px 18px",
};

// Petit trait terracotta au-dessus des titres de section (décoratif).
function Trait() {
  return <span aria-hidden="true" className="cl-trait" />;
}

// Halo d'ambiance des pages secondaires, en haut de page (décoratif).
export function Halo() {
  return <div aria-hidden="true" className="cercle-halo" />;
}

// En-tête sobre des pages secondaires (conditions, confidentialité…).
export function SimpleHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header style={{ position: "relative", zIndex: 1 }} className="pt-10 pb-10 md:pt-14 md:pb-12">
      <div style={containerStyle}>
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
        style={{ ...h2Style, fontSize: "clamp(1.35rem, 4vw, 1.6rem)", margin: "0 0 14px" }}
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

const footerLinkStyle: CSSProperties = {
  fontSize: "0.9375rem",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  display: "inline-block",
  padding: "6px 2px",
};

export function CercleFooter() {
  return (
    <footer className="cercle-footer">
      <nav aria-label="Informations du Cercle">
        <ul
          style={{
            listStyle: "none",
            margin: "0 auto",
            padding: 0,
            maxWidth: 760,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px 22px",
          }}
        >
          {footerLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} style={footerLinkStyle}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <p
        style={{
          fontSize: "0.875rem",
          color: colors.muted,
          textAlign: "center",
          margin: "14px auto 0",
          maxWidth: 760,
        }}
      >
        {"Si ça devient trop lourd : "}
        <a href="tel:3114" style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>
          3114
        </a>
        {", jour et nuit."}
      </p>
    </footer>
  );
}
