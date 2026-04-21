"use client";

import { useState, useEffect, useRef } from "react";
import { useExerciseAudio, type AudioLevel } from "@/lib/use-exercise-audio";
import { AudioToggle } from "@/components/ui/AudioToggle";

interface GroundingGuideProps {
  onComplete: () => void;
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

// Halo de sol — grandit avec l'ancrage, se contracte au relâchement
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
  "soft-1":  { w: 140, h: 22, glow: 38, alpha: 0.28 },
  "soft-2":  { w: 140, h: 22, glow: 38, alpha: 0.28 },
  close:     { w: 128, h: 20, glow: 32, alpha: 0.24 },
};

function initAudioLevel(): AudioLevel {
  if (typeof window === "undefined") return "off";
  const saved = localStorage.getItem("tracea_audio_level") as AudioLevel | null;
  return saved === "low" || saved === "medium" ? saved : "off";
}

function initVoice(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("tracea_grounding_voice") === "on";
}

export function GroundingGuide({ onComplete }: GroundingGuideProps) {
  const [phase,        setPhase]        = useState<Phase>("pre");
  const [expanded,     setExpanded]     = useState(false);
  const [audioLevel,   setAudioLevel]   = useState<AudioLevel>(initAudioLevel);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(initVoice);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);

  useExerciseAudio("grounding", audioLevel);

  function handleAudioChange(next: AudioLevel) {
    setAudioLevel(next);
    localStorage.setItem("tracea_audio_level", next);
  }

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

  // Pulsation lente du halo
  useEffect(() => {
    const id = setInterval(() => setExpanded((e) => !e), 4000);
    return () => clearInterval(id);
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

      {/* Contrôles — voix + ambiance */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleVoiceToggle}
          className="font-inter text-[10px] uppercase tracking-widest transition-opacity duration-300"
          style={{ opacity: voiceEnabled ? 0.65 : 0.35 }}
          aria-label={voiceEnabled ? "Voix activée" : "Voix désactivée"}
        >
          {voiceEnabled ? "Voix ·" : "Voix"}
        </button>
        <AudioToggle level={audioLevel} onChange={handleAudioChange} />
      </div>

    </div>
  );
}
