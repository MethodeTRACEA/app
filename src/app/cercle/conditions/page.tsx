import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Section, SimpleHeader, containerStyle, linkStyle, pStyle } from "../_ui";
import { CERCLE_EMAIL, CONDITIONS, CONDITIONS_TITRE } from "@/lib/cercle/textes";

// Le Cercle TRACÉA en ligne — conditions d'inscription.
// Texte d'Alyson (13 oct. 2026), mot pour mot, lu depuis
// src/lib/cercle/textes.ts : la même source sert au PDF joint à l'email
// de confirmation. Les intitulés de paragraphe sont des titres de section.
export const metadata: Metadata = {
  title: "Conditions d'inscription · Le Cercle TRACÉA en ligne",
  description:
    "Les conditions d'inscription au Cercle TRACÉA en ligne : créneaux, tarif, rétractation, remboursements.",
};

// Liens posés sur certains mots du texte (le texte lui-même ne change pas).
const LIENS: { mot: string; rendu: () => ReactNode }[] = [
  {
    mot: "Renoncer au contrat ici",
    rendu: () => (
      <a href="/cercle/renoncer" style={linkStyle}>
        {"Renoncer au contrat ici"}
      </a>
    ),
  },
  {
    mot: "www.cm2c.net",
    rendu: () => (
      <a href="https://www.cm2c.net" target="_blank" rel="noopener noreferrer" style={linkStyle}>
        www.cm2c.net
      </a>
    ),
  },
  {
    mot: CERCLE_EMAIL,
    rendu: () => (
      <a href={`mailto:${CERCLE_EMAIL}`} style={linkStyle}>
        {CERCLE_EMAIL}
      </a>
    ),
  },
];

function avecLiens(texte: string): ReactNode[] {
  let morceaux: ReactNode[] = [texte];
  for (const lien of LIENS) {
    morceaux = morceaux.flatMap((m) => {
      if (typeof m !== "string" || !m.includes(lien.mot)) return [m];
      const parts = m.split(lien.mot);
      return parts.flatMap((p, i) => (i < parts.length - 1 ? [p, lien.rendu()] : [p]));
    });
  }
  return morceaux.map((m, i) => (typeof m === "string" ? m : <span key={i}>{m}</span>));
}

export default function CercleConditionsPage() {
  return (
    <>
      <SimpleHeader title={CONDITIONS_TITRE} />
      <div style={{ ...containerStyle, paddingBottom: 80 }}>
        {CONDITIONS.map((s) => (
          <Section key={s.id} id={s.id} title={s.titre}>
            {s.paragraphes.map((p) => (
              <p key={p} style={pStyle}>
                {avecLiens(p)}
              </p>
            ))}
          </Section>
        ))}
      </div>
    </>
  );
}
