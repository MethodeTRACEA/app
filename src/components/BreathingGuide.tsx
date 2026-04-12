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

  return (
    <div className="flex flex-col items-center gap-10">
      <div
        style={{
          width: expanded ? 160 : 72,
          height: expanded ? 160 : 72,
          borderRadius: "50%",
          background: "rgba(214,165,106,0.08)",
          border: "1px solid rgba(214,165,106,0.20)",
          transition: `width ${expanded ? "4s" : "6s"} ease-in-out, height ${expanded ? "4s" : "6s"} ease-in-out`,
        }}
      />
      <p className="font-body text-xl text-t-beige/60 italic" style={{ minHeight: "1.75rem" }}>
        {phaseText}
      </p>
      <button type="button" onClick={onComplete} className="t-btn-secondary">
        C&apos;est fait
      </button>
    </div>
  );
}
