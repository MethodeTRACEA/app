"use client";

interface SafetyBannerProps {
  intensity: number;
}

export function SafetyBanner({ intensity }: SafetyBannerProps) {
  if (intensity < 8) return null;

  return (
    <p className="text-sm text-warm-gray italic mb-6 animate-fade-up">
      On va rester simple et court.
    </p>
  );
}
