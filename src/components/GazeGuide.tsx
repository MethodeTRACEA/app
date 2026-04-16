"use client";

interface GazeGuideProps {
  onComplete: () => void;
}

export function GazeGuide({ onComplete }: GazeGuideProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-3">
        <p className="font-body text-xl t-text-primary">
          Laisse ton regard quitter l&apos;écran un instant
        </p>
        <p className="font-inter text-sm t-text-secondary">
          quelque part autour de toi
        </p>
        <p className="font-inter text-sm t-text-secondary">
          Sans chercher
        </p>
      </div>

      <button type="button" onClick={onComplete} className="t-btn-secondary">
        C&apos;est fait
      </button>
    </div>
  );
}
