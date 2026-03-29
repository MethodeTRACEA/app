"use client";

interface TraceaSymbolProps {
  size?: number;
  className?: string;
}

export function TraceaSymbol({ size = 40, className = "" }: TraceaSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Grand arc extérieur (style brush — ouvert en haut à gauche) */}
      <path
        d="M 38 12 C 60 6, 85 18, 90 45 C 95 72, 78 92, 50 94 C 22 96, 6 78, 8 52 C 10 30, 25 16, 38 12"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Petit arc intérieur (croissant) */}
      <path
        d="M 42 28 C 58 24, 72 34, 74 50 C 76 66, 64 78, 48 78 C 32 78, 22 66, 24 50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Point central */}
      <circle cx="50" cy="44" r="4" fill="currentColor" />
    </svg>
  );
}
