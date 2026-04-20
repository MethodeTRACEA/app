"use client";

import { useState, useEffect } from "react";
import { useExerciseAudio, type AudioLevel } from "@/lib/use-exercise-audio";
import { AudioToggle } from "@/components/ui/AudioToggle";

interface GroundingGuideProps {
  onComplete: () => void;
}

// ── Machine d'état ─────────────────────────────────────────
// pre (2s) → contact (6s) → descent-1 (5s) → descent-2 (6s)
//         → still-1 (5s)  → still-2 (7s)   → close (manuel)
type Phase =
  | "pre" | "contact"
  | "descent-1" | "descent-2"
  | "still-1"   | "still-2"
  | "close";

const PHASE_SEQUENCE: Phase[] = [
  "pre", "contact", "descent-1", "descent-2", "still-1", "still-2", "close",
];

const PHASE_DURATIONS: Partial<Record<Phase, number>> = {
  pre:         2000,
  contact:     6000,
  "descent-1": 5000,
  "descent-2": 6000,
  "still-1":   5000,
  "still-2":   7000,
};

// Halo de sol — grandit au fil des phases pour incarner le poids qui s'installe
const HALO: Record<Phase, { w: number; h: number; glow: number; alpha: number }> = {
  pre:         { w: 56,  h: 10, glow: 14, alpha: 0.10 },
  contact:     { w: 80,  h: 15, glow: 24, alpha: 0.17 },
  "descent-1": { w: 100, h: 18, glow: 30, alpha: 0.22 },
  "descent-2": { w: 112, h: 20, glow: 34, alpha: 0.25 },
  "still-1":   { w: 120, h: 22, glow: 38, alpha: 0.28 },
  "still-2":   { w: 120, h: 22, glow: 38, alpha: 0.28 },
  close:       { w: 110, h: 20, glow: 30, alpha: 0.22 },
};

const PHASE_TEXT: Record<Phase, { main: string; sub?: string }> = {
  pre:         { main: "On revient un peu dans le corps" },
  contact:     { main: "Sens le contact sous tes pieds" },
  "descent-1": { main: "Laisse le poids descendre un peu" },
  "descent-2": { main: "Pas besoin de forcer" },
  "still-1":   { main: "Rien à faire" },
  "still-2":   { main: "juste sentir" },
  close:       { main: "C'est suffisant pour maintenant", sub: "Tu peux rester là encore un peu si tu veux" },
};

function initAudioLevel(): AudioLevel {
  if (typeof window === "undefined") return "off";
  const saved = localStorage.getItem("tracea_audio_level") as AudioLevel | null;
  return saved === "low" || saved === "medium" ? saved : "off";
}

export function GroundingGuide({ onComplete }: GroundingGuideProps) {
  const [phase,    setPhase]    = useState<Phase>("pre");
  const [expanded, setExpanded] = useState(false);
  const [audioLevel, setAudioLevel] = useState<AudioLevel>(initAudioLevel);

  useExerciseAudio("grounding", audioLevel);

  function handleAudioChange(next: AudioLevel) {
    setAudioLevel(next);
    localStorage.setItem("tracea_audio_level", next);
  }

  // Pulsation lente du halo — suggère la présence, le poids qui respire
  useEffect(() => {
    const id = setInterval(() => setExpanded((e) => !e), 3500);
    return () => clearInterval(id);
  }, []);

  // Auto-avance des phases
  useEffect(() => {
    const duration = PHASE_DURATIONS[phase];
    if (!duration) return;
    const t = setTimeout(() => {
      const idx  = PHASE_SEQUENCE.indexOf(phase);
      const next = PHASE_SEQUENCE[idx + 1];
      if (next) setPhase(next);
    }, duration);
    return () => clearTimeout(t);
  }, [phase]);

  const halo = HALO[phase];
  const text = PHASE_TEXT[phase];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Halo de sol — chaud, visible, progressif */}
      <div
        style={{
          width:  expanded ? halo.w + 14 : halo.w - 8,
          height: expanded ? halo.h + 4  : halo.h - 2,
          borderRadius: "50%",
          background: `rgba(214,165,106,${halo.alpha})`,
          boxShadow: `0 0 ${halo.glow}px rgba(214,165,106,${(halo.alpha * 1.4).toFixed(2)})`,
          transition: "all 3.5s ease-in-out",
        }}
      />

      {/* Texte guidé */}
      <div
        key={phase}
        className="text-center space-y-2 animate-fade-in"
        style={{ minHeight: "4rem" }}
      >
        <p className="font-body text-xl t-text-primary">{text.main}</p>
        {text.sub && (
          <p className="font-inter text-xs t-text-ghost">{text.sub}</p>
        )}
      </div>

      {phase === "close" && (
        <button type="button" onClick={onComplete} className="t-btn-secondary">
          C&apos;est fait
        </button>
      )}

      {/* Contrôle audio */}
      <AudioToggle level={audioLevel} onChange={handleAudioChange} />
    </div>
  );
}
