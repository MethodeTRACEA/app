"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { ExitLink } from "@/components/ui/ExitLink";
import { BreathingGuide } from "@/components/BreathingGuide";

// ════════════════════════════════════════════════════════════
// TRACÉA — Module S'entraîner
// Entraînement physiologique hors état d'activation.
// Route publique : /app/entrainement
// 3 écrans : choose → practice → done
// Aucun appel Supabase, aucune IA, aucun score.
// ════════════════════════════════════════════════════════════

type Screen = "choose" | "practice" | "done";
type ExerciseKey = "respiration" | "corps" | "regard";
type Phase = "intro" | "active" | "close";

const EXERCISES: { key: ExerciseKey; label: string; micro: string }[] = [
  { key: "respiration", label: "Respirer lentement", micro: "ralentir un peu" },
  { key: "corps",       label: "Revenir au corps",   micro: "revenir aux appuis" },
  { key: "regard",      label: "Se poser un moment", micro: "laisser de l'espace" },
];

// Textes des 3 phases par exercice
const TRAINING_TEXT: Record<ExerciseKey, [string, string, string]> = {
  respiration: [
    "Tu peux simplement suivre le mouvement",
    "Laisse l'expire durer un peu plus longtemps",
    "Ton corps enregistre ça",
  ],
  corps: [
    "Sens le contact sous tes pieds",
    "Laisse le poids descendre un peu",
    "Tu peux revenir ici quand ça monte",
  ],
  regard: [
    "Lève légèrement les yeux de l'écran",
    "Laisse ton regard se poser quelque part",
    "Ton corps s'oriente naturellement",
  ],
};

// Durée d'affichage de chaque phase pour corps & regard (ms)
const PHASE_DURATION = 5000;

export default function EntrainementPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("choose");
  const [exercise, setExercise] = useState<ExerciseKey | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");

  function startExercise(key: ExerciseKey) {
    setExercise(key);
    setPhase("intro");
    setScreen("practice");
  }

  function backToChoose() {
    setExercise(null);
    setScreen("choose");
  }

  // Auto-avance des phases pour corps & regard
  useEffect(() => {
    if (screen !== "practice" || !exercise || exercise === "respiration") return;
    if (phase === "intro") {
      const t = setTimeout(() => setPhase("active"), PHASE_DURATION);
      return () => clearTimeout(t);
    }
    if (phase === "active") {
      const t = setTimeout(() => setPhase("close"), PHASE_DURATION);
      return () => clearTimeout(t);
    }
  }, [screen, exercise, phase]);

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
            {EXERCISES.map((ex) => (
              <button
                key={ex.key}
                type="button"
                onClick={() => startExercise(ex.key)}
                className="w-full rounded-[20px] border border-[rgba(232,216,199,0.18)] bg-t-brume/20 px-5 py-4 text-left cursor-pointer transition-all duration-200 hover:bg-t-brume/35 hover:border-[rgba(232,216,199,0.30)]"
              >
                <span className="block font-body text-lg t-text-primary">
                  {ex.label}
                </span>
                <span className="block font-inter text-xs t-text-secondary mt-1">
                  {ex.micro}
                </span>
              </button>
            ))}
          </div>

          <ExitLink label="Quitter" href="/app" />
        </div>
      </ScreenContainer>
    );
  }

  // ── ÉCRAN 2 — Pratiquer ────────────────────────────────────
  if (screen === "practice" && exercise) {
    const texts = TRAINING_TEXT[exercise];

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
                    {texts[0]}
                  </p>
                  <PrimaryButton onClick={() => setPhase("active")}>
                    Commencer
                  </PrimaryButton>
                </>
              )}

              {phase === "active" && (
                <>
                  <p className="font-inter text-sm t-text-ghost text-center">
                    {texts[1]}
                  </p>
                  <BreathingGuide onComplete={() => setPhase("close")} />
                </>
              )}

              {phase === "close" && (
                <>
                  <p className="font-body text-xl t-text-secondary text-center leading-relaxed">
                    {texts[2]}
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

    // Corps & Regard — 3 phases texte, auto-avance
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

            <div className="text-center px-2">
              <p
                key={phase}
                className="font-body text-2xl t-text-primary leading-relaxed"
              >
                {phase === "intro"  ? texts[0]
                 : phase === "active" ? texts[1]
                 : texts[2]}
              </p>
            </div>

            {phase === "close" && (
              <PrimaryButton onClick={() => setScreen("done")}>
                Terminer
              </PrimaryButton>
            )}

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
              Plus tu le fais ici,<br />
              plus ça revient quand tu en as besoin.
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
