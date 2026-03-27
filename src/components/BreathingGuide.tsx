"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Phase = "idle" | "inspire" | "expire";

export function BreathingGuide() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Son de cloche douce via Web Audio API
  const playBell = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(528, ctx.currentTime); // Frequence harmonique douce
      osc.frequency.exponentialRampToValueAtTime(264, ctx.currentTime + 1.5);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch {
      // Audio not supported, continue silently
    }
  }, []);

  useEffect(() => {
    if (!active) {
      setPhase("idle");
      setCountdown(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Start with inspire
    setPhase("inspire");
    setCountdown(4);

    let currentPhase: "inspire" | "expire" = "inspire";
    let currentCount = 4;

    intervalRef.current = setInterval(() => {
      currentCount--;

      if (currentCount <= 0) {
        // Bell at the transition
        playBell();

        if (currentPhase === "inspire") {
          currentPhase = "expire";
          currentCount = 6;
          setPhase("expire");
        } else {
          currentPhase = "inspire";
          currentCount = 4;
          setPhase("inspire");
          setCycles((c) => c + 1);
        }
      }

      setCountdown(currentCount);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, playBell]);

  function handleStart() {
    setCycles(0);
    setActive(true);
  }

  function handleStop() {
    setActive(false);
  }

  // Circle size based on phase
  const circleSize =
    phase === "inspire"
      ? "scale-100"
      : phase === "expire"
        ? "scale-[0.6]"
        : "scale-75";

  const phaseLabel =
    phase === "inspire"
      ? "Inspirez..."
      : phase === "expire"
        ? "Expirez..."
        : "Respiration guidee";

  const phaseDuration = phase === "inspire" ? 4 : phase === "expire" ? 6 : 0;

  return (
    <div className="card-sage mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-sage" />
        <p className="text-xs font-medium tracking-widest uppercase text-[#4A6B3A]">
          Guide de respiration
        </p>
      </div>

      <p className="text-sm text-espresso/70 mb-6 leading-relaxed">
        Si vous le souhaitez, prenez un moment pour respirer avec ce guide.
        4 secondes d&apos;inspiration, 6 secondes d&apos;expiration.
        Laissez votre corps trouver son rythme.
      </p>

      {/* Breathing circle */}
      <div className="flex flex-col items-center py-6">
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          {/* Outer ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 transition-all ${
              active ? "border-sage/40" : "border-sage/20"
            }`}
          />

          {/* Animated circle */}
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-transform ${
              active ? "bg-sage/30" : "bg-sage/15"
            } ${circleSize}`}
            style={{
              transitionDuration: active
                ? phase === "inspire"
                  ? "4000ms"
                  : "6000ms"
                : "500ms",
              transitionTimingFunction: "ease-in-out",
            }}
          >
            <div className="text-center">
              {active ? (
                <>
                  <div className="font-serif text-3xl text-espresso mb-1">
                    {countdown}
                  </div>
                  <div className="text-xs text-[#4A6B3A] font-medium">
                    {phaseLabel}
                  </div>
                </>
              ) : (
                <div className="text-sm text-[#4A6B3A] font-medium">
                  {cycles > 0 ? `${cycles} cycle${cycles > 1 ? "s" : ""}` : "Pret"}
                </div>
              )}
            </div>
          </div>

          {/* Progress arc (SVG) */}
          {active && phaseDuration > 0 && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 160 160"
            >
              <circle
                cx="80"
                cy="80"
                r="76"
                fill="none"
                stroke={phase === "inspire" ? "#8A9E7A" : "#C4704A"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 76}`}
                strokeDashoffset={`${2 * Math.PI * 76 * (1 - countdown / phaseDuration)}`}
                className="transition-all duration-1000 ease-linear"
                opacity={0.6}
              />
            </svg>
          )}
        </div>

        {/* Phase label below circle */}
        <div
          className={`text-base font-body mb-6 transition-colors duration-500 ${
            phase === "inspire"
              ? "text-[#4A6B3A]"
              : phase === "expire"
                ? "text-terra"
                : "text-warm-gray"
          }`}
        >
          {active ? phaseLabel : cycles > 0 ? "Respiration terminee" : ""}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!active ? (
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-sage text-cream rounded-xl text-sm font-medium hover:bg-sage/90 transition-all"
            >
              Commencer
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-6 py-2.5 bg-terra/20 text-terra rounded-xl text-sm font-medium hover:bg-terra/30 transition-all"
            >
              Arreter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
