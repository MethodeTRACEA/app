"use client";

import { useState, useEffect } from "react";
import { useExerciseAudio, type AudioLevel } from "@/lib/use-exercise-audio";
import { AudioToggle } from "@/components/ui/AudioToggle";

interface GroundingGuideProps {
  onComplete: () => void;
}

// ── Machine d'état ──────────────────────────────────────────
// 15 phases : 14 auto-avancées + close (manuel)
// Chaque phrase = une phase distincte pour un rythme incarné.
type Phase =
  | "pre"      // On revient doucement dans le corps.
  | "install"  // Si tu es assis(e), pose les pieds bien à plat au sol.
  | "contact"  // Sens le contact sous tes pieds.
  | "press"    // Presse légèrement tes pieds dans le sol.
  | "tiny"     // Un tout petit peu.
  | "release"  // Relâche.
  | "repeat"   // Et recommence une fois.
  | "press-2"  // Presse… puis relâche.
  | "settle"   // Tu peux simplement rester là un instant.
  | "ground"   // Garde les pieds en contact avec le sol.
  | "sense"    // Sens simplement ce point d'appui.
  | "body"     // Le reste du corps peut se poser autour.
  | "descend"  // Ce qui est là peut descendre un peu, jusqu'aux appuis.
  | "soft"     // Sans forcer. Juste laisser passer.
  | "close";   // C'est suffisant pour maintenant. (manuel)

const PHASE_SEQUENCE: Phase[] = [
  "pre", "install", "contact",
  "press", "tiny", "release", "repeat", "press-2",
  "settle", "ground", "sense", "body", "descend",
  "soft", "close",
];

const PHASE_DURATIONS: Partial<Record<Phase, number>> = {
  pre:       3000,
  install:   6000,
  contact:   5000,
  press:     4000,
  tiny:      2500,
  release:   3500,
  repeat:    4000,
  "press-2": 6000,
  settle:    6000,
  ground:    5000,
  sense:     6000,
  body:      5000,
  descend:   7000,
  soft:      5000,
  // close → pas de durée = attente manuelle
};

const PHASE_TEXT: Record<Phase, { main: string; sub?: string }> = {
  pre:       { main: "On revient doucement dans le corps." },
  install:   { main: "Si tu es assis(e),", sub: "pose les pieds bien à plat au sol." },
  contact:   { main: "Sens le contact sous tes pieds." },
  press:     { main: "Presse légèrement tes pieds dans le sol." },
  tiny:      { main: "Un tout petit peu." },
  release:   { main: "Relâche." },
  repeat:    { main: "Et recommence une fois." },
  "press-2": { main: "Presse… puis relâche." },
  settle:    { main: "Tu peux simplement rester là un instant." },
  ground:    { main: "Garde les pieds en contact avec le sol." },
  sense:     { main: "Sens simplement ce point d'appui." },
  body:      { main: "Le reste du corps peut se poser autour." },
  descend:   { main: "Ce qui est là peut descendre un peu,", sub: "jusqu'aux appuis." },
  soft:      { main: "Sans forcer.", sub: "Juste laisser passer." },
  close:     { main: "C'est suffisant pour maintenant." },
};

// Halo de sol — positionné en bas, évoque l'appui sous les pieds.
// Grandit et se stabilise au fil de l'ancrage ; se contracte légèrement
// à "release" pour incarner le relâchement.
const HALO: Record<Phase, { w: number; h: number; glow: number; alpha: number }> = {
  pre:       { w: 56,  h: 8,  glow: 12, alpha: 0.08 },
  install:   { w: 76,  h: 12, glow: 18, alpha: 0.13 },
  contact:   { w: 100, h: 16, glow: 24, alpha: 0.18 },
  press:     { w: 130, h: 20, glow: 36, alpha: 0.30 },
  tiny:      { w: 130, h: 20, glow: 36, alpha: 0.30 },
  release:   { w: 96,  h: 14, glow: 20, alpha: 0.16 },
  repeat:    { w: 110, h: 17, glow: 28, alpha: 0.22 },
  "press-2": { w: 130, h: 20, glow: 36, alpha: 0.30 },
  settle:    { w: 136, h: 21, glow: 38, alpha: 0.30 },
  ground:    { w: 140, h: 22, glow: 40, alpha: 0.31 },
  sense:     { w: 140, h: 22, glow: 40, alpha: 0.31 },
  body:      { w: 144, h: 23, glow: 42, alpha: 0.32 },
  descend:   { w: 150, h: 24, glow: 46, alpha: 0.34 },
  soft:      { w: 140, h: 22, glow: 38, alpha: 0.28 },
  close:     { w: 128, h: 20, glow: 32, alpha: 0.24 },
};

function initAudioLevel(): AudioLevel {
  if (typeof window === "undefined") return "off";
  const saved = localStorage.getItem("tracea_audio_level") as AudioLevel | null;
  return saved === "low" || saved === "medium" ? saved : "off";
}

export function GroundingGuide({ onComplete }: GroundingGuideProps) {
  const [phase,      setPhase]      = useState<Phase>("pre");
  const [expanded,   setExpanded]   = useState(false);
  const [audioLevel, setAudioLevel] = useState<AudioLevel>(initAudioLevel);

  useExerciseAudio("grounding", audioLevel);

  function handleAudioChange(next: AudioLevel) {
    setAudioLevel(next);
    localStorage.setItem("tracea_audio_level", next);
  }

  // Pulsation lente — suggère la présence, l'appui vivant
  useEffect(() => {
    const id = setInterval(() => setExpanded((e) => !e), 4000);
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

      {/* Texte guidé — une phrase à la fois */}
      <div
        key={phase}
        className="text-center space-y-2 animate-fade-in"
        style={{ minHeight: "4rem" }}
      >
        <p className="font-body text-xl t-text-primary">{text.main}</p>
        {text.sub && (
          <p className="font-body text-xl t-text-primary">{text.sub}</p>
        )}
      </div>

      {phase === "close" && (
        <button type="button" onClick={onComplete} className="t-btn-secondary">
          C&apos;est fait
        </button>
      )}

      {/* Halo de sol — chaud, stable, grandit avec l'ancrage */}
      <div
        style={{
          width:        expanded ? halo.w + 12 : halo.w - 6,
          height:       expanded ? halo.h + 3  : halo.h - 2,
          borderRadius: "50%",
          background:   `rgba(214,165,106,${halo.alpha})`,
          boxShadow:    `0 0 ${halo.glow}px rgba(214,165,106,${(halo.alpha * 1.35).toFixed(2)})`,
          transition:   "all 4s ease-in-out",
          marginTop:    4,
        }}
      />

      {/* Contrôle audio */}
      <AudioToggle level={audioLevel} onChange={handleAudioChange} />
    </div>
  );
}
