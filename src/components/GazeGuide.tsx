"use client";

import { useState, useEffect, useRef } from "react";

interface GazeGuideProps {
  onComplete: () => void;
  onCancel?: () => void;
}

// ── Séquence ───────────────────────────────────────────────
// 6 phases. Chaque phase porte une consigne textuelle visible
// pour rester utilisable même sans audio (autoplay bloqué, mute,
// préférence "Sans voix"). pauseMs = pause après l'audio quand la
// voix joue. fallbackMs = durée d'affichage de la consigne quand
// la voix est désactivée ou que l'audio échoue.
//
// Les fichiers gaze_7.mp3, gaze_full.mp3 et gaze_source.mp3 ne sont
// plus mappés ici mais restent physiquement présents dans
// public/audio/gaze/ pour usage futur ou archivage.
type Phase = "pre" | "scan" | "stable" | "rest" | "notice" | "close";

const PHASE_SEQUENCE: Phase[] = ["pre", "scan", "stable", "rest", "notice", "close"];

const SEGMENTS: Record<Phase, {
  text: { main: string[]; sub?: string[] };
  src: string;
  pauseMs: number;
  fallbackMs: number;
}> = {
  pre: {
    text: { main: ["Tu peux lever les yeux de l'écran."] },
    src: "/audio/gaze/gaze_1.mp3", pauseMs: 2500, fallbackMs: 5000,
  },
  scan: {
    text: { main: ["Laisse ton regard se déplacer lentement dans la pièce."], sub: ["Sans chercher quelque chose de précis."] },
    src: "/audio/gaze/gaze_2.mp3", pauseMs: 4000, fallbackMs: 8000,
  },
  stable: {
    text: {
      main: [
        "Vois si quelque chose attire ton regard",
        "quelque chose qui ne bouge pas.",
      ],
      sub: ["Un meuble. Une surface. Un coin de mur."],
    },
    src: "/audio/gaze/gaze_3.mp3", pauseMs: 5000, fallbackMs: 10000,
  },
  rest: {
    text: { main: ["Tu peux rester là, avec ce point fixe."], sub: ["Juste voir, sans analyser."] },
    src: "/audio/gaze/gaze_4.mp3", pauseMs: 5000, fallbackMs: 10000,
  },
  notice: {
    text: { main: ["Vois si tu remarques une couleur ou une forme simple."], sub: ["Tu n'as rien à faire de plus que ça."] },
    src: "/audio/gaze/gaze_5.mp3", pauseMs: 4000, fallbackMs: 8000,
  },
  close: {
    text: { main: ["C'est suffisant pour maintenant."] },
    src: "/audio/gaze/gaze_6.mp3", pauseMs: 0, fallbackMs: 0,
  },
};

// Halo lumineux horizontal — s'élargit puis se dissipe au fil des phases.
// Soutient le script sans devenir hypnotique.
const HALO: Record<Phase, { rx: number; ry: number; opacity: number }> = {
  pre:    { rx:  40, ry: 16, opacity: 0.18 },
  scan:   { rx:  90, ry: 24, opacity: 0.24 },
  stable: { rx: 140, ry: 32, opacity: 0.28 },
  rest:   { rx: 170, ry: 38, opacity: 0.24 },
  notice: { rx: 190, ry: 42, opacity: 0.16 },
  close:  { rx: 200, ry: 44, opacity: 0.00 },
};

