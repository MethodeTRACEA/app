"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb } from "@/lib/supabase-store";

/**
 * Composant invisible qui redirige vers /bienvenue
 * quand un nouvel utilisateur se connecte pour la première fois.
 * Ne se déclenche qu'une seule fois par session de navigation.
 */
export function OnboardingRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const checked = useRef(false);

  useEffect(() => {
    if (loading || !user) return;

    // Ne jamais interférer sur ces pages
    if (pathname === "/app/bienvenue" || pathname === "/app/connexion") return;

    // Ne vérifier qu'une seule fois par session de navigation
    if (checked.current) return;
    checked.current = true;

    // Si déjà vu, ne rien faire
    try {
      const alreadySeen = localStorage.getItem("tracea_onboarding_done");
      if (alreadySeen) return;
    } catch {
      return; // localStorage bloqué (iframe, etc.)
    }

    // Vérifier si c'est un tout nouvel utilisateur (0 sessions)
    getCompletedSessionsDb(user.id)
      .then((sessions) => {
        if (sessions.length === 0) {
          router.push("/app/bienvenue");
        } else {
          // Utilisateur existant avec des sessions → marquer comme vu
          localStorage.setItem("tracea_onboarding_done", "true");
        }
      })
      .catch(() => {
        // En cas d'erreur réseau/Supabase, ne pas bloquer
      });
  }, [user, loading, pathname, router]);

  return null;
}
