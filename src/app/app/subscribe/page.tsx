"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type Plan = "monthly" | "yearly";

type TrialStatus =
  | "idle"
  | "loading"
  | "success"
  | "trial_already_used"
  | "error";

export default function SubscribePage() {
  const router = useRouter();
  const { session, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");
  const [trialStatus, setTrialStatus] = useState<TrialStatus>("idle");

  async function activateTrial() {
    if (!session?.access_token) {
      router.push("/app/connexion");
      return;
    }

    setTrialStatus("loading");

    try {
      const res = await fetch("/api/trial/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ source: "subscribe" }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        setTrialStatus("idle");
        router.push("/app/connexion");
        return;
      }

      if (data?.success === true) {
        await refreshProfile();
        setTrialStatus("success");
        setTimeout(() => {
          router.push("/app");
        }, 1400);
        return;
      }

      if (data?.code === "trial_already_used") {
        setTrialStatus("trial_already_used");
        return;
      }

      setTrialStatus("error");
    } catch {
      setTrialStatus("error");
    }
  }

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

        {/* Bloc Trial — 7 jours gratuits, sans carte */}
        <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.30)] bg-[rgba(214,165,106,0.06)] p-5 text-center space-y-4">
          <div className="space-y-1">
            <p className="font-serif text-xl text-t-beige">
              7 jours pour découvrir Premium.
            </p>
            <p className="font-body text-sm t-text-secondary">
              Sans carte bancaire. L&apos;essai s&apos;arrête tout seul.
            </p>
          </div>

          <button
            type="button"
            onClick={activateTrial}
            disabled={trialStatus === "loading" || trialStatus === "success"}
            className="w-full text-center rounded-full font-inter text-sm font-medium px-5 py-3 cursor-pointer transition-all duration-200 bg-t-brume/30 text-t-beige border border-[rgba(232,216,199,0.45)] hover:bg-t-brume/55 hover:border-[rgba(232,216,199,0.70)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {trialStatus === "loading"
              ? "Activation…"
              : "Activer mes 7 jours gratuits"}
          </button>

          {trialStatus === "success" && (
            <p className="font-body text-sm text-t-beige">
              C&apos;est en place. Tu peux commencer.
            </p>
          )}

          {trialStatus === "trial_already_used" && (
            <p className="font-body text-sm t-text-secondary">
              Tu as déjà utilisé ton essai gratuit.
            </p>
          )}

          {trialStatus === "error" && (
            <p className="font-inter text-xs text-red-400/70">
              Une erreur est survenue. Réessaie.
            </p>
          )}

          <p className="font-inter text-[11px] t-text-ghost leading-relaxed">
            En activant l&apos;essai, tu acceptes les{" "}
            <a
              href="/conditions-utilisation"
              className="underline underline-offset-2 hover:t-text-secondary"
            >
              conditions d&apos;utilisation
            </a>
            .
          </p>
        </div>

        {/* Bloc bêta — secondaire */}
        <div className="w-full rounded-2xl border border-t-beige/20 bg-black/20 p-4 text-center space-y-3">
          <p className="font-body text-sm t-text-secondary">
            L&apos;abonnement payant arrive bientôt.
          </p>
          <p className="font-inter text-xs t-text-ghost leading-relaxed">
            Si tu as un code bêta, tu peux l&apos;utiliser ici.
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
