"use client";

interface StepHeaderProps {
  stepNumber: number;
  stepName: string;
  totalSteps: number;
  currentIndex: number;
  hasCachedAI?: boolean;
}

/**
 * En-tête d'étape immersif : pastille dorée, nom, indicateur discret.
 */
export function StepHeader({ stepNumber, stepName, totalSteps, currentIndex, hasCachedAI }: StepHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-7">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-t-dore/80 flex items-center justify-center font-inter text-base font-semibold text-t-nuit shrink-0 shadow-[0_2px_8px_rgba(214,165,106,0.15)]">
          {stepNumber}
        </div>
        <div>
          <h2 className="font-inter text-xl font-medium text-t-beige leading-tight">
            {stepName}
          </h2>
          <p className="font-inter text-[11px] text-t-creme/35 mt-1 tracking-wide uppercase">
            Étape {currentIndex + 1} sur {totalSteps}
          </p>
        </div>
      </div>
      {hasCachedAI && (
        <span className="text-[10px] tracking-[0.08em] uppercase text-t-sauge bg-t-sauge/[0.10] px-2.5 py-1 rounded-full shrink-0">
          Reflet disponible
        </span>
      )}
    </div>
  );
}
