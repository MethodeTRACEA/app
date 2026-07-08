"use client";

import { useEffect, useRef, useState } from "react";

interface TraceCrestProps {
  seed: string;
}

// Espace de coordonnées = pixels natifs de trace-clear.webp (1024×1535).
// Le SVG utilise ce viewBox + preserveAspectRatio="xMidYMid slice", exactement
// comme l'object-cover de la photo — les points restent calés sur le sentier
// réel quel que soit le viewport.
const IMG_WIDTH = 1024;
const IMG_HEIGHT = 1535;

// Le sentier réellement visible sur trace-clear.webp (nouvelle photo), du bas
// de l'image jusqu'à la zone où il se perd dans l'ombre de la colline, vers
// la crête. Recalé au pixel (zoom sur crops) le 2026-07-07 sur la nouvelle
// photo — À AJUSTER À L'ŒIL avec Alyson en local (/dev-trace), première estimation.
const TRAIL_POINTS: [number, number][] = [
  [599, 1518],
  [635, 1410],
  [543, 1301],
  [614, 1201],
  [522, 1092],
  [579, 992],
  [583, 843],
];

const POINT_BEGIN_S = 6; // la lumière part une fois le fondu bien avancé
const POINT_DURATION_S = 10; // durée de la remontée du point
const TRAIL_REVEAL_MS = POINT_DURATION_S * 1000;
const TRAIL_RESTING_OPACITY = 0.18;

// Catmull-Rom → cubic bezier, pour un tracé lissé passant par tous les points.
function pointsToPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  const d: string[] = [`M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(
      `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
    );
  }
  return d.join(" ");
}

const trailD = pointsToPath(TRAIL_POINTS);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TraceCrest({ seed }: TraceCrestProps) {
  // `seed` n'est plus utilisé : on a abandonné le tracé génératif au profit
  // d'un sentier calé à la main sur la photo réelle. Conservé dans la
  // signature pour ne pas toucher l'appel dans session/page.tsx.
  const trailPathRef = useRef<SVGPathElement>(null);
  const [trailLength, setTrailLength] = useState<number | null>(null);
  const [revealTrail, setRevealTrail] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (trailPathRef.current) {
      setTrailLength(trailPathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setRevealTrail(true);
      return;
    }
    if (trailLength === null) return;
    const timer = setTimeout(() => setRevealTrail(true), POINT_BEGIN_S * 1000);
    return () => clearTimeout(timer);
  }, [trailLength, reducedMotion]);

  return (
    <svg
      viewBox={`0 0 ${IMG_WIDTH} ${IMG_HEIGHT}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0 }}
    >
      <defs>
        <filter id="trace-crest-point-blur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* Traînée — révélée progressivement, laissée très légère ensuite */}
      <path
        id="trace-crest-trail"
        ref={trailPathRef}
        d={trailD}
        stroke="#FFE8C9"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        style={{
          mixBlendMode: "screen",
          opacity: TRAIL_RESTING_OPACITY,
          strokeDasharray: trailLength ?? 1,
          strokeDashoffset: revealTrail ? 0 : trailLength ?? 1,
          transition: reducedMotion ? "none" : `stroke-dashoffset ${TRAIL_REVEAL_MS}ms ease-in-out`,
        }}
      />

      {/* Point de lumière — remonte le sentier, se fond dans la crête à l'arrivée */}
      {!reducedMotion && (
        <g opacity={0} style={{ mixBlendMode: "screen" }}>
          <animateMotion
            dur={`${POINT_DURATION_S}s`}
            begin={`${POINT_BEGIN_S}s`}
            fill="freeze"
            rotate="auto"
          >
            <mpath href="#trace-crest-trail" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.06;0.82;1"
            dur={`${POINT_DURATION_S}s`}
            begin={`${POINT_BEGIN_S}s`}
            fill="freeze"
          />
          <circle r={16} fill="#FFE8C9" opacity={0.3} filter="url(#trace-crest-point-blur)" />
          <circle r={6} fill="#FFE8C9" />
        </g>
      )}
    </svg>
  );
}
