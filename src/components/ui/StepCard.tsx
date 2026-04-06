"use client";

import type { ReactNode } from "react";

interface StepCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Carte vitrée TRACÉA : fond translucide, blur, bordure subtile.
 * Classe de base : .t-card (définie dans globals.css).
 */
export function StepCard({ children, className = "" }: StepCardProps) {
  return (
    <div className={`t-card ${className}`}>
      {children}
    </div>
  );
}
