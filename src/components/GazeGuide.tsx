"use client";

import { useState, useEffect, useRef } from "react";

interface GazeGuideProps {
  onComplete: () => void;
}

// ── Séquence ───────────────────────────────────────────────
// 7 segments. Chaque segment porte une consigne textuelle visible
// pour rester utilisable même sans audio (autoplay bloqué, mute,
// préférence "Sans voix"). pauseMs = pause après l'audio quand la
// voix joue. fallbackMs = durée d'affichage de la consigne quand
// la voix est désactivée ou que l'audio échoue.
const STEPS = [
  { src: "/audio/gaze/gaze_1.mp3", text: "Tu peux lever légèrement les yeux de l'écran.", pauseMs: 2500, fallbackMs: 5500 },
  { src: "/audio/gaze/gaze_2.mp3", text: "Regarde quelque chose de proche.",              pauseMs: 4500, fallbackMs: 7500 },
  { src: "/audio/gaze/gaze_3.mp3", text: "Puis quelque chose un peu plus loin…",          pauseMs: 4500, fallbackMs: 7500 },
  { src: "/audio/gaze/gaze_4.mp3", text: "Laisse ton regard se poser ailleurs.",          pauseMs: 4500, fallbackMs: 7500 },
  { src: "/audio/gaze/gaze_5.mp3", text: "Sans avoir besoin de chercher.",                pauseMs: 3500, fallbackMs: 6500 },
  { src: "/audio/gaze/gaze_6.mp3", text: "Juste regarder.",                               pauseMs: 7000, fallbackMs: 9500 },
  { src: "/audio/gaze/gaze_7.mp3", text: "C'est suffisant pour maintenant.",              pauseMs: 0,    fallbackMs: 3000 }, // → close
] as const;

// Indicateur directionnel — s'efface au fil des steps
const STEP_OPACITY = [0.80, 0.50, 0.25, 0.10, 0.03, 0.00, 0.00];

type Phase = "pre" | "active" | "close";

function initVoice(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const saved = localStorage.getItem("tracea_gaze_voice");
    return saved !== "off";
  } catch {
    return true;
  }
}

export function GazeGuide({ onComplete }: GazeGuideProps) {
  const [phase, setPhase] = useState<Phase>("pre");
  const [step,  setStep]  = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(initVoice);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  function handleVoiceToggle() {
    setVoiceEnabled((v) => {
      const next = !v;
      try { localStorage.setItem("tracea_gaze_voice", next ? "on" : "off"); } catch {}
      if (!next && audioRef.current) {
        audioRef.current.pause();
      }
      return next;
    });
  }

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

  // ── Pre → courte pause avant le premier segment ─────────
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

    function advance() {
      if (!mountedRef.current) return;
      const isLast = step >= STEPS.length - 1;
      if (isLast) {
        setPhase("close");
      } else {
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) setStep((s) => s + 1);
        }, stepData.pauseMs);
      }
    }

    // Mode "Sans voix" — la consigne reste affichée, avancement par timer
    if (!voiceEnabled) {
      timerRef.current = setTimeout(advance, stepData.fallbackMs);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }

    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.pause();
    audio.onended = null;
    audio.onerror = null;
    audio.src    = stepData.src;
    audio.volume = 1.0;

    audio.onended = advance;
    audio.onerror = () => {
      // Échec de chargement audio — on laisse le texte et on avance via timer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(advance, stepData.fallbackMs);
    };

    audio.play().catch(() => {
      // Autoplay bloqué ou erreur de lecture : la consigne reste lisible,
      // on avance proprement via timer (durée fallback du segment).
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(advance, stepData.fallbackMs);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, step, voiceEnabled]);

  const indicatorOpacity =
    phase === "pre"    ? 0.80
    : phase === "close"  ? 0.00
    : (STEP_OPACITY[step] ?? 0.00);

  const stepText = phase === "active" ? STEPS[step]?.text ?? "" : "";

  return (
    <div className="flex flex-col items-center gap-8" style={{ minHeight: 200 }}>

      {/* Indicateur directionnel — disparaît progressivement */}
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

      {/* Consigne textuelle — toujours visible pendant l'exercice */}
      <div
        key={`gaze-text-${phase}-${step}`}
        className="text-center animate-fade-in"
        style={{ minHeight: "4rem" }}
        aria-live="polite"
      >
        {stepText && (
          <p className="font-body text-xl t-text-primary">{stepText}</p>
        )}
      </div>

      {phase === "close" && (
        <button
          type="button"
          onClick={onComplete}
          className="t-btn-secondary animate-fade-in"
        >
          C&apos;est noté
        </button>
      )}

      {/* Toggle voix — discret, persisté */}
      <button
        type="button"
        onClick={handleVoiceToggle}
        className="font-inter text-[10px] uppercase tracking-widest transition-opacity duration-300"
        style={{ opacity: voiceEnabled ? 0.65 : 0.35 }}
        aria-label={voiceEnabled ? "Voix activée" : "Sans voix"}
        aria-pressed={voiceEnabled}
      >
        {voiceEnabled ? "Voix ·" : "Voix"}
      </button>

    </div>
  );
}
