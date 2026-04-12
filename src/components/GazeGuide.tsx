"use client";

interface GazeGuideProps {
  onComplete: () => void;
}

export function GazeGuide({ onComplete }: GazeGuideProps) {
  return (
    <div className="flex flex-col items-center gap-10">
      {/* Repère visuel stable */}
      <div className="relative flex items-center justify-center">
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(214,165,106,0.04)",
            border: "1px solid rgba(214,165,106,0.14)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "rgba(214,165,106,0.22)",
          }}
        />
      </div>

      {/* Texte sobre */}
      <div className="text-center space-y-3">
        <p className="font-body text-lg text-t-beige/80">
          Laisse ton regard se poser
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
