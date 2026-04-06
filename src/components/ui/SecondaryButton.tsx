"use client";

import type { ReactNode } from "react";

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Bouton secondaire TRACÉA : fond translucide, contour bronze doux.
 * Classe de base : .t-btn-secondary (définie dans globals.css).
 */
export function SecondaryButton({ children, onClick, disabled, className = "" }: SecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`t-btn-secondary ${className}`}
    >
      {children}
    </button>
  );
}
