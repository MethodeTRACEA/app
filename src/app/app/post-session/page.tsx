"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type Screen = "micro-check" | "closure" | "bridge";

const LS_KEY = "tracea_post_session_seen";

export default function PostSessionPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("micro-check");

  // Mark as seen on first load — subsequent completions skip this page
  useEffect(() => {
    localStorage.setItem(LS_KEY, "true");
  }, []);

  const exit = () => router.push("/app");

  return (
    <ScreenContainer overlayOpacity={45}>
      <div className="py-12">

        {/* ── Écran 0 — Micro-check ── */}
        {screen === "micro-check" && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
            <p className="font-serif text-2xl text-t-beige text-center leading-relaxed">
              Ça t&apos;a aidé un peu ?
            </p>
            <div className="w-full flex flex-col gap-3">
              {(["Oui", "Un peu", "Pas vraiment"] as const).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setScreen("closure")}
                  className="w-full text-center rounded-full font-inter text-sm font-medium px-5 py-3 cursor-pointer transition-all duration-200 bg-t-brume/30 text-t-beige border border-[rgba(232,216,199,0.45)] hover:bg-t-brume/55 hover:border-[rgba(232,216,199,0.70)] hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Écran 1 — Clôture ── */}
        {screen === "closure" && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
            <div className="text-center space-y-4">
              <p className="font-serif text-2xl text-t-beige leading-relaxed">
                C&apos;est suffisant pour maintenant.
              </p>
              <p className="font-body text-lg t-text-secondary leading-relaxed">
                Tu peux t&apos;arrêter là.
              </p>
            </div>
            <div className="w-full flex flex-col items-center gap-4">
              <PrimaryButton onClick={exit}>
                Terminer
              </PrimaryButton>
              <button
                type="button"
                onClick={() => setScreen("bridge")}
                className="font-inter text-xs t-text-ghost hover:t-text-secondary transition-colors underline underline-offset-[3px]"
              >
                Voir comment garder une trace
              </button>
            </div>
          </div>
        )}

        {/* ── Écran 2 — Pont ── */}
        {screen === "bridge" && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
            <div className="text-center space-y-6">
              <p className="font-body text-lg t-text-primary leading-relaxed">
                Tu peux t&apos;arrêter ici.<br />
                Ou choisir de garder une trace de ce qui t&apos;aide.
              </p>
              <p className="font-body text-base t-text-secondary leading-relaxed">
                TRACÉA peut rester un moment ponctuel<br />
                ou devenir un repère dans le temps.
              </p>
            </div>
            <PrimaryButton onClick={() => router.push("/app/espace")}>
              Voir comment
            </PrimaryButton>
          </div>
        )}

      </div>
    </ScreenContainer>
  );
}
