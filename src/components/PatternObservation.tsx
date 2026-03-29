"use client";

interface PatternObservationProps {
  observation: string;
}

export function PatternObservation({ observation }: PatternObservationProps) {
  if (!observation || observation.trim() === "") return null;

  return (
    <div className="ml-6 mt-2 mb-2">
      <div className="border-l-[3px] border-sage/50 pl-5 py-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-sage/60" />
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-sage">
            Ce que TRACÉA remarque
          </p>
        </div>
        <p className="font-body text-sm text-espresso/70 leading-relaxed italic">
          {observation}
        </p>
        <p className="text-[10px] text-warm-gray/60 mt-2 leading-relaxed">
          Cette observation est basée sur tes sessions précédentes. Elle reste une hypothèse, pas une vérité.
        </p>
      </div>
    </div>
  );
}
