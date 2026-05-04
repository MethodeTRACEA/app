"use client";

import { useState, useEffect, useRef } from "react";

interface GazeGuideProps {
  onComplete: () => void;
  onCancel?: () => void;
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

// Halo lumineux horizontal — s'élargit puis se dissipe au fil des steps.
// Soutient le script « proche → loin → ailleurs » sans devenir hypnotique.
const HALO: { rx: number; ry: number; opacity: number }[] = [
  { rx:  40, ry: 16, opacity: 0.18 }, // step 0 — petit, centré
  { rx:  70, ry: 22, opacity: 0.22 }, // step 1 — proche
  { rx: 110, ry: 28, opacity: 0.24 }, // step 2 — loin
  { rx: 150, ry: 34, opacity: 0.22 }, // step 3 — ailleurs
  { rx: 180, ry: 40, opacity: 0.16 }, // step 4 — sans chercher
  { rx: 200, ry: 44, opacity: 0.10 }, // step 5 — juste regarder
  { rx: 200, ry: 44, opacity: 0.00 }, // step 6 — disparition
];

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

export function GazeGuide({ onComplete, onCancel }: GazeGuideProps) {
  const [phase, setPhase] = useState<Phase>("pre");
  const [step,  setStep]  = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(initVoice);
  const reducedMotion = usePrefersReducedMotion();

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

  const halo =
    phase === "active"
      ? HALO[step] ?? HALO[HALO.length - 1]
      : { rx: 40, ry: 16, opacity: 0 };

  const stepText = phase === "active" ? STEPS[step]?.text ?? "" : "";

  return (
    <div className="flex flex-col items-center gap-8" style={{ minHeight: 200 }}>

      {/* Halo lumineux horizontal — s'élargit puis se dissipe */}
      <svg
        viewBox="0 0 400 100"
        width="100%"
        height="100"
        aria-hidden="true"
        className="overflow-visible"
        style={{ maxWidth: 400, pointerEvents: "none" }}
      >
        <defs>
          <radialGradient id="gaze-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(214,165,106,0.55)" />
            <stop offset="60%"  stopColor="rgba(214,165,106,0.25)" />
            <stop offset="100%" stopColor="rgba(214,165,106,0)" />
          </radialGradient>
        </defs>
        <ellipse
          cx="200"
          cy="50"
          rx={halo.rx}
          ry={halo.ry}
          fill="url(#gaze-glow)"
          style={{
            opacity: halo.opacity,
            transition: reducedMotion
              ? "none"
              : "opacity 2.5s ease, rx 3s ease, ry 3s ease",
          }}
        />
      </svg>

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

    </div>
  );
}
