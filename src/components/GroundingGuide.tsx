"use client";

interface GroundingGuideProps {
  onComplete: () => void;
}

export function GroundingGuide({ onComplete }: GroundingGuideProps) {
  return (
    <div className="flex flex-col items-center gap-10">
      {/* Halo visuel doux */}
      <div className="relative flex items-center justify-center">
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(214,165,106,0.05)",
            border: "1px solid rgba(214,165,106,0.12)",
            boxShadow: "0 0 40px rgba(214,165,106,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(214,165,106,0.08)",
          }}
        />
      </div>

      {/* Texte sobre */}
      <div className="text-center space-y-3">
        <p className="font-body text-lg text-t-beige/80">
          Pose ton attention ici
        </p>
        <p className="font-inter text-sm text-t-creme/40">
          Rien à faire
        </p>
        <p className="font-inter text-sm text-t-creme/40">
          Juste sentir
        </p>
      </div>

      <button type="button" onClick={onComplete} className="t-btn-secondary">
        C&apos;est fait
      </button>
    </div>
  );
}
