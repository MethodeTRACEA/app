"use client";

import type { AudioLevel } from "@/lib/use-exercise-audio";

// Cycle : off → low → medium → off
const NEXT: Record<AudioLevel, AudioLevel> = {
  off:    "low",
  low:    "medium",
  medium: "off",
};

const LABELS: Record<AudioLevel, string> = {
  off:    "Son",
  low:    "Son ·",
  medium: "Son ··",
};

interface AudioToggleProps {
  level:    AudioLevel;
  onChange: (next: AudioLevel) => void;
}

export function AudioToggle({ level, onChange }: AudioToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(NEXT[level])}
      className="font-inter text-[10px] uppercase tracking-widest transition-opacity duration-300"
      style={{ opacity: level === "off" ? 0.35 : 0.65 }}
      aria-label={`Son : ${level === "off" ? "coupé" : level === "low" ? "bas" : "moyen"}`}
    >
      {LABELS[level]}
    </button>
  );
}
