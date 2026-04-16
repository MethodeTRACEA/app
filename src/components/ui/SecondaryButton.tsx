"use client";

import type { ReactNode } from "react";

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

/**
 * Bouton secondaire TRACÉA : fond translucide, contour bronze doux.
 * Même signature que PrimaryButton. Hiérarchie par poids visuel, pas par forme.
 * Classe de base : .t-btn-secondary (définie dans globals.css).
 */
export function SecondaryButton({ children, onClick, disabled, className = "", type = "button" }: SecondaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`t-btn-secondary ${className}`}
    >
      {children}
    </button>
  );
}
