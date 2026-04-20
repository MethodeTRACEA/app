"use client";

import { useState, useEffect } from "react";

interface BreathingGuideProps {
  onComplete: () => void;
}

// ── Machine d'état unifiée ─────────────────────────────────
// pre (2s) → install (4s) → inspire (4s) ↔ expire (6s) × CYCLES → close (manuel)
type Phase = "pre" | "install" | "inspire" | "expire" | "close";

const CYCLES = 3;

export function BreathingGuide({ onComplete }: BreathingGuideProps) {
  const [phase, setPhase] = useState<Phase>("pre");
  const [cycle, setCycle] = useState(0);

  // pre → install (2s)
  useEffect(() => {
    if (phase !== "pre") return;
    const t = setTimeout(() => setPhase("install"), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  // install → inspire (4s)
  useEffect(() => {
    if (phase !== "install") return;
    const t = setTimeout(() => {
      setCycle(0);
      setPhase("inspire");
    }, 4000);
    return () => clearTimeout(t);
  }, [phase]);

  // inspire → expire (4s)
  useEffect(() => {
    if (phase !== "inspire") return;
    const t = setTimeout(() => setPhase("expire"), 4000);
    return () => clearTimeout(t);
  }, [phase, cycle]);

  // expire → inspire (prochain cycle) ou close (6s)
  useEffect(() => {
    if (phase !== "expire") return;
    const t = setTimeout(() => {
      const next = cycle + 1;
      if (next >= CYCLES) {
        setPhase("close");
      } else {
        setCycle(next);
        setPhase("inspire");
      }
    }, 6000);
    return () => clearTimeout(t);
  }, [phase, cycle]);

  const isBreathing = phase === "inspire" || phase === "expire";
  const expanded = phase === "inspire";

  return (
    <div
      className="flex flex-col items-center gap-6"
      style={{ minHeight: 280, justifyContent: "center" }}
    >
      {/* ── Pré-entrée ── */}
      {phase === "pre" && (
        <p key="pre" className="font-body text-xl t-text-secondary text-center animate-fade-in">
          On ralentit un peu
        </p>
      )}

      {/* ── Installation ── */}
      {phase === "install" && (
        <p key="install" className="font-body text-xl t-text-secondary text-center animate-fade-in">
          Tu peux juste suivre
        </p>
      )}

      {/* ── Respiration guidée ── */}
      {isBreathing && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(214,165,106,0.12)",
              border: "1px solid rgba(214,165,106,0.30)",
              boxShadow: "0 0 40px rgba(214,165,106,0.08)",
              transform: `scale(${expanded ? 1 : 0.45})`,
              transition: `transform ${expanded ? "4s" : "6s"} ease-in-out`,
              willChange: "transform",
            }}
          />
          <div className="flex flex-col items-center gap-2">
            <p
              key={`${phase}-${cycle}`}
              className="font-body text-2xl t-text-secondary italic animate-fade-in"
              style={{ minHeight: "2rem" }}
            >
              {expanded ? "Inspire" : "Expire"}
            </p>
            <p className="font-inter text-xs t-text-secondary">
              Laisse ton souffle suivre le mouvement
            </p>
            <p className="font-inter text-xs t-text-ghost">
              {cycle + 1}&thinsp;/&thinsp;{CYCLES}
            </p>
          </div>
        </div>
      )}

      {/* ── Sortie ── */}
      {phase === "close" && (
        <div key="close" className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="text-center space-y-2">
            <p className="font-body text-xl t-text-secondary">
              C&apos;est suffisant pour maintenant
            </p>
            <p className="font-inter text-xs t-text-ghost">
              Tu peux t&apos;arrêter là
            </p>
          </div>
          <button type="button" onClick={onComplete} className="t-btn-secondary mt-2">
            C&apos;est fait
          </button>
        </div>
      )}
    </div>
  );
}
