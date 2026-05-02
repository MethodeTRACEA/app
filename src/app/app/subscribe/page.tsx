"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type Plan = "monthly" | "yearly";

export default function SubscribePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");

  return (
    <ScreenContainer overlayOpacity={45}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 py-12">

        {/* Accroche */}
        <div className="text-center space-y-4">
          <p className="font-serif text-2xl text-t-beige leading-relaxed">
            Ne repars plus de zéro.
          </p>
          <p className="font-body text-base t-text-secondary leading-relaxed">
            TRACÉA garde la trace de ce qui t&apos;aide,<br />
            de ce qui revient,<br />
            et de ce qui change en toi.
          </p>
          <div className="space-y-1 pt-1">
            <p className="font-body text-base t-text-secondary">Retrouve ce qui t&apos;aide.</p>
            <p className="font-body text-base t-text-secondary">Vois ce qui revient.</p>
            <p className="font-body text-base t-text-secondary">Observe ce qui change.</p>
          </div>
        </div>

        {/* Plans */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setSelectedPlan("yearly")}
            className={`w-full p-5 rounded-2xl border text-center transition-all ${
              selectedPlan === "yearly"
                ? "border-[rgba(232,216,199,0.50)] bg-[rgba(214,165,106,0.08)]"
                : "border-[rgba(232,216,199,0.15)] bg-transparent"
            }`}
          >
            <p className="font-inter text-[10px] t-text-ghost uppercase tracking-wider mb-1">
              Le plus doux dans le temps
            </p>
            <p className="font-serif text-2xl text-t-beige">78€</p>
            <p className="font-inter text-xs t-text-secondary mt-1">par an · soit 6,50€/mois</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("monthly")}
            className={`w-full p-5 rounded-2xl border text-center transition-all ${
              selectedPlan === "monthly"
                ? "border-[rgba(232,216,199,0.50)] bg-[rgba(214,165,106,0.08)]"
                : "border-[rgba(232,216,199,0.15)] bg-transparent"
            }`}
          >
            <p className="font-inter text-xs t-text-secondary uppercase tracking-wider mb-1">
              Mensuel
            </p>
            <p className="font-serif text-2xl text-t-beige">9€</p>
            <p className="font-inter text-xs t-text-secondary mt-1">par mois</p>
          </button>
        </div>

        {/* Bloc d'attente sobre — abonnement non encore actif */}
        <div className="w-full rounded-2xl border border-t-beige/20 bg-black/20 p-4 text-center space-y-3">
          <p className="font-body text-sm t-text-secondary">
            L&apos;abonnement arrive bientôt.
          </p>
          <p className="font-inter text-xs t-text-ghost leading-relaxed">
            En attendant, l&apos;accès se fait uniquement avec un code bêta.
          </p>
          <button
            type="button"
            onClick={() => router.push("/app/beta")}
            className="font-inter text-sm t-text-secondary hover:t-text-beige transition-colors underline underline-offset-4"
          >
            J&apos;ai un code bêta
          </button>
        </div>

        {/* Sortie */}
        <SecondaryButton onClick={() => router.push("/app")}>
          Pas maintenant
        </SecondaryButton>

      </div>
    </ScreenContainer>
  );
}
