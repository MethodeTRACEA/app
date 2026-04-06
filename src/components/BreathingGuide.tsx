"use client";

import { useState, useEffect, useRef } from "react";

type Phase = "idle" | "inspire" | "expire" | "done";

interface BreathingGuideProps {
  onComplete?: () => void;
  /** Mode immersif TRACÉA : cercle doré, texte crème */
  immersive?: boolean;
}

export function BreathingGuide({ onComplete, immersive }: BreathingGuideProps) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cyclesRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    cyclesRef.current = 0;
    setCycles(0);
    setPhase("inspire");

    function runCycle() {
      // Inspire 5s (ralenti vs 4s)
      setPhase("inspire");

      timerRef.current = setTimeout(() => {
        // Expire 7s (ralenti vs 6s)
        setPhase("expire");

        timerRef.current = setTimeout(() => {
          cyclesRef.current += 1;
          setCycles(cyclesRef.current);

          if (cyclesRef.current >= 3) {
            setPhase("done");
            setTimeout(() => {
              onComplete?.();
            }, 1500);
          } else {
            runCycle();
          }
        }, 7000);
      }, 5000);
    }

    runCycle();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, onComplete]);

  const circleScale =
    phase === "inspire"
      ? "scale-100"
      : phase === "expire"
        ? "scale-[0.60]"
        : "scale-[0.75]";

  const transitionDuration =
    phase === "inspire"
      ? "5000ms"
      : phase === "expire"
        ? "7000ms"
        : "1000ms";

  const label =
    phase === "inspire"
      ? "Inspire…"
      : phase === "expire"
        ? "Relâche…"
        : phase === "done"
          ? "C'est bien"
          : "";

  if (!active) {
    return (
      <div className={`flex flex-col items-center ${immersive ? "py-12 mb-6" : "py-6 mb-4"}`}>
        {immersive ? (
          <>
            {/* Cercle idle immersif — double halo */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full bg-t-dore/[0.04] shadow-[0_0_60px_rgba(214,165,106,0.06)]" />
              <div className="w-24 h-24 rounded-full bg-t-dore/[0.08] shadow-[0_0_30px_rgba(214,165,106,0.10)]" />
            </div>
            <button
              onClick={() => setActive(true)}
              className="t-btn-secondary"
            >
              Commencer
            </button>
          </>
        ) : (
          <>
            <div className="w-28 h-28 rounded-full bg-terra/8 flex items-center justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-terra/12" />
            </div>
            <button
              onClick={() => setActive(true)}
              className="px-6 py-2.5 rounded-full text-sm font-medium border border-beige-dark text-espresso/70 hover:border-warm-gray hover:text-espresso transition-all"
            >
              Commencer
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${immersive ? "py-14 mb-6" : "py-6 mb-4"}`}>
      {immersive ? (
        /* Cercle actif immersif — plus grand, halo dynamique */
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Halo externe */}
          <div
            className={`absolute inset-[-16px] rounded-full transition-all ease-in-out ${circleScale}`}
            style={{
              transitionDuration,
              background: "radial-gradient(circle, rgba(214,165,106,0.06) 0%, transparent 70%)",
            }}
          />
          {/* Cercle principal */}
          <div
            className={`w-40 h-40 rounded-full flex items-center justify-center transition-all ease-in-out ${circleScale}`}
            style={{
              transitionDuration,
              background: "radial-gradient(circle, rgba(214,165,106,0.12) 0%, rgba(214,165,106,0.04) 100%)",
              boxShadow: "0 0 50px rgba(214,165,106,0.10), 0 0 20px rgba(214,165,106,0.06) inset",
            }}
          >
            <p className="font-inter text-sm text-t-dore/90 text-center select-none tracking-wide">
              {label}
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`w-28 h-28 rounded-full bg-terra/10 flex items-center justify-center transition-transform ease-in-out ${circleScale}`}
          style={{ transitionDuration }}
        >
          <p className="font-body text-xs text-terra/80 text-center px-3 leading-relaxed select-none">
            {label}
          </p>
        </div>
      )}
      <div className={`flex gap-2 ${immersive ? "mt-8" : "mt-5"}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`rounded-full transition-colors duration-700 ${
              immersive ? "w-2 h-2" : "w-1.5 h-1.5"
            } ${
              i < cycles
                ? (immersive ? "bg-t-dore/60" : "bg-terra/50")
                : (immersive ? "bg-t-creme/15" : "bg-beige-dark")
            }`}
          />
        ))}
      </div>
    </div>
  );
}
