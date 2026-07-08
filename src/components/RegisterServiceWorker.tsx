"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker (public/sw.js) au chargement de l'app.
 * Neutre : n'affiche rien, ne demande aucune permission, ne notifie
 * personne tant qu'aucun abonnement push n'existe (voir subscribeToPush
 * dans src/lib/push.ts, appelée uniquement depuis un geste utilisateur
 * — chantier 57, brique 57-3).
 *
 * Monté dans src/app/app/layout.tsx (scope /app/* uniquement — inutile
 * sur les pages publiques, aucun utilisateur connecté à y abonner).
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Échec silencieux : un navigateur sans support SW ne doit rien
      // faire sentir à l'utilisatrice, c'est le repli in-app qui prend
      // le relais (57-3/57-5).
    });
  }, []);

  return null;
}
