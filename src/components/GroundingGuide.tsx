"use client";

interface GroundingGuideProps {
  onComplete: () => void;
}

export function GroundingGuide({ onComplete }: GroundingGuideProps) {
  return (
    <div className="flex flex-col items-center gap-10">
      {/* Texte sobre */}
      <div className="text-center space-y-3">
        <p className="font-body text-lg t-text-primary">
          Sens le contact de tes pieds au sol
        </p>
        <p className="font-inter text-sm t-text-secondary">
          Rien à faire
        </p>
        <p className="font-inter text-sm t-text-secondary">
          Juste sentir
        </p>
      </div>

      <button type="button" onClick={onComplete} className="t-btn-secondary">
        C&apos;est fait
      </button>
    </div>
  );
}
