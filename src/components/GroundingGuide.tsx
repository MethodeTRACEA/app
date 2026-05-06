"use client";

import { useState, useEffect, useRef } from "react";

interface GroundingGuideProps {
  onComplete: () => void;
  onCancel?: () => void;
}

// ── Machine d'état ──────────────────────────────────────────
// 6 phases : 5 auto-avancées + close (manuel)
// Chaque phrase = une phase = un segment audio optionnel.
type Phase =
  | "pre"
  | "install"
  | "orient"
  | "contact"
  | "press"
  | "close";

const PHASE_SEQUENCE: Phase[] = [
  "pre", "install", "orient", "contact", "press", "close",
];

const PHASE_DURATIONS: Partial<Record<Phase, number>> = {
  pre:     3000,
  install: 8000,
  orient:  8000,
  contact: 12000,
  press:   12000,
  // close → manuel
};

const PHASE_TEXT: Record<Phase, { main: string; sub?: string }> = {
  pre:     { main: "On va revenir à quelque chose de simple." },
  install: { main: "Si tu es assis(e), tu peux poser les pieds à plat.", sub: "Garde les yeux ouverts si tu veux." },
  orient:  { main: "Pose ton attention vers tes pieds." },
  contact: { main: "Vois si tu peux sentir un contact avec le sol.", sub: "Même si c'est flou, c'est OK." },
  press:   { main: "Appuie très légèrement —", sub: "pas fort, juste assez pour sentir qu'il y a quelque chose sous toi. Tu peux relâcher quand tu veux." },
  close:   { main: "C'est suffisant pour maintenant." },
};

// Segment audio par phase (optionnel selon toggle voix)
// Les fichiers grounding_7.mp3 à grounding_16.mp3 ne sont plus utilisés.
const PHASE_AUDIO: Partial<Record<Phase, string>> = {
  pre:     "/audio/grounding/grounding_1.mp3",
  install: "/audio/grounding/grounding_2.mp3",
  orient:  "/audio/grounding/grounding_3.mp3",
  contact: "/audio/grounding/grounding_4.mp3",
  press:   "/audio/grounding/grounding_5.mp3",
  close:   "/audio/grounding/grounding_6.mp3",
};

// Halo de sol — ellipse SVG basse, s'élargit avec l'appui, se replie au relâchement.
// Soutient sensoriellement « sous tes pieds » sans devenir illustratif.
const HALO_SVG: Record<Phase, { rx: number; ry: number; opacity: number }> = {
  pre:     { rx:  90, ry: 12, opacity: 0.10 },
  install: { rx: 130, ry: 16, opacity: 0.18 },
  orient:  { rx: 150, ry: 18, opacity: 0.22 },
  contact: { rx: 175, ry: 22, opacity: 0.30 },
  press:   { rx: 195, ry: 25, opacity: 0.34 },
  close:   { rx: 170, ry: 21, opacity: 0.18 },
};

function initVoice(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("tracea_grounding_voice") === "on";
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function GroundingGuide({ onComplete, onCancel }: GroundingGuideProps) {
  const [phase,        setPhase]        = useState<Phase>("pre");
  // Voix désactivée en dur le temps de la refonte audio. initVoice() et la
  // logique de play/pause restent en place pour une réactivation future.
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const reducedMotion                   = usePrefersReducedMotion();

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);

  function handleVoiceToggle() {
    setVoiceEnabled((v) => {
      const next = !v;
      localStorage.setItem("tracea_grounding_voice", next ? "on" : "off");
      return next;
    });
  }

  // Avance manuelle à la phase suivante (sans quitter l'exercice)
  function handleSkip() {
    const idx = PHASE_SEQUENCE.indexOf(phase);
    const next = PHASE_SEQUENCE[idx + 1];
    if (next) setPhase(next);
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

      {/* Contrôle voix — masqué le temps de la refonte audio. handleVoiceToggle
          reste défini pour réactivation future. */}
      {/*
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
      */}

      {phase !== "close" && (
        <button
          type="button"
          onClick={handleSkip}
          className="font-inter text-xs t-text-ghost transition-opacity hover:opacity-100"
          style={{ opacity: 0.55 }}
          aria-label="Passer à l'étape suivante"
        >
          Passer
        </button>
      )}

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
            transition: reducedMotion
              ? "none"
              : "opacity 3s ease, rx 3s ease, ry 3s ease",
          }}
        />
      </svg>

    </div>
  );
}
