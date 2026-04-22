"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Paywall } from "@/components/Paywall";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { ExitLink } from "@/components/ui/ExitLink";
import { BreathingGuide } from "@/components/BreathingGuide";
import { GroundingGuide } from "@/components/GroundingGuide";
import { GazeGuide } from "@/components/GazeGuide";

// ════════════════════════════════════════════════════════════
// TRACÉA — Accès immédiat aux exercices
// Entrée d'urgence sans traversée complète.
// Route : /app/urgence
// Réutilise les exercices de S'entraîner, gating premium identique.
// ════════════════════════════════════════════════════════════

type Screen = "choose" | "practice" | "done" | "paywall";
type ExerciseKey = "respiration" | "corps" | "regard";
type Phase = "intro" | "active" | "close";

const EXERCISES: { key: ExerciseKey; label: string; micro: string }[] = [
  { key: "respiration", label: "Respirer lentement", micro: "ralentir un peu" },
  { key: "corps",       label: "Revenir au corps",   micro: "revenir aux appuis" },
  { key: "regard",      label: "Se poser un moment", micro: "laisser de l'espace" },
];

const BREATHING_PHASES = [
  "Tu peux simplement suivre le mouvement",
  "Laisse l'expire durer un peu plus longtemps",
  "Ton corps enregistre ça",
] as const;

const PREMIUM_EXERCISES: ExerciseKey[] = ["corps", "regard"];

export default function UrgencePage() {
  return (
    <Suspense>
      <UrgenceInner />
    </Suspense>
  );
}

function UrgenceInner() {
  const router = useRouter();
  const { hasPremiumAccess } = useAuth();
  const [screen, setScreen] = useState<Screen>("choose");
  const [exercise, setExercise] = useState<ExerciseKey | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");

  function startExercise(key: ExerciseKey) {
    if (!hasPremiumAccess && PREMIUM_EXERCISES.includes(key)) {
      setScreen("paywall");
      return;
    }
    setExercise(key);
    setPhase("intro");
    setScreen("practice");
  }

  function backToChoose() {
    setExercise(null);
    setScreen("choose");
  }

  // ── PAYWALL ────────────────────────────────────────────────
  if (screen === "paywall") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Paywall onContinue={() => setScreen("choose")} />
        </div>
      </ScreenContainer>
    );
  }

  // ── ÉCRAN 1 — Choisir ──────────────────────────────────────
  if (screen === "choose") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 py-12">

          <div className="text-center">
            <p className="font-serif text-2xl text-t-beige">
              On va revenir à quelque chose de simple.
            </p>
          </div>

          <div className="w-full space-y-3">
            {EXERCISES.map((ex) => {
              const locked = !hasPremiumAccess && PREMIUM_EXERCISES.includes(ex.key);
              return (
                <button
                  key={ex.key}
                  type="button"
                  onClick={() => startExercise(ex.key)}
                  className="w-full rounded-[20px] border border-[rgba(232,216,199,0.18)] bg-t-brume/20 px-5 py-4 text-left cursor-pointer transition-all duration-200 hover:bg-t-brume/35 hover:border-[rgba(232,216,199,0.30)]"
                >
                  <span className="flex items-center justify-between">
                    <span className="font-body text-lg t-text-primary">{ex.label}</span>
                    {locked && <span className="text-xs t-text-secondary opacity-60">Premium</span>}
                  </span>
                  <span className="block font-inter text-xs t-text-secondary mt-1">
                    {ex.micro}
                  </span>
                </button>
              );
            })}
          </div>

          <ExitLink label="Retour" href="/app" />
        </div>
      </ScreenContainer>
    );
  }

  // ── ÉCRAN 2 — Pratiquer ────────────────────────────────────
  if (screen === "practice" && exercise) {

    if (exercise === "respiration") {
      return (
        <ScreenContainer overlayOpacity={45}>
          <div className="py-12">
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

              <button
                type="button"
                onClick={backToChoose}
                className="self-start font-inter text-xs t-text-ghost"
              >
                ← Retour
              </button>

              {phase === "intro" && (
                <>
                  <p className="font-body text-xl t-text-secondary text-center leading-relaxed">
                    {BREATHING_PHASES[0]}
                  </p>
                  <PrimaryButton onClick={() => setPhase("active")}>
                    Commencer
                  </PrimaryButton>
                </>
              )}

              {phase === "active" && (
                <>
                  <p className="font-inter text-sm t-text-ghost text-center">
                    {BREATHING_PHASES[1]}
                  </p>
                  <BreathingGuide onComplete={() => setPhase("close")} />
                </>
              )}

              {phase === "close" && (
                <>
                  <p className="font-body text-xl t-text-secondary text-center leading-relaxed">
                    {BREATHING_PHASES[2]}
                  </p>
                  <PrimaryButton onClick={() => setScreen("done")}>
                    Terminer
                  </PrimaryButton>
                </>
              )}

            </div>
          </div>
        </ScreenContainer>
      );
    }

    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

            <button
              type="button"
              onClick={backToChoose}
              className="self-start font-inter text-xs t-text-ghost"
            >
              ← Retour
            </button>

            {exercise === "corps"
              ? <GroundingGuide onComplete={() => setScreen("done")} />
              : <GazeGuide onComplete={() => setScreen("done")} />
            }

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ── ÉCRAN 3 — Sortie douce ─────────────────────────────────
  return (
    <ScreenContainer overlayOpacity={45}>
      <div className="py-12">
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">

          <div className="text-center space-y-2">
            <p className="font-body text-xl t-text-primary leading-relaxed">
              Tu peux t&apos;arrêter ici
            </p>
            <p className="font-inter text-sm t-text-ghost">
              ou continuer si tu en ressens le besoin.
            </p>
          </div>

          <div className="w-full space-y-3">
            <PrimaryButton onClick={backToChoose}>
              Continuer
            </PrimaryButton>
            <SecondaryButton onClick={() => router.push("/app/traversee-courte")}>
              Faire une travers&eacute;e
            </SecondaryButton>
          </div>

        </div>
      </div>
    </ScreenContainer>
  );
}
