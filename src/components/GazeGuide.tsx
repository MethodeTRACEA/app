"use client";

import { useState, useEffect, useRef } from "react";

interface GazeGuideProps {
  onComplete: () => void;
}

// Fichier audio unique — voix continue, intonation cohérente
const AUDIO_SRC = "/audio/gaze/gaze_full.mp3";

type Phase = "pre" | "playing" | "close";

export function GazeGuide({ onComplete }: GazeGuideProps) {
  const [phase, setPhase] = useState<Phase>("pre");

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

  // ── Pre → lancement différé (1.2 s de silence avant la voix) ──
  useEffect(() => {
    if (phase !== "pre") return;
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) setPhase("playing");
    }, 1200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase]);

  // ── Lecture du fichier unique ───────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;

    const audio   = new Audio(AUDIO_SRC);
    audioRef.current = audio;

    function onEnd() {
      if (mountedRef.current) setPhase("close");
    }
    audio.onended = onEnd;
    audio.onerror = onEnd; // skip proprement si le fichier est absent

    audio.play().catch(() => {
      // Autoplay bloqué — bouton affiché après un délai raisonnable
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setPhase("close");
      }, 55000);
    });

    return () => {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
      audio.src    = "";
    };
  }, [phase]);

  // Indicateur : visible au départ pour inviter à lever les yeux,
  // puis fondu dès que la voix prend le relais.
  const indicatorOpacity =
    phase === "pre"     ? 0.70
    : phase === "playing" ? 0.08
    : 0.00;

  return (
    <div className="flex flex-col items-center gap-8" style={{ minHeight: 200 }}>

      {/* Indicateur directionnel — disparaît quand la voix guide */}
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 5, height: 36, justifyContent: "flex-end",
          opacity:    indicatorOpacity,
          transition: "opacity 4s ease",
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