function initVoice(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("tracea_gaze_voice") === "on";
  } catch {
    return false;
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

  // Avance manuelle à la phase suivante (sans quitter l'exercice)
  function handleSkip() {
    const idx = PHASE_SEQUENCE.indexOf(phase);
    const next = PHASE_SEQUENCE[idx + 1];
    if (next) setPhase(next);
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

  // ── Lecture séquentielle ────────────────────────────────
  useEffect(() => {
    const seg = SEGMENTS[phase];
    const idx = PHASE_SEQUENCE.indexOf(phase);
    const nextPhase = PHASE_SEQUENCE[idx + 1] ?? null;

    function advance() {
      if (!mountedRef.current || !nextPhase) return;
      setPhase(nextPhase);
    }

    function scheduleAdvance(delay: number) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(advance, delay);
    }

    // Phase close : on joue éventuellement l'audio mais on n'avance pas.
    // L'utilisateur sort en cliquant « C'est noté ».
    if (phase === "close") {
      if (voiceEnabled) {
        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        audio.pause();
        audio.onended = null;
        audio.onerror = null;
        audio.src    = seg.src;
        audio.volume = 1.0;
        audio.play().catch(() => {});
      }
      return () => {
        if (audioRef.current) {
          audioRef.current.onended = null;
          audioRef.current.onerror = null;
        }
      };
    }

    // Mode "Sans voix" — la consigne reste affichée, avancement par timer
    if (!voiceEnabled) {
      scheduleAdvance(seg.fallbackMs);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }

    // Mode "Avec voix"
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.pause();
    audio.onended = null;
    audio.onerror = null;
    audio.src    = seg.src;
    audio.volume = 1.0;

    audio.onended = () => {
      // À la fin de l'audio, courte pause puis avance.
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(advance, seg.pauseMs);
    };
    audio.onerror = () => {
      // Échec de chargement audio — on laisse le texte et on avance via timer.
      scheduleAdvance(seg.fallbackMs);
    };

    audio.play().catch(() => {
      // Autoplay bloqué ou erreur de lecture : la consigne reste lisible,
      // on avance proprement via timer (durée fallback du segment).
      scheduleAdvance(seg.fallbackMs);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, voiceEnabled]);

  // Empêcher la mise en veille de l'écran pendant l'exercice.
  // Le wake lock est libéré au démontage et réacquis si la page redevient
  // visible (le navigateur le libère automatiquement en arrière-plan).
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {}
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") requestWakeLock();
    };

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      wakeLock?.release().catch(() => {});
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const halo = HALO[phase];
  const text = SEGMENTS[phase].text;

  return (
    <div className="flex flex-col items-center min-h-screen w-full px-8 py-12">

      {/* Consigne textuelle — centrée verticalement dans la moitié supérieure */}
      <div
        key={`gaze-text-${phase}`}
        className="w-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in min-h-[50vh]"
        aria-live="polite"
      >
        <div className="flex flex-col items-center space-y-2">
          {text.main.map((line, i) => (
            <p
              key={i}
              className="font-body text-2xl t-text-primary max-w-xs text-balance"
            >
              {line}
            </p>
          ))}
        </div>
        {text.sub && (
          <div className="flex flex-col items-center space-y-2">
            {text.sub.map((line, i) => (
              <p
                key={i}
                className="font-body text-lg t-text-primary max-w-xs text-balance"
                style={{ opacity: 0.75 }}
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {phase === "close" && (
        <button
          type="button"
          onClick={onComplete}
          className="t-btn-secondary mt-8 animate-fade-in"
        >
          C&apos;est noté
        </button>
      )}

      {/* Bloc bas — boutons + halo poussés vers le bas de l'écran */}
      <div className="mt-auto flex flex-col items-center w-full">

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

        {phase !== "close" && (
          <button
            type="button"
            onClick={handleSkip}
            className="font-inter text-xs t-text-ghost transition-opacity hover:opacity-100 mt-4"
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
            className="font-inter text-sm t-text-secondary underline underline-offset-[3px] hover:text-t-beige transition-colors mt-4"
            aria-label="Arrêter cet exercice et revenir au choix"
          >
            Faire autre chose
          </button>
        )}

        {/* Halo lumineux horizontal — s'élargit puis se dissipe */}
        <svg
          viewBox="0 0 400 100"
          width="100%"
          height="100"
          aria-hidden="true"
          className="overflow-visible mt-6"
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

      </div>

    </div>
  );
}
