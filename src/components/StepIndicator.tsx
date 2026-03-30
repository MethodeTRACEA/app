"use client";

import { STEPS } from "@/lib/steps";

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  activeSteps?: number[];
}

export function StepIndicator({
  currentStep,
  completedSteps,
  activeSteps,
}: StepIndicatorProps) {
  const filteredSteps = activeSteps
    ? STEPS.filter((_, i) => activeSteps.includes(i))
    : STEPS;

  const currentIndex = activeSteps
    ? activeSteps.indexOf(currentStep)
    : currentStep;

  const totalSteps = filteredSteps.length;

  return (
    <>
      {/* ── MOBILE : dots compacts + label ── */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-2 py-3">
          {filteredSteps.map((step, i) => {
            const originalIndex = activeSteps ? activeSteps[i] : i;
            const isCompleted = completedSteps.includes(originalIndex);
            const isCurrent = originalIndex === currentStep;

            return (
              <div
                key={step.id}
                className={`rounded-full transition-all duration-300 ${
                  isCurrent
                    ? "w-8 h-2.5 bg-terra"
                    : isCompleted
                    ? "w-2.5 h-2.5 bg-sage"
                    : "w-2.5 h-2.5 bg-beige-dark"
                }`}
              />
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
