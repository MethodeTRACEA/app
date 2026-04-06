"use client";

import type { ReactNode } from "react";

interface ScreenContainerProps {
  children: ReactNode;
  className?: string;
  /** Opacité de l'overlay sombre (défaut 35) — micro-variation par étape */
  overlayOpacity?: number;
  /** Image de fond (défaut : tracea-bg-step1.png) — permet un fond par étape */
  backgroundImage?: string;
}

/**
 * Conteneur plein écran immersif TRACÉA.
 * Se superpose à TOUT le layout (nav, footer) via fixed + z-[60].
 * Structure : image fond → overlay → contenu scrollable.
 */
export function ScreenContainer({ children, className = "", overlayOpacity = 35, backgroundImage = "/images/tracea-bg-step1.png" }: ScreenContainerProps) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Couche 1 — Image de fond (absolute, couvre tout) */}
      <img
        src={backgroundImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Couche 2 — Overlay sombre pour lisibilité */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(35,25,22,${overlayOpacity / 100})` }}
        aria-hidden="true"
      />

      {/* Couche 3 — Contenu scrollable */}
      <div className={`relative z-10 flex-1 overflow-y-auto px-6 ${className}`}>
        <div className="max-w-lg mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
