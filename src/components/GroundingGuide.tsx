"use client";

import { useState, useEffect } from "react";

interface GroundingGuideProps {
  onComplete: () => void;
}

type Phase = 1 | 2 | 3;

const PHASES = [
  { text: "Sens le contact sous tes pieds" },
  { text: "Laisse le poids descendre un peu" },
  { text: "Rien à faire", sub: "juste sentir" },
] as const;

const PHASE_DURATION = 5000;

export function GroundingGuide({ onComplete }: GroundingGuideProps) {
  const [phase, setPhase] = useState<Phase>(1);
  const [expanded, setExpanded] = useState(false);

  // Pulsation lente — suggère le poids, le contact, la présence
  useEffect(() => {
    const id = setInterval(() => setExpanded((e) => !e), 3500);
    return () => clearInterval(id);
  }, []);

  // Auto-avance phases 1 → 2 → 3 (phase 3 : bouton manuel)
  useEffect(() => {
    if (phase === 3) return;
    const t = setTimeout(() => setPhase((p) => (p + 1) as Phase), PHASE_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  const current = PHASES[phase - 1];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Halo de sol — s'élargit lentement comme un appui qui s'installe */}
      <div
        style={{
          width: expanded ? 112 : 80,
          height: expanded ? 22 : 14,
          borderRadius: "50%",
          background: "rgba(214,165,106,0.08)",
          boxShadow: `0 0 ${expanded ? 36 : 20}px rgba(214,165,106,${expanded ? "0.22" : "0.10"})`,
          transition: "all 3.5s ease-in-out",
        }}
      />

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
