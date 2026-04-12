"use client";

interface GazeGuideProps {
  onComplete: () => void;
}

export function GazeGuide({ onComplete }: GazeGuideProps) {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="text-center space-y-3">
        <p className="font-body text-lg text-t-beige/80">
          Laisse ton regard quitter l&apos;écran un instant
        </p>
        <p className="font-inter text-sm text-t-creme/40">
          quelque part autour de toi
        </p>
        <p className="font-inter text-sm text-t-creme/40">
          Sans chercher
        </p>
      </div>

      <button type="button" onClick={onComplete} className="t-btn-secondary">
        C&apos;est fait
      </button>
    </div>
  );
}
