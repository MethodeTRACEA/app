import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Articles TRACÉA : comprendre et traverser ses émotions",
  description:
    "Des articles simples et concrets pour comprendre ce qui se passe quand une émotion déborde, et savoir quoi faire dans le moment. Pas une thérapie.",
};

// ── Liste des articles ──
// Pour ajouter un article plus tard : ajouter un objet ici (href, title,
// description). L'ordre d'affichage suit l'ordre de ce tableau.
const articles = [
  {
    href: "/articles/systeme-nerveux-explique-simplement",
    title: "Ton système nerveux, expliqué simplement",
    description:
      'On te dit de "réguler ton système nerveux" sans jamais expliquer ce que ça veut dire. Voici, en langage de tous les jours, ce que c\'est et des appuis quand ça déborde.',
  },
  {
    href: "/articles/submerge-par-ses-emotions-que-faire",
    title: "Quand une émotion te submerge : que faire dans le moment",
    description:
      "La colère qui monte, l'angoisse qui serre, le trop-plein qui déborde sans prévenir. Ce qui se passe, et un geste concret à poser tout de suite.",
  },
  {
    href: "/articles/etre-a-fleur-de-peau-hypersensibilite",
    title: "Être à fleur de peau : comprendre l'hypersensibilité au quotidien",
    description:
      "Tu ressens tout plus fort, le moindre imprévu te fait déborder ? Ce que c'est vraiment, et des appuis pour les moments où ça monte.",
  },
  {
    href: "/articles/charge-mentale-plus-aucune-marge",
    title: "Charge mentale : quand il n'y a plus aucune marge",
    description:
      "Tu penses à tout, tout le temps, et il ne te reste plus aucune marge ? Ce que c'est vraiment, et des appuis pour les moments où ça déborde.",
  },
  {
    href: "/articles/ruminer-la-nuit-mental-en-boucle",
    title: "Ruminer la nuit : quand le mental ne s'arrête pas",
    description:
      "Il est tard, tout dort, et ton cerveau repasse tout en boucle ? Pourquoi le mental s'emballe la nuit, et des appuis quand il ne lâche pas.",
  },
  {
    href: "/articles/ne-pas-repondre-a-chaud",
    title: "Ne pas répondre à chaud : avant d'envoyer ce message",
    description:
      "Le pouce au-dessus du bouton envoyer, l'envie de répondre cash ? Pourquoi on réagit si vite, et un appui avant d'envoyer ce qu'on regrettera.",
  },
  {
    href: "/articles/colere-qui-monte-que-faire",
    title: "La colère qui monte d'un coup : que faire dans l'instant",
    description:
      "La chaleur qui monte, la mâchoire serrée, l'envie de tout envoyer balader ? Pourquoi la colère n'est pas ton ennemie, et un appui quand elle déborde.",
  },
];

// ── Habillage visuel : univers sombre chaleureux (réf. page Ressources / articles) ──
const pageStyle: CSSProperties = {
  minHeight: "100dvh",
  position: "relative",
  background:
    "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
    "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%), " +
    "#1A120D",
};

const haloStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(circle at 50% 14%, rgba(201,123,106,0.07) 0%, transparent 52%)",
};

const containerStyle: CSSProperties = {
  maxWidth: 680,
  margin: "0 auto",
  padding: "72px 20px 96px",
  position: "relative",
  zIndex: 1,
};

const eyebrowStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  fontWeight: 400,
  letterSpacing: "0.20em",
  textTransform: "uppercase",
  color: "#C97B6A",
  margin: 0,
};

const h1Style: CSSProperties = {
  fontSize: "clamp(1.9rem, 5.5vw, 2.6rem)",
  color: "#F5EFE6",
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
  margin: "14px 0 0",
};

const chapoStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "1.0625rem",
  lineHeight: 1.7,
  color: "rgba(240,230,214,0.72)",
  margin: "18px auto 0",
  maxWidth: 560,
};

const cardStyle: CSSProperties = {
  background: "rgba(111,106,100,0.18)",
  border: "1px solid rgba(240,230,214,0.10)",
  borderRadius: 20,
  padding: "26px 26px",
  boxShadow:
    "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
  display: "flex",
  alignItems: "flex-start",
  gap: 18,
};

const cardTitleStyle: CSSProperties = {
  fontSize: "clamp(1.2rem, 3.2vw, 1.45rem)",
  color: "#F0E6D6",
  lineHeight: 1.3,
  margin: 0,
};

const cardDescStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "1rem",
  lineHeight: 1.7,
  color: "rgba(240,230,214,0.72)",
  margin: "10px 0 0",
};

const chevronStyle: CSSProperties = {
  color: "#C97B6A",
  fontSize: 26,
  lineHeight: 1.2,
  flexShrink: 0,
};

export default function ArticlesIndex() {
  return (
    <div style={pageStyle}>
      <div style={haloStyle} aria-hidden="true" />

      <div style={containerStyle}>
        <header style={{ textAlign: "center", marginBottom: 44 }}>
          <p className="font-sans" style={eyebrowStyle}>
            À lire
          </p>
          <h1 className="font-serif" style={h1Style}>
            Comprendre ce que tu traverses
          </h1>
          <p style={chapoStyle}>
            {`Des mots simples sur ce qui se passe quand une émotion déborde, et des appuis concrets pour ces moments-là. Pas de théorie, pas de jargon. Juste de quoi t'y retrouver.`}
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {articles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="block transition-transform duration-200 hover:-translate-y-0.5"
              style={{ textDecoration: "none" }}
            >
              <article style={cardStyle}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="font-serif" style={cardTitleStyle}>
                    {article.title}
                  </h2>
                  <p style={cardDescStyle}>{article.description}</p>
                </div>
                <span style={chevronStyle} aria-hidden="true">
                  ›
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
