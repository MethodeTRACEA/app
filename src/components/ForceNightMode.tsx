"use client";

import { useEffect } from "react";

/**
 * Force le mode sombre TRACÉA tant que ce composant est monté.
 * Ajoute `night` sur <html> au montage et le retire au démontage.
 *
 * Utilisé dans src/app/app/layout.tsx pour scoper le mode sombre
 * aux routes /app/* uniquement (la landing publique et les pages
 * légales restent en mode clair par défaut).
 */
export function ForceNightMode() {
  useEffect(() => {
    document.documentElement.classList.add("night");
    return () => {
      document.documentElement.classList.remove("night");
    };
  }, []);
  return null;
}
