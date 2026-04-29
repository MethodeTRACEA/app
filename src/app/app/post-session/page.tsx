"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type Screen = "micro-check" | "closure" | "bridge" | "paywall";

const LS_KEY = "tracea_post_session_seen";

export default function PostSessionPage() {
  const router = useRouter();
  const { hasPremiumAccess } = useAuth();
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
            <PrimaryButton onClick={() => hasPremiumAccess ? router.push("/app/ce-qui-change") : setScreen("paywall")}>
              Voir comment
            </PrimaryButton>
          </div>
        )}

        {/* ── Écran 3 — Paywall ── */}
        {screen === "paywall" && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            {/* Copy émotionnelle — rythme serré, lecture fluide */}
            <div className="text-center space-y-4">
              <p className="font-serif text-2xl text-t-beige leading-relaxed">
                Là, tu viens de revenir un peu.
              </p>
              <p className="font-body text-lg t-text-secondary leading-relaxed">
                La prochaine fois que ça monte,<br />
                tu pourras revenir plus vite.
              </p>
              <div className="space-y-1">
                <p className="font-body text-base t-text-secondary leading-relaxed">
                  Sans chercher.<br />
                  Sans réfléchir.
                </p>
                <p className="font-body text-base t-text-secondary leading-relaxed">
                  Juste reprendre là où tu en étais.
                </p>
              </div>
            </div>

            {/* Prix */}
            <div className="w-full flex flex-col gap-3">
              <div className="t-card p-5 text-center space-y-1">
                <p className="font-inter text-xs t-text-secondary uppercase tracking-wider">
                  Mensuel
                </p>
                <p className="font-serif text-2xl text-t-beige">9€</p>
                <p className="font-inter text-xs t-text-secondary">par mois</p>
              </div>
              <div className="t-card p-5 text-center space-y-1 border-[rgba(232,216,199,0.30)]">
                <p className="font-inter text-xs t-text-secondary uppercase tracking-wider">
                  Annuel
                </p>
                <p className="font-serif text-2xl text-t-beige">78€</p>
                <p className="font-inter text-xs t-text-secondary">par an · soit 6,50€/mois</p>
              </div>
            </div>

            {/* Zone de décision — visuellement séparée */}
            <div className="w-full flex flex-col gap-4 pt-2">
              <PrimaryButton onClick={() => router.push("/app/subscribe")}>
                Continuer avec TRACÉA
              </PrimaryButton>
              <SecondaryButton onClick={exit}>
                Continuer librement
              </SecondaryButton>
            </div>
          </div>
        )}

      </div>
    </ScreenContainer>
  );
}
