"use client";

import { useEffect, useRef, useState } from "react";

interface TraceCrestProps {
  seed: string;
}

const WIDTH = 800;
const HEIGHT = 1000;
const PATH_ANIMATION_MS = 12000;
const SCENE_FADE_MS = 900;

// FNV-1a 32-bit — hash simple et déterministe d'une chaîne.
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// mulberry32 — PRNG seedé, rapide et suffisant pour une scène décorative.
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

interface HillSpec {
  count: number;
  peakXRatio: number;
  peakYRatio: number;
  baseYRatio: number;
  rippleRatio: number;
}

// Ligne de crête d'une colline (réutilise le principe du générateur de crête d'origine).
function buildHillLine(rand: () => number, spec: HillSpec): [number, number][] {
  const { count, peakXRatio, peakYRatio, baseYRatio, rippleRatio } = spec;
  const baseY = HEIGHT * baseYRatio;
  const peakY = HEIGHT * peakYRatio;
  const peakIndex = Math.max(1, Math.min(count - 2, Math.round(peakXRatio * (count - 1))));

  const points: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const x = (WIDTH * i) / (count - 1);
    let y: number;
    if (i === 0 || i === count - 1) {
      y = baseY;
    } else if (i === peakIndex) {
      y = peakY;
    } else {
      const spread = Math.max(peakIndex, count - 1 - peakIndex) || 1;
      const t = Math.abs(i - peakIndex) / spread;
      y = peakY + (baseY - peakY) * t;
      y += (rand() * 2 - 1) * (HEIGHT * rippleRatio);
    }
    points.push([x, y]);
  }
  return points;
}

// Forme pleine fermée jusqu'au bas du viewBox, à partir d'une ligne de crête.
function hillFillPath(points: [number, number][]): string {
  return `${pointsToPath(points)} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;
}

// Le chemin en lacets, du bas du viewBox jusqu'à la lueur sur la crête.
function buildTrailPoints(
  rand: () => number,
  startXRatio: number,
  targetXRatio: number,
  targetYRatio: number
): [number, number][] {
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
  const [sceneVisible, setSceneVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rand = mulberry32(fnv1a(seed));

  const glowXRatio = 0.35 + rand() * 0.30; // lueur entre 35 % et 65 % de largeur
  const glowYRatio = 0.30;

  const backHill = buildHillLine(rand, {
    count: 6 + Math.floor(rand() * 3),
    peakXRatio: glowXRatio,
    peakYRatio: glowYRatio,
    baseYRatio: 0.55,
    rippleRatio: 0.02,
  });
  const frontHill = buildHillLine(rand, {
    count: 6 + Math.floor(rand() * 3),
    peakXRatio: 0.20 + rand() * 0.6,
    peakYRatio: 0.55 + rand() * 0.10,
    baseYRatio: 0.78,
    rippleRatio: 0.03,
  });

  const pathStartXRatio = 0.35 + rand() * 0.30; // zone centrale
  const trailD = pointsToPath(buildTrailPoints(rand, pathStartXRatio, glowXRatio, glowYRatio + 0.02));

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
      setSceneVisible(true);
      setAnimatePath(true);
      return;
    }
    const raf = requestAnimationFrame(() => setSceneVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  useEffect(() => {
    if (pathLength === null || reducedMotion) return;
    const raf = requestAnimationFrame(() => setAnimatePath(true));
    return () => cancelAnimationFrame(raf);
  }, [pathLength, reducedMotion]);

  const glowCx = WIDTH * glowXRatio;
  const glowCy = HEIGHT * glowYRatio;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      style={{ maxWidth: 340, height: "auto" }}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="trace-crest-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0D5C4" />
          <stop offset="45%" stopColor="#B87A4E" />
          <stop offset="100%" stopColor="#231916" />
        </linearGradient>
        <radialGradient id="trace-crest-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D6A56A" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#D6A56A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#trace-crest-sky)" />

      <g
        style={{
          opacity: sceneVisible ? 1 : 0,
          transition: reducedMotion ? "none" : `opacity ${SCENE_FADE_MS}ms ease-out`,
        }}
      >
        <circle cx={glowCx} cy={glowCy} r={WIDTH * 0.22} fill="url(#trace-crest-glow)" />
        <path d={hillFillPath(backHill)} fill="#6E4332" />
        <path d={hillFillPath(frontHill)} fill="#231916" />
      </g>

      {/* Halo du chemin */}
      <path
        d={trailD}
        stroke="#D6A56A"
        strokeWidth={14}
        strokeLinecap="round"
        fill="none"
        style={{
          opacity: 0.22,
          strokeDasharray: pathLength ?? 1,
          strokeDashoffset: animatePath ? 0 : pathLength ?? 1,
          transition: reducedMotion ? "none" : `stroke-dashoffset ${PATH_ANIMATION_MS}ms ease-in-out`,
        }}
      />

      {/* Trait principal du chemin */}
      <path
        ref={mainPathRef}
        d={trailD}
        stroke="#F0D5C4"
        strokeWidth={5.5}
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: pathLength ?? 1,
          strokeDashoffset: animatePath ? 0 : pathLength ?? 1,
          transition: reducedMotion ? "none" : `stroke-dashoffset ${PATH_ANIMATION_MS}ms ease-in-out`,
        }}
      />
    </svg>
  );
}
