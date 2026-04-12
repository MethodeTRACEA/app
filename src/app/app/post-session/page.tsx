"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type Screen = "closure" | "bridge" | "paywall";

const LS_KEY = "tracea_post_session_seen";

export default function PostSessionPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("closure");

  // Mark as seen on first load — subsequent completions skip this page
  useEffect(() => {
    localStorage.setItem(LS_KEY, "true");
  }, []);

  const exit = () => router.push("/app");

  return (
    <ScreenContainer overlayOpacity={45}>
      <div className="py-12">

        {/* ── Écran 1 — Clôture ── */}
        {screen === "closure" && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
            <div className="text-center space-y-4">
              <p className="font-serif text-2xl text-t-beige leading-relaxed">
                C&apos;est suffisant pour maintenant.
              </p>
              <p className="font-body text-lg text-t-creme/60 leading-relaxed">
                Tu peux t&apos;arrêter là.
              </p>
            </div>
            <PrimaryButton onClick={() => setScreen("bridge")}>
              Terminer
            </PrimaryButton>
          </div>
        )}

        {/* ── Écran 2 — Pont ── */}
        {screen === "bridge" && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
            <div className="text-center space-y-6">
              <p className="font-body text-lg text-t-creme/80 leading-relaxed">
                Tu peux continuer seul<br />
                ou ne plus repartir de zéro.
              </p>
              <p className="font-body text-base text-t-creme/50 leading-relaxed">
                TRACÉA peut rester un moment ponctuel<br />
                ou devenir un repère dans le temps.
              </p>
            </div>
            <PrimaryButton onClick={() => setScreen("paywall")}>
              Voir comment
            </PrimaryButton>
          </div>
        )}

        {/* ── Écran 3 — Paywall ── */}
        {screen === "paywall" && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
            <div className="text-center space-y-4">
              <p className="font-body text-lg text-t-creme/80 leading-relaxed">
                Avec TRACÉA
              </p>
              <div className="space-y-2">
                <p className="font-body text-base text-t-creme/60 leading-relaxed">
                  Tu retrouves plus facilement ce que tu vis.
                </p>
                <p className="font-body text-base text-t-creme/60 leading-relaxed">
                  Tu vois ce qui revient.
                </p>
                <p className="font-body text-base text-t-creme/60 leading-relaxed">
                  Tu gardes ce qui t&apos;aide.
                </p>
              </div>
              <p className="font-serif text-xl text-t-beige pt-2">
                Tu ne repars plus de zéro.
              </p>
            </div>

            {/* Prix */}
            <div className="w-full flex flex-col gap-3">
              <div className="t-card p-5 text-center space-y-1">
                <p className="font-inter text-xs text-t-creme/40 uppercase tracking-wider">
                  Mensuel
                </p>
                <p className="font-serif text-2xl text-t-beige">9€</p>
                <p className="font-inter text-xs text-t-creme/40">par mois</p>
              </div>
              <div className="t-card p-5 text-center space-y-1 border-[rgba(232,216,199,0.30)]">
                <p className="font-inter text-xs text-t-creme/40 uppercase tracking-wider">
                  Annuel
                </p>
                <p className="font-serif text-2xl text-t-beige">79€</p>
                <p className="font-inter text-xs text-t-creme/40">par an · soit 6,60€/mois</p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-4">
              <PrimaryButton onClick={() => router.push("/app/subscribe")}>
                Continuer avec TRACÉA
              </PrimaryButton>
              <SecondaryButton onClick={exit}>
                Continuer sans abonnement
              </SecondaryButton>
            </div>
          </div>
        )}

      </div>
    </ScreenContainer>
  );
}
