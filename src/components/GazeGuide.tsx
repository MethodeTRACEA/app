"use client";

import { useState, useEffect, useRef } from "react";

interface GazeGuideProps {
  onComplete: () => void;
}

// ── Séquence audio ──────────────────────────────────────────
// Chaque step : fichier à lire + pause silencieuse après la fin.
// La voix guide — pas besoin de texte à l'écran.
const STEPS = [
  { src: "/audio/gaze/gaze_1.mp3", pauseMs: 4000 },
  { src: "/audio/gaze/gaze_2.mp3", pauseMs: 4500 },
  { src: "/audio/gaze/gaze_3.mp3", pauseMs: 4500 },
  { src: "/audio/gaze/gaze_4.mp3", pauseMs: 4500 },
  { src: "/audio/gaze/gaze_5.mp3", pauseMs: 3500 },
  { src: "/audio/gaze/gaze_6.mp3", pauseMs: 4500 },
  { src: "/audio/gaze/gaze_7.mp3", pauseMs: 0    }, // → close
] as const;

// Indicateur directionnel — s'efface au fil des steps pour libérer le regard
const STEP_OPACITY = [0.80, 0.50, 0.25, 0.10, 0.03, 0.00, 0.00];

type Phase = "pre" | "active" | "close";

export function GazeGuide({ onComplete }: GazeGuideProps) {
  const [phase, setPhase] = useState<Phase>("pre");
  const [step,  setStep]  = useState(0);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // ── Nettoyage au démontage ──────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.src    = "";
      }
    };
  }, []);

  // ── Phase "pre" → courte pause avant le premier audio ──
  useEffect(() => {
    if (phase !== "pre") return;
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) setPhase("active");
    }, 1200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase]);

  // ── Lecture séquentielle ────────────────────────────────
  useEffect(() => {
    if (phase !== "active") return;

    const stepData = STEPS[step];
    if (!stepData) return;

    // Réutilise un seul élément Audio pour éviter toute double lecture
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    // Réinitialise avant de charger le nouveau fichier
    audio.pause();
    audio.onended = null;
    audio.onerror = null;
    audio.src    = stepData.src;
    audio.volume = 1.0;

    function advance() {
      if (!mountedRef.current) return;
      const isLast = step >= STEPS.length - 1;
      if (isLast) {
        setPhase("close");
      } else {
        // Pause silencieuse après la fin de l'audio, puis step suivant
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) setStep((s) => s + 1);
        }, stepData.pauseMs);
      }
    }

    audio.onended = advance;
    audio.onerror = advance; // skip sur erreur réseau plutôt que bloquer

    audio.play().catch(() => {
      // Autoplay bloqué (rare — l'utilisateur a déjà interagi avec la page)
      // On avance quand même après un délai minimal
      timerRef.current = setTimeout(advance, 1500);
    });

    return () => {
      audio.onended = null;
      audio.onerror = null;
      if (timerRef.current) clearTimeout(timerRef.current);
      // L'audio courant continue de jouer jusqu'à la fin naturelle :
      // le cleanup ne le coupe pas pour éviter un silence brutal entre steps.
      // La pause + réassignation de src en début d'effet suivant suffit.
    };
  }, [phase, step]);

  // Opacité de l'indicateur : pré = max, active = selon le step, close = 0
  const indicatorOpacity =
    phase === "pre"    ? 0.80
    : phase === "close"  ? 0.00
    : (STEP_OPACITY[step] ?? 0.00);

  return (
    <div className="flex flex-col items-center gap-8" style={{ minHeight: 200 }}>

      {/* Indicateur directionnel — invite à lever les yeux, disparaît progressivement */}
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 5, height: 36, justifyContent: "flex-end",
          opacity:    indicatorOpacity,
          transition: "opacity 3s ease",
        }}
      >
        {([0.55, 0.35, 0.16] as const).map((alpha, i) => (
          <div
            key={i}
            style={{
              width: 1.5, height: 9, borderRadius: 1,
              background: `rgba(214,165,106,${alpha})`,
            }}
          />
        ))}
      </div>

      {/* Espace vide — la voix guide, pas l'écran */}
      <div style={{ minHeight: "4rem" }} />

      {phase === "close" && (
        <button
          type="button"
          onClick={onComplete}
          className="t-btn-secondary animate-fade-in"
        >
          C&apos;est noté
        </button>
      )}

    </div>
  );
}
