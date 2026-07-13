"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { trackEvent } from "@/lib/supabase-store";
import { isRunningInTWA } from "@/lib/twa";

// TRACÉA — Mesure du contexte TWA (chantier 60, correction 8).
// Pose un événement d'usage `app_context` une seule fois par session
// quand l'app tourne dans la TWA Play Store, pour pouvoir rouvrir un
// jour l'arbitrage Play Billing avec des chiffres. Aucune donnée
// nouvelle : trackEvent est déjà gaté par le consentement cookies
// (bandeau `functional`), et l'événement ne porte aucun contenu.
// Monté dans src/app/app/layout.tsx, n'affiche rien.

const SENT_KEY = "tracea_twa_event_sent";

export function TwaContextMarker() {
  const { user, loading: authLoading } = useAuth();
  const fired = useRef(false);

  useEffect(() => {
    if (authLoading || fired.current) return;
    if (!isRunningInTWA()) return;
    try {
      if (sessionStorage.getItem(SENT_KEY) === "1") return;
      sessionStorage.setItem(SENT_KEY, "1");
    } catch {
      // Sans sessionStorage, le ref évite au moins les doublons
      // dans la même page ; on n'empile pas de garde supplémentaire.
    }
    fired.current = true;
    trackEvent(user?.id ?? null, "app_context", { context: "twa" });
  }, [authLoading, user]);

  return null;
}
