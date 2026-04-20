"use client";

import { useState, useEffect } from "react";

interface GazeGuideProps {
  onComplete: () => void;
}

type Phase = 1 | 2 | 3;

const PHASES = [
  { text: "Lève légèrement les yeux de l'écran" },
  { text: "Laisse ton regard se poser quelque part" },
  { text: "Sans chercher", sub: "juste laisser faire" },
] as const;

const PHASE_DURATION = 5000;

export function GazeGuide({ onComplete }: GazeGuideProps) {
  const [phase, setPhase] = useState<Phase>(1);

  // Auto-avance phases 1 → 2 → 3 (phase 3 : bouton manuel)
  useEffect(() => {
    if (phase === 3) return;
    const t = setTimeout(() => setPhase((p) => (p + 1) as Phase), PHASE_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  const current = PHASES[phase - 1];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Indicateur directionnel — 3 traits qui s'effacent après phase 1 */}
      {/* Invite à lever les yeux, puis disparaît pour laisser de l'espace */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
          height: 36,
          justifyContent: "flex-end",
          opacity: phase === 1 ? 1 : 0,
          transition: "opacity 2s ease",
        }}
      >
        {([0.50, 0.30, 0.14] as const).map((alpha, i) => (
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

      {/* Texte guidé — change par phase */}
      <div className="text-center space-y-2" style={{ minHeight: "3.5rem" }}>
        <p
          key={phase}
          className="font-body text-xl t-text-primary animate-fade-in"
        >
          {current.text}
        </p>
        {"sub" in current && (
          <p className="font-inter text-sm t-text-secondary animate-fade-in">
            {current.sub}
          </p>
        )}
      </div>

      {phase === 3 && (
        <button type="button" onClick={onComplete} className="t-btn-secondary">
          C&apos;est fait
        </button>
      )}
    </div>
  );
}
