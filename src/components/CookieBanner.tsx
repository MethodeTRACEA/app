"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { hasCookieConsent, saveCookieConsent } from "@/lib/consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasCookieConsent()) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    saveCookieConsent({
      necessary: true,
      functional: true,
      date: new Date().toISOString(),
    });
    setVisible(false);
  }

  function handleNecessaryOnly() {
    saveCookieConsent({
      necessary: true,
      functional: false,
      date: new Date().toISOString(),
    });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[200] p-4 animate-fade-up">
      <div className="max-w-3xl mx-auto bg-white rounded-card border border-beige-dark shadow-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0 mt-1.5" />
          <div>
            <h3 className="font-serif text-lg text-espresso mb-1">
              Respect de ta vie privée
            </h3>
            <p className="font-body text-sm text-espresso leading-relaxed">
              TRACÉA conserve tes données de session dans une base de données
              sécurisée hébergée en Union européenne (Francfort, Allemagne) via Supabase.
              Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
              Seules tes préférences de consentement sont stockées localement dans ton navigateur.
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-4 h-4 rounded bg-sage flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
            <span className="text-espresso">
              <strong>Nécessaires</strong> · Consentement, fonctionnement de
              l&apos;app
            </span>
            <span className="text-xs text-warm-gray ml-auto">Toujours actifs</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-4 h-4 rounded bg-terra flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
            <span className="text-espresso">
              <strong>Fonctionnels</strong> · Sessions TRACÉA, profil, historique
            </span>
            <span className="text-xs text-warm-gray ml-auto">Recommandés</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={handleAccept} className="btn-primary !text-sm">
            Tout accepter
          </button>
          <button onClick={handleNecessaryOnly} className="btn-secondary !text-sm">
            Nécessaires uniquement
          </button>
          <Link
            href="/politique-confidentialite"
            className="text-xs text-warm-gray hover:text-terra transition-colors ml-auto"
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </div>
  );
}
