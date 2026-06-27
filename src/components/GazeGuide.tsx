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
type Phase = "pre" | "scan" | "stable" | "rest" | "notice" | "close";

const PHASE_SEQUENCE: Phase[] = ["pre", "scan", "stable", "rest", "notice", "close"];

const SEGMENTS: Record<Phase, {
  text: { main: string[]; sub?: string[] };
  fallbackMs: number;
}> = {
  pre: {
    text: { main: ["Tu peux lever les yeux de l'écran."] },
    fallbackMs: 5000,
  },
  scan: {
    text: { main: ["Laisse ton regard se déplacer lentement dans la pièce."], sub: ["Sans chercher quelque chose de précis."] },
    fallbackMs: 8000,
  },
  stable: {
    text: {
      main: [
        "Vois si quelque chose attire ton regard",
        "quelque chose qui ne bouge pas.",
      ],
      sub: ["Un meuble. Une surface. Un coin de mur."],
    },
    fallbackMs: 10000,
  },
  rest: {
    text: { main: ["Tu peux rester là, avec ce point fixe."], sub: ["Juste voir, sans analyser."] },
    fallbackMs: 10000,
  },
  notice: {
    text: { main: ["Vois si tu remarques une couleur ou une forme simple."], sub: ["Tu n'as rien à faire de plus que ça."] },
    fallbackMs: 8000,
  },
  close: {
    text: { main: ["C'est suffisant pour maintenant."] },
    fallbackMs: 0,
  },
};

// ── Audio continu ──────────────────────────────────────────
// Un seul enregistrement (gaze_voice.mp3, ~39,1 s) lit les 6 phases
// verbatim. Le texte affiché change aux timecodes de la voix, pilotés
// par l'événement 'timeupdate' (aucun setTimeout en mode voix).
const GAZE_VOICE_SRC = "/audio/gaze/gaze_voice.mp3";

// Timecodes de DÉBUT de voix par phase, mesurés sur gaze_voice.mp3 via
// ffmpeg silencedetect=noise=-33dB:d=0.5 (durée totale 39,13 s).
const PHASE_VOICE_START: Record<Phase, number> = {
  pre:    0,
  scan:   2.95,
  stable: 10.29,
  rest:   19.90,
  notice: 27.75,
  close:  37.27,
};

// Le texte d'une phase apparaît ~0,3 s avant le début de sa voix,
// sans jamais revenir en arrière. (PHASE_SEQUENCE est déclaré plus haut.)
const VOICE_LEAD = 0.3;
const PHASE_DISPLAY_AT = PHASE_SEQUENCE.reduce((acc, p) => {
  acc[p] = Math.max(0, PHASE_VOICE_START[p] - VOICE_LEAD);
  return acc;
}, {} as Record<Phase, number>);

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
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  // Phase courante lisible dans l'effet voix sans le remettre en dépendance
  // (évite de relancer l'audio à chaque changement de phase).
  const phaseRef   = useRef<Phase>(phase);
  phaseRef.current = phase;

  function handleVoiceToggle() {
    setVoiceEnabled((v) => {
      const next = !v;
      try { localStorage.setItem("tracea_gaze_voice", next ? "on" : "off"); } catch {}
      if (next) {
        // Geste utilisateur : l'autoplay est débloqué, on retente la voix.
        setVoiceUnavailable(false);
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      return next;
    });
  }

  // Avance manuelle à la phase suivante (sans quitter l'exercice)
  function handleSkip() {
    const idx = PHASE_SEQUENCE.indexOf(phase);
    const next = PHASE_SEQUENCE[idx + 1];
    if (!next) return;
    setPhase(next);
    // En mode voix, on cale la lecture sur le début de la phase visée
    // pour que la voix reste synchrone.
    if (voiceEnabled && !voiceUnavailable && audioRef.current) {
      try { audioRef.current.currentTime = PHASE_VOICE_START[next]; } catch {}
    }
  }

  // ── Nettoyage au démontage ──────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.ontimeupdate     = null;
        audioRef.current.onended          = null;
        audioRef.current.onerror          = null;
        audioRef.current.onloadedmetadata = null;
        audioRef.current.src              = "";
      }
    };
  }, []);

  // ── Mode voix : un seul fichier continu, phases pilotées par le temps ──
  useEffect(() => {
    if (!voiceEnabled || voiceUnavailable) return;

    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.pause();
    audio.ontimeupdate     = null;
    audio.onended          = null;
    audio.onerror          = null;
    audio.onloadedmetadata = null;
    audio.src    = GAZE_VOICE_SRC;
    audio.volume = 1.0;

    // Reprise éventuelle en cours d'exercice (toggle voix rallumé) :
    // on cale la lecture sur le début de la phase courante.
    const startAt = PHASE_VOICE_START[phaseRef.current];
    if (startAt > 0) {
      if (audio.readyState >= 1) {
        try { audio.currentTime = startAt; } catch {}
      } else {
        audio.onloadedmetadata = () => { try { audio.currentTime = startAt; } catch {} };
      }
    }

    // Avance forward-only : on affiche la dernière phase dont le seuil
    // d'affichage est atteint, jamais une phase antérieure.
    audio.ontimeupdate = () => {
      const t = audio.currentTime;
      let target: Phase = PHASE_SEQUENCE[0];
      for (const p of PHASE_SEQUENCE) {
        if (t >= PHASE_DISPLAY_AT[p]) target = p;
        else break;
      }
      setPhase((cur) =>
        PHASE_SEQUENCE.indexOf(target) > PHASE_SEQUENCE.indexOf(cur) ? target : cur
      );
    };

    // Fin de l'audio : on reste sur 'close' (bouton de sortie déjà affiché).
    audio.onended = () => {
      if (mountedRef.current) setPhase("close");
    };

    // Erreur de chargement : bascule sur le mode sans voix (timer fallback).
    audio.onerror = () => {
      if (mountedRef.current) setVoiceUnavailable(true);
    };

    audio.play().catch(() => {
      // Autoplay bloqué : le texte reste lisible, on retombe sur le timer.
      if (mountedRef.current) setVoiceUnavailable(true);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.ontimeupdate     = null;
        audioRef.current.onended          = null;
        audioRef.current.onerror          = null;
        audioRef.current.onloadedmetadata = null;
      }
    };
  }, [voiceEnabled, voiceUnavailable]);

  // ── Mode sans voix (ou voix indisponible) : avancement par timer ──
  useEffect(() => {
    if (voiceEnabled && !voiceUnavailable) return;   // le mode voix se gère seul
    if (phase === "close") return;                   // dernière phase : sortie manuelle

    const seg = SEGMENTS[phase];
    const idx = PHASE_SEQUENCE.indexOf(phase);
    const nextPhase = PHASE_SEQUENCE[idx + 1] ?? null;
    if (!nextPhase) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) setPhase(nextPhase);
    }, seg.fallbackMs);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, voiceEnabled, voiceUnavailable]);

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
