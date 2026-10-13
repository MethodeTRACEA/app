import type { CSSProperties, ReactNode } from "react";

// ===================================================================
// Le Cercle TRACÉA en ligne — habillage commun des pages /cercle/*
//
// Univers sombre du site (réf. articles), volontairement sobre.
// Isolement : aucun lien vers l'application, aucun traceur.
// Les liens du pied de page sont des <a> simples (rechargement complet)
// et non des <Link> Next : une page du Cercle ne doit jamais hériter
// d'un script de mesure chargé sur une autre page du site.
// ===================================================================

export const colors = {
  bg: "#1A120D",
  title: "#F5EFE6",
  heading: "#F0E6D6",
  body: "rgba(240,230,214,0.84)",
  muted: "rgba(240,230,214,0.66)",
  link: "#E0A893",
  line: "rgba(240,230,214,0.12)",
  surface: "rgba(46,40,37,0.55)",
};

export const pageStyle: CSSProperties = {
  flex: 1,
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  background:
    "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.10) 0%, transparent 60%), " +
    colors.bg,
};

export const containerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 680,
  margin: "0 auto",
  padding: "56px 20px 64px",
  boxSizing: "border-box",
};

export const h1Style: CSSProperties = {
  fontFamily: "'DM Serif Display', Georgia, serif",
  fontWeight: 400,
  fontSize: "clamp(1.85rem, 6vw, 2.5rem)",
  color: colors.title,
  lineHeight: 1.2,
  margin: 0,
};

export const h2Style: CSSProperties = {
  fontFamily: "'DM Serif Display', Georgia, serif",
  fontWeight: 400,
  fontSize: "clamp(1.3rem, 4vw, 1.55rem)",
  color: colors.heading,
  lineHeight: 1.3,
  margin: "44px 0 14px",
};

export const pStyle: CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "1.0625rem",
  lineHeight: 1.75,
  color: colors.body,
  margin: "0 0 16px",
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
    <section aria-labelledby={id ? `${id}-titre` : undefined}>
      <h2 id={id ? `${id}-titre` : undefined} style={h2Style}>
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
        padding: "28px 20px 36px",
      }}
    >
      <nav aria-label="Informations du Cercle">
        <ul
          style={{
            listStyle: "none",
            margin: "0 auto",
            padding: 0,
            maxWidth: 680,
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
                  fontFamily: "'DM Sans', system-ui, sans-serif",
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
    </footer>
  );
}
