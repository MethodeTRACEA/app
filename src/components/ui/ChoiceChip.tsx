"use client";

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Chip de choix TRACÉA : arrondie, 2-3 colonnes max mobile.
 * Sélectionnée → bordure dorée + fond lumineux.
 * Classes de base : .t-chip + .t-chip-active (définis dans globals.css).
 */
export function ChoiceChip({ label, selected, onClick, className = "" }: ChoiceChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`t-chip ${selected ? "t-chip-active" : ""} ${className}`}
    >
      {label}
    </button>
  );
}
