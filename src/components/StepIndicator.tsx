"use client";

import { STEPS } from "@/lib/steps";

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  activeSteps?: number[];
  /** Mode immersif TRACÉA : dots translucides dorés */
  immersive?: boolean;
}

export function StepIndicator({
  currentStep,
  completedSteps,
  activeSteps,
  immersive,
}: StepIndicatorProps) {
  const filteredSteps = activeSteps
    ? STEPS.filter((_, i) => activeSteps.includes(i))
    : STEPS;

  const totalSteps = filteredSteps.length;

  // ── Mode immersif (étape 1 TRACÉA) ──
  if (immersive) {
    return (
      <div className="flex items-center justify-center gap-3 py-3">
        {filteredSteps.map((step, i) => {
          const originalIndex = activeSteps ? activeSteps[i] : i;
          const isCompleted = completedSteps.includes(originalIndex);
          const isCurrent = originalIndex === currentStep;

          return (
            <div
              key={step.id}
              className={`rounded-full transition-all duration-300 ${
                isCurrent
                  ? "w-10 h-3 bg-t-dore shadow-[0_0_10px_rgba(214,165,106,0.35)]"
                  : isCompleted
                  ? "w-3 h-3 bg-t-dore/70"
                  : "w-3 h-3 bg-t-creme/30"
              }`}
            />
          );
        })}
      </div>
    );
  }

  // ── Mode standard (étapes 2–6) ──
  return (
    <>
      {/* ── MOBILE : lettres T·R·A·C·E·A lisibles ── */}
      <div className="md:hidden">
        <div
          className="flex items-center justify-center gap-1.5 py-3"
          aria-label="Étapes T·R·A·C·E·A"
        >
          {filteredSteps.map((step, i) => {
            const originalIndex = activeSteps ? activeSteps[i] : i;
            const isCompleted = completedSteps.includes(originalIndex);
            const isCurrent = originalIndex === currentStep;

            return (
              <span key={step.id} className="flex items-center gap-1.5">
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className={`font-serif transition-all duration-300 inline-block leading-none ${
                    isCurrent
                      ? "text-base font-semibold text-terra scale-110"
                      : isCompleted
                      ? "text-sm text-sage"
                      : "text-sm text-warm-gray/45"
                  }`}
                >
                  {step.verb}
                </span>
                {i < filteredSteps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="text-xs leading-none select-none text-terra/30"
                  >
                    ·
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP : barres horizontales classiques ── */}
      <div className="hidden md:flex items-center justify-center gap-1 py-4">
        {STEPS.map((step, i) => {
          const isCompleted = completedSteps.includes(i);
          const isCurrent = i === currentStep;
          const isInactive =
            activeSteps !== undefined && !activeSteps.includes(i);

          return (
            <div
              key={step.id}
              className={`flex items-center ${isInactive ? "opacity-20" : ""}`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-serif transition-all duration-300 ${
                    isCurrent
                      ? "bg-terra text-cream scale-110 shadow-md"
                      : isCompleted
                      ? "bg-sage text-cream"
                      : "bg-beige-dark text-warm-gray"
                  }`}
                >
                  {isCompleted ? "✓" : step.verb}
                </div>
                <span
                  className={`text-[0.6rem] mt-1 font-medium tracking-wider uppercase ${
                    isCurrent
                      ? "text-terra"
                      : isCompleted
                      ? "text-sage"
                      : "text-warm-gray/50"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-4 h-[2px] mx-0.5 mt-[-12px] ${
                    isCompleted ? "bg-sage" : "bg-beige-dark"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
