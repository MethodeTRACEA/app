"use client";

import { useState, useEffect } from "react";

interface GazeGuideProps {
  onComplete: () => void;
}

// ── Machine d'état ─────────────────────────────────────────
// pre (2s) → lift (5s) → settle-1 (5s) → settle-2 (5s)
//         → open-1 (4s) → open-2 (6s)  → close (manuel)
type Phase =
  | "pre"
  | "lift"
  | "settle-1"
  | "settle-2"
  | "open-1"
  | "open-2"
  | "close";

const PHASE_SEQUENCE: Phase[] = [
  "pre", "lift", "settle-1", "settle-2", "open-1", "open-2", "close",
];

const PHASE_DURATIONS: Partial<Record<Phase, number>> = {
  pre:        2000,
  lift:       5000,
  "settle-1": 5000,
  "settle-2": 5000,
  "open-1":   4000,
  "open-2":   6000,
  // close : manuel
};

const PHASE_TEXT: Record<Phase, { main: string; sub?: string }> = {
  pre:        { main: "On laisse un peu d'espace" },
  lift:       { main: "Lève légèrement les yeux de l'écran" },
  "settle-1": { main: "Laisse ton regard se poser quelque part" },
  "settle-2": { main: "Sans chercher" },
  "open-1":   { main: "Laisse venir un peu plus d'espace" },
  "open-2":   { main: "Juste regarder" },
  close:      { main: "C'est suffisant pour maintenant", sub: "Tu peux garder ce regard un instant" },
};

// L'indicateur s'efface progressivement — libère le regard vers l'extérieur
const INDICATOR_OPACITY: Record<Phase, number> = {
  pre:        0.80,
  lift:       0.55,
  "settle-1": 0.20,
  "settle-2": 0.08,
  "open-1":   0.02,
  "open-2":   0.00,
  close:      0.00,
};

export function GazeGuide({ onComplete }: GazeGuideProps) {
  const [phase, setPhase] = useState<Phase>("pre");

  // Auto-avance des phases
  useEffect(() => {
    const duration = PHASE_DURATIONS[phase];
    if (!duration) return;
    const t = setTimeout(() => {
      const idx = PHASE_SEQUENCE.indexOf(phase);
      const next = PHASE_SEQUENCE[idx + 1];
      if (next) setPhase(next);
    }, duration);
    return () => clearTimeout(t);
  }, [phase]);

  const text = PHASE_TEXT[phase];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Indicateur directionnel — s'efface progressivement */}
      {/* Invite à lever les yeux, puis libère vers l'espace réel */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
          height: 36,
          justifyContent: "flex-end",
          opacity: INDICATOR_OPACITY[phase],
          transition: "opacity 3s ease",
        }}
      >
        {([0.55, 0.35, 0.16] as const).map((alpha, i) => (
          <div
            key={i}
            style={{
              width: 1.5,
              height: 9,
              borderRadius: 1,
              background: `rgba(214,165,106,${alpha})`,
            }}
          />
        ))}
      </div>

      {/* Texte guidé — change par phase avec fade-in */}
      <div
        key={phase}
        className="text-center space-y-2 animate-fade-in"
        style={{ minHeight: "4rem" }}
      >
        <p className="font-body text-xl t-text-primary">
          {text.main}
        </p>
        {text.sub && (
          <p className="font-inter text-xs t-text-ghost">
            {text.sub}
          </p>
        )}
      </div>

      {phase === "close" && (
        <button type="button" onClick={onComplete} className="t-btn-secondary">
          C&apos;est fait
        </button>
      )}
    </div>
  );
}
