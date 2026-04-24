"use client";

import { useState, useEffect } from "react";

// ════════════════════════════════════════════════════════════
// InstallPrompt — bloc discret PWA affiché après une session.
// Déclenche le prompt natif sur Android/Chrome.
// Affiche une aide textuelle sur iOS ou navigateurs non compatibles.
// Masqué si déjà installé ou si l'utilisateur a cliqué "Plus tard".
// ════════════════════════════════════════════════════════════

type Platform = "android" | "ios" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches
    || ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => Promise<void> } | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const platform = detectPlatform();

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem("pwa_dismissed") === "1") return;
    setVisible(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => Promise<void> });
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  async function handleAdd() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setVisible(false);
      return;
    }
    if (platform === "ios") {
      setInstructions("Sur iPhone : touche l'icône Partager en bas de l'écran, puis « Ajouter à l'écran d'accueil ».");
    } else {
      setInstructions("Ouvre le menu de ton navigateur (⋮), puis « Ajouter à l'écran d'accueil ».");
    }
  }

  function handleDismiss() {
    sessionStorage.setItem("pwa_dismissed", "1");
    setVisible(false);
  }

  return (
    <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.15)] bg-white/5 px-5 py-4 space-y-3">
      <p className="font-body text-sm t-text-secondary leading-relaxed text-center">
        Ajoute TRACÉA à ton écran d&apos;accueil.
        <br />
        <span className="t-text-ghost text-xs">
          Comme ça, quand ça monte, tu peux revenir ici en un geste.
        </span>
      </p>

      {instructions ? (
        <p className="font-inter text-xs t-text-ghost text-center leading-relaxed">
          {instructions}
        </p>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-xl bg-t-beige/10 border border-t-beige/20 py-2.5 font-inter text-sm t-text-secondary hover:bg-t-beige/15 transition-colors"
          >
            Ajouter à l&apos;écran d&apos;accueil
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full text-center font-inter text-xs t-text-ghost py-1.5 opacity-60 hover:opacity-100 transition-opacity"
          >
            Plus tard
          </button>
        </div>
      )}
    </div>
  );
}
