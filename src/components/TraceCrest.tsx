"use client";

import { useEffect, useRef, useState } from "react";

interface TraceCrestProps {
  seed: string;
}

const WIDTH = 800;
const HEIGHT = 1000;
const PATH_ANIMATION_MS = 12000;

// Bande horizontale (ratio de largeur) où peut démarrer le chemin, en bas du cadre.
const TRAIL_START_X_MIN = 0.35;
const TRAIL_START_X_MAX = 0.65;

// Bande horizontale (ratio de hauteur) où le chemin doit se terminer, calée sur la
// ligne de crête visible de la photo de fond. À ajuster visuellement une fois la
// photo en place.
const TRAIL_END_Y_MIN = 0.42;
const TRAIL_END_Y_MAX = 0.50;

// FNV-1a 32-bit — hash simple et déterministe d'une chaîne.
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// mulberry32 — PRNG seedé, rapide et suffisant pour un tracé décoratif.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

// Le chemin en lacets, du bas du cadre jusqu'à la crête de la photo.
function buildTrailPoints(rand: () => number): [number, number][] {
  const startXRatio = TRAIL_START_X_MIN + rand() * (TRAIL_START_X_MAX - TRAIL_START_X_MIN);
  const targetXRatio = 0.35 + rand() * 0.30;
  const targetYRatio = TRAIL_END_Y_MIN + rand() * (TRAIL_END_Y_MAX - TRAIL_END_Y_MIN);

  const bendCount = 4 + Math.floor(rand() * 3); // 4 à 6 lacets
  const startX = WIDTH * startXRatio;
  const startY = HEIGHT;
  const targetX = WIDTH * targetXRatio;
  const targetY = HEIGHT * targetYRatio;

  const points: [number, number][] = [[startX, startY]];
  for (let i = 1; i <= bendCount; i++) {
    const t = i / (bendCount + 1);
    const y = startY + (targetY - startY) * t;
    const baseX = startX + (targetX - startX) * t;
    // Lacets plus amples en bas (t petit), plus resserrés en haut (t grand) — perspective.
    const amplitude = WIDTH * (0.05 + 0.16 * (1 - t));
    const dir = i % 2 === 0 ? 1 : -1;
    const wiggle = dir * amplitude * (0.55 + rand() * 0.45);
    points.push([baseX + wiggle, y]);
  }
  points.push([targetX, targetY]);
  return points;
}

export function TraceCrest({ seed }: TraceCrestProps) {
  const mainPathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState<number | null>(null);
  const [animatePath, setAnimatePath] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rand = mulberry32(fnv1a(seed));
  const trailD = pointsToPath(buildTrailPoints(rand));

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (mainPathRef.current) {
      setPathLength(mainPathRef.current.getTotalLength());
    }
  }, [trailD]);

  useEffect(() => {
    if (reducedMotion) {
      setAnimatePath(true);
      return;
    }
    if (pathLength === null) return;
    const raf = requestAnimationFrame(() => setAnimatePath(true));
    return () => cancelAnimationFrame(raf);
  }, [pathLength, reducedMotion]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0 }}
    >
      {/* Halo — le fil de lumière élargi */}
      <path
        d={trailD}
        stroke="#F5DCC8"
        strokeWidth={17}
        strokeLinecap="round"
        fill="none"
        style={{
          mixBlendMode: "screen",
          opacity: 0.3,
          strokeDasharray: pathLength ?? 1,
          strokeDashoffset: animatePath ? 0 : pathLength ?? 1,
          transition: reducedMotion ? "none" : `stroke-dashoffset ${PATH_ANIMATION_MS}ms ease-in-out`,
        }}
      />

      {/* Trait principal — le fil de lumière net */}
      <path
        ref={mainPathRef}
        d={trailD}
        stroke="#F5DCC8"
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
        style={{
          mixBlendMode: "screen",
          strokeDasharray: pathLength ?? 1,
          strokeDashoffset: animatePath ? 0 : pathLength ?? 1,
          transition: reducedMotion ? "none" : `stroke-dashoffset ${PATH_ANIMATION_MS}ms ease-in-out`,
        }}
      />
    </svg>
  );
}
