"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type Plan = "monthly" | "yearly";
type Status = "idle" | "loading" | "success" | "error";

export default function SubscribePage() {
  const router = useRouter();
  const { session, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubscribe() {
    if (!session?.access_token) {
      router.push("/app/connexion");
      return;
    }

    setStatus("loading");

    try {
      // TODO: replace with Stripe Checkout session creation
      // For now: mock — directly sets is_subscribed = true server-side
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        return;
      }

      // Refresh auth context so isSubscribed updates immediately
      await refreshProfile();
      setStatus("success");

      // Redirect to app after short confirmation delay
      setTimeout(() => router.push("/app"), 1800);

    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 py-12">
          <div className="text-center space-y-4">
            <p className="font-serif text-2xl text-t-beige">
              C&apos;est en place.
            </p>
            <p className="font-body text-base t-text-secondary">
              Tu repars avec TRACÉA.
            </p>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer overlayOpacity={45}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 py-12">

        {/* Accroche */}
        <div className="text-center space-y-4">
          <p className="font-serif text-2xl text-t-beige leading-relaxed">
            Tu ne repars plus de zéro.
          </p>
          <div className="space-y-1 pt-1">
            <p className="font-body text-base t-text-secondary">Tu retrouves ce qui t&apos;aide.</p>
            <p className="font-body text-base t-text-secondary">Tu vois ce qui revient.</p>
            <p className="font-body text-base t-text-secondary">L&apos;IA t&apos;accompagne à chaque traversée.</p>
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
            <p className="font-inter text-xs t-text-secondary uppercase tracking-wider mb-1">
              Annuel · le plus simple
            </p>
            <p className="font-serif text-2xl text-t-beige">79€</p>
            <p className="font-inter text-xs t-text-secondary mt-1">par an · soit 6,60€/mois</p>
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

        {/* CTA */}
        <div className="w-full flex flex-col gap-4">
          <PrimaryButton
            onClick={handleSubscribe}
            disabled={status === "loading"}
          >
            {status === "loading" ? "En cours…" : "Continuer avec TRACÉA"}
          </PrimaryButton>

          {status === "error" && (
            <p className="font-inter text-xs text-red-400/70 text-center">
              Une erreur est survenue. Réessaie.
            </p>
          )}

          <SecondaryButton onClick={() => router.push("/app")}>
            Pas maintenant
          </SecondaryButton>
        </div>

        {/* Note mock */}
        <p className="font-inter text-xs t-text-ghost text-center">
          Paiement sécurisé · Résiliable à tout moment
        </p>

      </div>
    </ScreenContainer>
  );
}
