"use client";

import Link from "next/link";

// Rendu partagé du bloc "Ce qui revient souvent" + émotion récurrente,
// utilisé par RefletCompact (accueil, historique) en mode "compact" et par
// /app/ce-qui-change en mode "complet". Composant de présentation pur :
// la lecture des données (recurring_patterns, common_triggers, émotion
// récurrente) reste dans chaque appelant, propre à son propre chargement
// de page. Aucun wording n'est modifié par rapport aux deux implémentations
// d'origine — seule la duplication de JSX est supprimée (Chantier 58, P1).

export type ReflectRecurrentProps = {
  mode: "compact" | "complet";
  items: string[];
  recurringEmotion: { emotion: string; count: number } | null;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ReflectRecurrent({ mode, items, recurringEmotion }: ReflectRecurrentProps) {
  if (items.length === 0 && !recurringEmotion) return null;

  if (mode === "compact") {
    const blockStyle: React.CSSProperties = {
      background: "rgba(111,106,100,0.15)",
      border: "1px solid rgba(240,230,214,0.085)",
      borderRadius: 22,
      padding: "22px 24px",
      boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
    };
    const kickerStyle: React.CSSProperties = {
      fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
      fontSize: 11,
      fontWeight: 400,
      color: "#C97B6A",
      letterSpacing: "0.20em",
      textTransform: "uppercase" as const,
      marginBottom: 12,
    };
    const textStyle: React.CSSProperties = {
      fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
      fontSize: "1rem",
      fontWeight: 300,
      color: "rgba(240,230,214,0.88)",
      lineHeight: 1.55,
    };
    const listItemStyle: React.CSSProperties = { ...textStyle, display: "flex", gap: 10 };

    return (
      <div style={blockStyle}>
        {items.length > 0 && (
          <>
            <p className="font-sans" style={kickerStyle}>
              Ce qui revient souvent
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((item, i) => (
                <li key={`reflet-${i}`} style={listItemStyle}>
                  <span style={{ color: "#C97B6A", flexShrink: 0 }} aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {recurringEmotion && (
          <div style={{ marginTop: items.length > 0 ? 14 : 0 }}>
            <p className="font-sans" style={kickerStyle}>
              Tu nommes souvent
            </p>
            <p className="font-body" style={textStyle}>
              {recurringEmotion.emotion}
            </p>
          </div>
        )}

        <Link
          href="/app/ce-qui-change"
          className="font-sans"
          style={{
            display: "inline-block",
            marginTop: 16,
            fontSize: 13,
            color: "rgba(240,230,214,0.60)",
            letterSpacing: "0.04em",
            textDecoration: "none",
          }}
        >
          Voir ton reflet ›
        </Link>
      </div>
    );
  }

  // ── mode === "complet" ──────────────────────────────────────────
  const blockStyle: React.CSSProperties = {
    background: "rgba(111,106,100,0.18)",
    border: "1px solid rgba(240,230,214,0.10)",
    borderRadius: 24,
    padding: "28px 26px",
    boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
  };
  const kickerStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
    fontSize: 12,
    fontWeight: 400,
    color: "#C97B6A",
    letterSpacing: "0.20em",
    textTransform: "uppercase" as const,
    marginBottom: 18,
  };
  const blockTextStyle: React.CSSProperties = {
    fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
    fontSize: "1.05rem",
    fontWeight: 300,
    color: "#F0E6D6",
    lineHeight: 1.6,
  };
  const listStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
    margin: "16px 0 0 0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };
  const listItemStyle: React.CSSProperties = {
    fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
    fontSize: "1.05rem",
    fontWeight: 300,
    color: "rgba(240,230,214,0.88)",
    lineHeight: 1.5,
    display: "flex",
    gap: 10,
  };
  const bulletStyle: React.CSSProperties = { color: "#C97B6A", flexShrink: 0, lineHeight: 1.5 };

  return (
    <>
      {items.length > 0 && (
        <div style={blockStyle}>
          <p className="font-sans" style={kickerStyle}>
            Ce qui revient souvent
          </p>
          <p className="font-body" style={blockTextStyle}>
            Dans tes dernières traversées, certaines choses apparaissent
            plusieurs fois.
          </p>
          <ul style={listStyle}>
            {items.map((item, i) => (
              <li key={`b1-${i}`} style={listItemStyle}>
                <span style={bulletStyle} aria-hidden="true">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recurringEmotion && (
        <div style={blockStyle}>
          <p className="font-body" style={blockTextStyle}>
            {capitalize(recurringEmotion.emotion)} revient dans plusieurs traversées.
          </p>
        </div>
      )}
    </>
  );
}
