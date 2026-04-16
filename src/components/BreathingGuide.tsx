"use client";

import { useState, useEffect } from "react";

interface BreathingGuideProps {
  onComplete: () => void;
}

export function BreathingGuide({ onComplete }: BreathingGuideProps) {
  const [phase, setPhase] = useState<"idle" | "inspire" | "expire" | "done">("idle");
  const [cycle, setCycle] = useState(0);
  const CYCLES = 4;

  useEffect(() => {
    const t = setTimeout(() => setPhase("inspire"), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "inspire") return;
    const t = setTimeout(() => setPhase("expire"), 4000);
    return () => clearTimeout(t);
  }, [phase, cycle]);

  useEffect(() => {
    if (phase !== "expire") return;
    const t = setTimeout(() => {
      const next = cycle + 1;
      setCycle(next);
      setPhase(next >= CYCLES ? "done" : "inspire");
    }, 6000);
    return () => clearTimeout(t);
  }, [phase, cycle]);

  const expanded = phase === "inspire";
  const phaseText =
    phase === "done" ? "Laisse faire" :
    phase === "inspire" ? "Inspire" :
    phase === "expire" ? "Expire" : "";

  const scale = expanded ? 1 : 0.45;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Orbe — objet de focus principal */}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(214,165,106,0.12)",
          border: "1px solid rgba(214,165,106,0.30)",
          boxShadow: "0 0 40px rgba(214,165,106,0.08)",
          transform: `scale(${scale})`,
          transition: `transform ${expanded ? "4s" : "6s"} ease-in-out`,
          willChange: "transform",
        }}
      />
      {/* Instruction — liée visuellement à l'orbe */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-body text-2xl t-text-secondary italic" style={{ minHeight: "2rem" }}>
          {phaseText}
        </p>
        {phase !== "idle" && phase !== "done" && (
          <p className="font-inter text-xs t-text-secondary">
            Laisse ton souffle suivre le mouvement
          </p>
        )}
      </div>
      {phase !== "idle" && (
        <p className="font-inter text-xs t-text-ghost" style={{ minHeight: "1rem" }}>
          {phase !== "done" ? `${cycle + 1} / ${CYCLES}` : ""}
        </p>
      )}
      <button type="button" onClick={onComplete} className="t-btn-secondary mt-2">
        C&apos;est fait
      </button>
    </div>
  );
}
