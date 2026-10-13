// Le Cercle — petit verre décoratif des quatre rencontres, dans l'esprit
// de l'accueil (« quand le verre est déjà presque plein… »).
// 1 : il se remplit · 2 : plein, une goutte au-dessus · 3 : il a
// débordé, une trace sur le côté et au pied · 4 : le niveau est de
// nouveau sous le bord, avec de la marge. Purement décoratif (aria-hidden).

type Etape = 1 | 2 | 3 | 4;

// Hauteur de l'eau (en unités du dessin, le fond du verre est à y = 50).
const NIVEAU: Record<Etape, number> = { 1: 34, 2: 8, 3: 8, 4: 24 };

const TRAIT = "rgba(240,230,214,0.55)";
const EAU = "rgba(201,123,106,0.62)";

export function Verre({ etape }: { etape: Etape }) {
  const id = `verre-${etape}`;
  const y = NIVEAU[etape];
  return (
    <svg
      width="44"
      height="60"
      viewBox="0 0 44 60"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={id}>
          <path d="M9 8 L35 8 L31.5 50 L12.5 50 Z" />
        </clipPath>
      </defs>
      {/* eau */}
      <rect
        x="0"
        y={y}
        width="44"
        height={50 - y}
        fill={EAU}
        clipPath={`url(#${id})`}
      />
      {/* contour du verre */}
      <path
        d="M9 8 L35 8 L31.5 50 L12.5 50 Z"
        fill="none"
        stroke={TRAIT}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {etape === 2 && (
        // la dernière goutte, juste au-dessus du bord
        <path d="M22 0.5 C24.2 3.4 25 4.8 25 6 A3 3 0 0 1 19 6 C19 4.8 19.8 3.4 22 0.5 Z" fill={EAU} />
      )}
      {etape === 3 && (
        <>
          {/* coulure sur le côté et flaque au pied */}
          <path
            d="M35 8 C36.5 14 35.6 22 36.4 30 C37 38 36.2 46 37.4 54"
            fill="none"
            stroke={EAU}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <ellipse cx="30" cy="55.5" rx="12" ry="2.2" fill={EAU} />
        </>
      )}
    </svg>
  );
}
