"use client";

interface SafetyBannerProps {
  intensity: number;
}

export function SafetyBanner({ intensity }: SafetyBannerProps) {
  if (intensity < 8) return null;

  return (
    <div className="safety-card animate-fade-up mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-terra animate-pulse-gentle flex-shrink-0" />
        <span className="font-medium text-sm text-terra-dark">
          Votre intensité est élevée
        </span>
      </div>
      <p className="text-sm text-espresso leading-relaxed font-body">
        Si vous traversez une période difficile ou ressentez une détresse
        importante, nous vous encourageons à consulter un professionnel de santé
        mentale. TRACÉA travaille avec ce qui est stable, jamais contre ce qui
        est encore fragile.
      </p>
      <p className="text-xs text-warm-gray mt-3">
        En cas d&apos;urgence : 3114 (numéro national de prévention du suicide)
      </p>
    </div>
  );
}
