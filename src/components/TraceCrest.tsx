"use client";

import { useEffect, useRef, useState } from "react";

interface TraceCrestProps {
  seed: string;
}

const WIDTH = 800;
const HEIGHT = 300;
const MIN_POINTS = 7;
const MAX_POINTS = 9;
const ANIMATION_MS = 7000;

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

function buildPoints(rand: () => number): [number, number][] {
  const count = MIN_POINTS + Math.floor(rand() * (MAX_POINTS - MIN_POINTS + 1));
  const startY = HEIGHT * 0.70;
  const endY = HEIGHT * 0.45;
  const peakXRatio = 0.40 + rand() * 0.25; // sommet entre 40 % et 65 % de la largeur
  const peakIndex = Math.max(1, Math.min(count - 2, Math.round(peakXRatio * (count - 1))));
  const peakY = HEIGHT * (0.12 + rand() * 0.06);

  const points: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const x = (WIDTH * i) / (count - 1);
    let y: number;
    if (i === 0) {
      y = startY;
    } else if (i === count - 1) {
      y = endY;
    } else if (i === peakIndex) {
      y = peakY;
    } else {
      const t = i / (count - 1);
      y = startY + (endY - startY) * t;
      const rippleRange = HEIGHT * (0.08 + rand() * 0.04); // micro-relief ±8-12 %
      y += (rand() * 2 - 1) * rippleRange;
    }
    points.push([x, y]);
  }
  return points;
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

export function TraceCrest({ seed }: TraceCrestProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState<number | null>(null);
  const [animate, setAnimate] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const pathD = pointsToPath(buildPoints(mulberry32(fnv1a(seed))));

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [pathD]);

  useEffect(() => {
    if (pathLength === null) return;
    if (reducedMotion) {
      setAnimate(true);
      return;
    }
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [pathLength, reducedMotion]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      style={{ maxWidth: 480, overflow: "visible" }}
      fill="none"
      aria-hidden="true"
      className="text-terra"
    >
      <path
        ref={pathRef}
        d={pathD}
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: pathLength ?? 1,
          strokeDashoffset: animate ? 0 : pathLength ?? 1,
          transition: reducedMotion ? "none" : `stroke-dashoffset ${ANIMATION_MS}ms ease-out`,
          filter: "drop-shadow(0 0 6px rgba(196,112,74,0.18))",
        }}
      />
    </svg>
  );
}
