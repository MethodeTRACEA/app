"use client";

import type { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

/**
 * Bouton principal TRACÉA : doré chaud, très arrondi (28px), h-14, ombre douce.
 * Classe de base : .t-btn-primary (définie dans globals.css).
 */
export function PrimaryButton({ children, onClick, disabled, className = "", type = "button" }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`t-btn-primary ${className}`}
    >
      {children}
    </button>
  );
}
