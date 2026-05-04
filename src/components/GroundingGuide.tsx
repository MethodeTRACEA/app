"use client";

import { useState, useEffect, useRef } from "react";

interface GroundingGuideProps {
  onComplete: () => void;
  onCancel?: () => void;
}

// ── Machine d'état ──────────────────────────────────────────
// 16 phases : 15 auto-avancées + close (manuel)
// Chaque phrase = une phase = un segment audio optionnel.
type Phase =
  | "pre"      | "install"  | "contact"
  | "press"    | "tiny"     | "release"  | "repeat"  | "press-2"
  | "settle"   | "ground"   | "sense"    | "body"    | "descend"
  | "soft-1"   | "soft-2"   | "close";

const PHASE_SEQUENCE: Phase[] = [
  "pre", "install", "contact",
  "press", "tiny", "release", "repeat", "press-2",
  "settle", "ground", "sense", "body", "descend",
  "soft-1", "soft-2", "close",
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
  "soft-1":  3500,
  "soft-2":  4000,
  // close → manuel
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
  sense:     { main: "Sens ce point d'appui." },
  body:      { main: "Le reste du corps peut se poser autour." },
  descend:   { main: "Ce qui est là peut descendre un peu,", sub: "jusqu'aux appuis." },
  "soft-1":  { main: "Sans forcer." },
  "soft-2":  { main: "Juste laisser passer." },
  close:     { main: "C'est suffisant pour maintenant." },
};

// Segment audio par phase (optionnel selon toggle voix)
const PHASE_AUDIO: Partial<Record<Phase, string>> = {
  pre:       "/audio/grounding/grounding_1.mp3",
  install:   "/audio/grounding/grounding_2.mp3",
  contact:   "/audio/grounding/grounding_3.mp3",
  press:     "/audio/grounding/grounding_4.mp3",
  tiny:      "/audio/grounding/grounding_5.mp3",
  release:   "/audio/grounding/grounding_6.mp3",
  repeat:    "/audio/grounding/grounding_7.mp3",
  "press-2": "/audio/grounding/grounding_8.mp3",
  settle:    "/audio/grounding/grounding_9.mp3",
  ground:    "/audio/grounding/grounding_10.mp3",
  sense:     "/audio/grounding/grounding_11.mp3",
  body:      "/audio/grounding/grounding_12.mp3",
  descend:   "/audio/grounding/grounding_13.mp3",
  "soft-1":  "/audio/grounding/grounding_14.mp3",
  "soft-2":  "/audio/grounding/grounding_15.mp3",
  close:     "/audio/grounding/grounding_16.mp3",
};

// Halo de sol — ellipse SVG basse, s'élargit avec l'appui, se replie au relâchement.
// Soutient sensoriellement « sous tes pieds » sans devenir illustratif.
const HALO_SVG: Record<Phase, { rx: number; ry: number; opacity: number }> = {
  pre:       { rx:  90, ry: 12, opacity: 0.10 },
  install:   { rx: 120, ry: 14, opacity: 0.16 },
  contact:   { rx: 150, ry: 18, opacity: 0.22 },
  press:     { rx: 175, ry: 22, opacity: 0.32 },
  tiny:      { rx: 175, ry: 22, opacity: 0.32 },
  release:   { rx: 130, ry: 16, opacity: 0.18 },
  repeat:    { rx: 150, ry: 19, opacity: 0.24 },
  "press-2": { rx: 175, ry: 22, opacity: 0.32 },
  settle:    { rx: 180, ry: 22, opacity: 0.30 },
  ground:    { rx: 185, ry: 23, opacity: 0.30 },
  sense:     { rx: 185, ry: 23, opacity: 0.30 },
  body:      { rx: 195, ry: 25, opacity: 0.28 },
  descend:   { rx: 200, ry: 26, opacity: 0.30 },
  "soft-1":  { rx: 190, ry: 24, opacity: 0.22 },
  "soft-2":  { rx: 190, ry: 24, opacity: 0.20 },
  close:     { rx: 170, ry: 21, opacity: 0.18 },
};

function initVoice(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("tracea_grounding_voice") === "on";
}

export function GroundingGuide({ onComplete, onCancel }: GroundingGuideProps) {
  const [phase,        setPhase]        = useState<Phase>("pre");
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(initVoice);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);

  function handleVoiceToggle() {
    setVoiceEnabled((v) => {
      const next = !v;
      localStorage.setItem("tracea_grounding_voice", next ? "on" : "off");
      return next;
    });
  }

  // Nettoyage au démontage
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Auto-avance des phases (timer)
  useEffect(() => {
    const duration = PHASE_DURATIONS[phase];
    if (!duration) return;
    const t = setTimeout(() => {
      const idx  = PHASE_SEQUENCE.indexOf(phase);
      const next = PHASE_SEQUENCE[idx + 1];
      if (next && mountedRef.current) setPhase(next);
    }, duration);
    return () => clearTimeout(t);
  }, [phase]);

  // Lecture audio — synchronisée avec la phase, pilotée par le toggle
  useEffect(() => {
    if (!voiceEnabled) {
      audioRef.current?.pause();
      return;
    }
    const src = PHASE_AUDIO[phase];
    if (!src) return;

    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.pause();
    audio.src    = src;
    audio.volume = 0.85; // discret — la voix accompagne, ne domine pas
    audio.play().catch(() => {});

    return () => { audio.pause(); };
  }, [phase, voiceEnabled]);

  const halo = HALO_SVG[phase];
  const text = PHASE_TEXT[phase];

  return (
    <div className="flex flex-col items-center gap-8">

      {/* Texte guidé — une phrase à la fois */}
      <div
        key={phase}
        className="text-center space-y-2 animate-fade-in"
        style={{ minHeight: "4rem" }}
        aria-live="polite"
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

      {/* Contrôle voix */}
      <button
        type="button"
        onClick={handleVoiceToggle}
        className="font-inter text-[10px] uppercase tracking-widest transition-opacity duration-300"
        style={{ opacity: voiceEnabled ? 0.65 : 0.35 }}
        aria-label={voiceEnabled ? "Voix activée" : "Voix désactivée"}
        aria-pressed={voiceEnabled}
      >
        {voiceEnabled ? "Voix ·" : "Voix"}
      </button>

      {onCancel && phase !== "close" && (
        <button
          type="button"
          onClick={onCancel}
          className="font-inter text-sm t-text-secondary underline underline-offset-[3px] hover:text-t-beige transition-colors"
          aria-label="Arrêter cet exercice et revenir au choix"
        >
          Faire autre chose
        </button>
      )}

      {/* Halo de sol — ellipse SVG basse, suggère l'appui sans illustration littérale */}
      <svg
        viewBox="0 0 400 100"
        width="100%"
        height="100"
        aria-hidden="true"
        className="overflow-visible"
        style={{ maxWidth: 400, pointerEvents: "none", marginTop: 8 }}
      >
        <defs>
          <radialGradient id="grounding-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(214,165,106,0.55)" />
            <stop offset="60%"  stopColor="rgba(214,165,106,0.25)" />
            <stop offset="100%" stopColor="rgba(214,165,106,0)" />
          </radialGradient>
        </defs>
        <ellipse
          cx="200"
          cy="80"
          rx={halo.rx}
          ry={halo.ry}
          fill="url(#grounding-glow)"
          style={{
            opacity: halo.opacity,
            transition: "opacity 3s ease, rx 3s ease, ry 3s ease",
          }}
        />
      </svg>

    </div>
  );
}
