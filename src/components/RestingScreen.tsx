"use client";

import { useEffect, useState } from "react";
import { TraceCrest } from "@/components/TraceCrest";

// ── Écran de repos — « La brume se lève » ───────────────────────
// Deux photos superposées (brumeuse → dégagée, fondu ~8s), le chemin
// lumineux de TraceCrest par-dessus, contenu ancré en bas dans le scrim.

const MIST_FADE_MS = 8000;

export function RestingScreen({ seed, onDone }: { seed: string; onDone: () => void }) {
  const [mistVisible, setMistVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = mq.matches;
    setReducedMotion(reduced);
    if (reduced) {
      setMistVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setMistVisible(false));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-[60]" style={{ height: "100dvh" }}>
      {/* Couche 1 — photo dégagée (fond, toujours visible) */}
      <img
        src="/images/trace-clear.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Couche 2 — photo brumeuse, fond vers la dégagée */}
      <img
        src="/images/trace-misty.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: mistVisible ? 1 : 0,
          transition: reducedMotion ? "none" : `opacity ${MIST_FADE_MS}ms ease-in-out`,
        }}
      />

      {/* Couche 3 — le chemin lumineux, par-dessus les deux photos */}
      <TraceCrest seed={seed} />

      {/* Couche 4 — scrim bas pour la lisibilité du contenu */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(35,25,22,0), rgba(35,25,22,0.94) 70%)" }}
        aria-hidden="true"
      />

      {/* Couche 5 — contenu, ancré en bas */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 px-6 pb-10 pt-16 overflow-y-auto max-h-full">

        <p className="font-inter text-xs text-t-beige/80 text-center">
          Le tracé de cette traversée.
        </p>

        <button
          type="button"
          onClick={onDone}
          className="font-inter text-sm text-t-beige/90 hover:text-t-beige transition-colors"
        >
          C&apos;est bon pour moi.
        </button>

        <CompactSafetyResources />

      </div>
    </div>
  );
}

// Version compacte de SafetyResources, réservée à l'écran de repos : la carte
// pleine (SafetyResources) est visuellement trop imposante sur une photo. Le
// lien vers les ressources reste présent et jamais retiré (P0 doctrine),
// juste replié par défaut.
function CompactSafetyResources() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-inter text-xs text-t-beige/70 hover:text-t-beige/90 transition-colors underline decoration-t-beige/30 underline-offset-2"
      >
        Besoin d&apos;aide maintenant ?
      </button>

      {open && (
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="font-body text-sm text-t-beige/90">
            <a href="tel:3114" className="font-medium underline">3114</a> — Numéro national de prévention du suicide, 24h/24
          </p>
          <p className="font-body text-sm text-t-beige/90">
            SOS Amitié — <a href="tel:0972394050" className="underline">09 72 39 40 50</a>
          </p>
          <p className="font-body text-sm text-t-beige/90">
            Fil Santé Jeunes — <a href="tel:0800235236" className="underline">0 800 235 236</a>
          </p>
          <p className="font-inter text-xs text-t-beige/60 italic">
            Ces lignes sont gratuites, anonymes et confidentielles.
          </p>
        </div>
      )}
    </div>
  );
}
