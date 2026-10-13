import type { CSSProperties } from "react";
import Image from "next/image";

// Visuels décoratifs de la page de présentation du Cercle. Tous en
// aria-hidden : ils n'ajoutent aucun texte. Couleurs via les variables
// de cercle.css (thème nuit ou aube).

// ── Le verre des quatre rencontres ──────────────────────────────────
// 1 : il se remplit · 2 : plein, une goutte au-dessus · 3 : il a
// débordé, une coulure et une flaque au pied · 4 : le niveau est de
// nouveau sous le bord, avec de la marge (validé par Alyson).
// L'eau « monte » à l'arrivée à l'écran (cercle.css, .gv-eau).

type Etape = 1 | 2 | 3 | 4;
const NIVEAU: Record<Etape, number> = { 1: 34, 2: 8, 3: 8, 4: 24 };

export function GrandVerre({ etape }: { etape: Etape }) {
  const id = `gv-clip-${etape}`;
  const y = NIVEAU[etape];
  const delai = { "--i": etape - 1 } as CSSProperties;
  return (
    <svg
      className="gv"
      viewBox="0 0 44 60"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <clipPath id={id}>
          <path d="M9 8 L35 8 L31.5 50 L12.5 50 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect className="gv-eau" style={delai} x="0" y={y} width="44" height={50 - y} />
      </g>
      <path
        className="gv-contour"
        d="M9 8 L35 8 L31.5 50 L12.5 50 Z"
        fill="none"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {etape === 2 && (
        <path
          className="gv-goutte"
          style={delai}
          d="M22 0.5 C24.2 3.4 25 4.8 25 6 A3 3 0 0 1 19 6 C19 4.8 19.8 3.4 22 0.5 Z"
        />
      )}
      {etape === 3 && (
        <>
          <path
            className="gv-coulure"
            style={delai}
            d="M35 8 C36.5 14 35.6 22 36.4 30 C37 38 36.2 46 37.4 54"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <ellipse className="gv-flaque" style={delai} cx="30" cy="55.5" rx="12" ry="2.2" />
        </>
      )}
    </svg>
  );
}

// ── Le cercle de douze (ouverture) ─────────────────────────────────
// Douze points posés en cercle : douze places au plus, en écho au nom.
export function CercleDeDouze() {
  const points = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { x: 160 + Math.cos(a) * 118, y: 160 + Math.sin(a) * 118 };
  });
  return (
    <svg className="cl-douze" viewBox="0 0 320 320" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="cd-lueur">
          <stop offset="0%" stopColor="var(--c-halo)" />
          <stop offset="100%" stopColor="var(--c-halo)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="160" r="96" fill="url(#cd-lueur)" />
      <circle className="cd-anneau" cx="160" cy="160" r="118" fill="none" strokeWidth="1" />
      {points.map((p, i) => (
        <circle
          key={i}
          className="cd-point"
          style={{ "--i": i } as CSSProperties}
          cx={p.x.toFixed(2)}
          cy={p.y.toFixed(2)}
          r="7"
        />
      ))}
    </svg>
  );
}

// ── Photo d'Alyson ──────────────────────────────────────────────────
// Photo fournie par Alyson (13/10/2026), recadrée en 4:5 et optimisée en
// WebP (880 x 1100, 64 Ko). next/image la redimensionne selon l'écran.
// Mettre null pour revenir à l'emplacement neutre.
export const PHOTO_ALYSON: string | null = "/images/cercle/alyson.webp";

export function PhotoAnimatrice() {
  if (!PHOTO_ALYSON) {
    return <div className="cl-photo cl-photo--vide" aria-hidden="true" />;
  }
  return (
    <div className="cl-photo">
      <Image
        src={PHOTO_ALYSON}
        alt="Alyson, qui anime le Cercle"
        fill
        sizes="(min-width: 900px) 380px, 90vw"
        style={{ objectFit: "cover", objectPosition: "50% 30%" }}
      />
    </div>
  );
}
