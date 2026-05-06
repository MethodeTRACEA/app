"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
// TRACÉA — Module S'entraîner
// Entraînement physiologique hors état d'activation.
// Route publique : /app/entrainement
// 3 écrans : choose → practice → done
// Aucun appel Supabase, aucune IA, aucun score.
// ════════════════════════════════════════════════════════════

type Screen = "choose" | "practice" | "done" | "paywall";
type ExerciseKey = "respiration" | "corps" | "regard";
type Phase = "intro" | "active" | "close";

const EXERCISES: { key: ExerciseKey; label: string; micro: string }[] = [
  { key: "respiration", label: "Respirer lentement", micro: "ralentir un peu" },
  { key: "corps",       label: "Revenir au corps",   micro: "revenir aux appuis" },
  { key: "regard",      label: "Se poser un moment", micro: "laisser de l'espace" },
];

// Textes des 3 phases pour la respiration (corps & regard délégués aux composants partagés)
const BREATHING_PHASES = [
  "Tu peux simplement suivre le mouvement",
  "Laisse l'expire durer un peu plus longtemps",
  "Tu peux recommencer quand tu veux.",
] as const;

export default function EntrainementPage() {
  return (
    <Suspense>
      <EntrainementInner />
    </Suspense>
  );
}

function EntrainementInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPremiumAccess } = useAuth();
  const [screen, setScreen] = useState<Screen>("choose");
  const [exercise, setExercise] = useState<ExerciseKey | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");

  const PREMIUM_EXERCISES: ExerciseKey[] = ["corps", "regard"];

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

  // ── APERÇU PAYWALL (mode preview via ?previewPaywall=1) ────
  if (searchParams.get("previewPaywall") === "1" || screen === "paywall") {
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

          <div className="text-center space-y-3">
            <h1 className="font-serif text-3xl text-t-beige">
              S&apos;entraîner
            </h1>
            <p className="font-body text-base t-text-secondary leading-relaxed">
              Ce que tu fais ici s&apos;ancre avec le temps.
            </p>
            <p className="font-body text-base t-text-secondary">
              Tu peux t&apos;y entraîner même quand ça va.
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

          {/* Traversée approfondie */}
          <div className="w-full">
            <div className="w-full h-px bg-[rgba(232,216,199,0.12)] mb-3" />
            {hasPremiumAccess ? (
              <Link
                href="/app/session?from=entrainement"
                className="w-full rounded-[20px] border border-[rgba(232,216,199,0.18)] bg-t-brume/20 px-5 py-4 text-left cursor-pointer transition-all duration-200 hover:bg-t-brume/35 hover:border-[rgba(232,216,199,0.30)] block"
              >
                <span className="font-body text-lg t-text-primary block">
                  Traversée approfondie
                </span>
                <span className="block font-inter text-xs t-text-secondary mt-1">
                  Comprendre ce que tu vis et avancer plus consciemment
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setScreen("paywall")}
                className="w-full rounded-[20px] border border-[rgba(232,216,199,0.18)] bg-t-brume/20 px-5 py-4 text-left cursor-pointer transition-all duration-200 hover:bg-t-brume/35 hover:border-[rgba(232,216,199,0.30)]"
              >
                <span className="flex items-center justify-between">
                  <span className="font-body text-lg t-text-primary">Traversée approfondie</span>
                  <span className="text-xs t-text-secondary opacity-60">Premium</span>
                </span>
                <span className="block font-inter text-xs t-text-secondary mt-1">
                  Comprendre ce que tu vis et avancer plus consciemment
                </span>
              </button>
            )}
          </div>

          <ExitLink label="Quitter" href="/app" />
        </div>
      </ScreenContainer>
    );
  }

  // ── ÉCRAN 2 — Pratiquer ────────────────────────────────────
  if (screen === "practice" && exercise) {

    // Respiration — intro → BreathingGuide → close
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
                  <BreathingGuide onComplete={() => setPhase("close")} onCancel={backToChoose} />
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

    // Corps & Regard — composants partagés avec phases intégrées
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
              ? <GroundingGuide onComplete={() => setScreen("done")} onCancel={backToChoose} />
              : <GazeGuide onComplete={() => setScreen("done")} onCancel={backToChoose} />
            }

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ── ÉCRAN 3 — Clôture ──────────────────────────────────────
  return (
    <ScreenContainer overlayOpacity={45}>
      <div className="py-12">
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">

          <div className="text-center space-y-4">
            <p className="font-body text-xl t-text-primary leading-relaxed">
              À force de répétitions, tu remarques que quelque chose change.
            </p>
            <p className="font-inter text-sm t-text-ghost">
              Même quelques secondes suffisent.
            </p>
          </div>

          <p className="font-body text-base t-text-secondary text-center">
            Tu peux t&apos;arrêter là.
          </p>

          <div className="w-full space-y-3">
            <PrimaryButton onClick={() => router.push("/app")}>
              Terminer
            </PrimaryButton>
            <SecondaryButton onClick={backToChoose}>
              Refaire
            </SecondaryButton>
          </div>

        </div>
      </div>
    </ScreenContainer>
  );
}
