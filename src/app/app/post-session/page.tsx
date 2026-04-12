"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type Screen = "micro-check" | "closure" | "bridge" | "paywall";

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
            <div className="text-center space-y-6">
              <p className="font-serif text-2xl text-t-beige leading-relaxed">
                Là, tu viens de revenir un peu.
              </p>
              <p className="font-body text-lg text-t-creme/70 leading-relaxed">
                La prochaine fois que ça monte,<br />
                tu pourras revenir plus vite.
              </p>
              <div className="space-y-1">
                <p className="font-body text-base text-t-creme/50 leading-relaxed">
                  Sans chercher.<br />
                  Sans réfléchir.
                </p>
                <p className="font-body text-base text-t-creme/50 leading-relaxed">
                  Juste reprendre là où tu en étais.
                </p>
              </div>
            </div>

            {/* Prix */}
            <div className="w-full flex flex-col gap-3">
              <div className="t-card p-5 text-center space-y-1">
                <p className="font-inter text-xs text-t-creme/40 uppercase tracking-wider">
                  Mensuel
                </p>
                <p className="font-serif text-2xl text-t-beige">9€</p>
                <p className="font-inter text-xs text-t-creme/40">par mois</p>
                <p className="font-inter text-xs text-t-creme/25 mt-1">Moins qu&apos;un café par semaine</p>
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
                Continuer seul
              </SecondaryButton>
            </div>
          </div>
        )}

      </div>
    </ScreenContainer>
  );
}
