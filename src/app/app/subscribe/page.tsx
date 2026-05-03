"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

type Plan = "monthly" | "yearly";

type TrialStatus =
  | "idle"
  | "loading"
  | "success"
  | "already_premium"
  | "already_active"
  | "trial_already_used"
  | "error";

type AlreadyPremiumReason = "beta" | "subscribed" | "other";

type CheckoutStatus = "idle" | "loading" | "success" | "cancel" | "error";

// ── Helpers locaux pour l'affichage des dates et formules ─────────
// `formatLongDate` (sans année) est conservé pour les dates du trial
// (la date de fin d'essai est toujours dans l'année en cours, donc
// l'année est inutile).
function formatLongDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

// `formatLongDateWithYear` est utilisé pour les dates d'abonnement
// Stripe (renouvellement, fin programmée, fin effective). Ces dates
// peuvent être à plusieurs années dans le futur, donc l'année est
// affichée explicitement.
function formatLongDateWithYear(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPlanLabel(
  plan: "monthly" | "yearly" | null
): string | null {
  if (plan === "monthly") return "Formule mensuelle.";
  if (plan === "yearly") return "Formule annuelle.";
  return null;
}

function SubscribePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    session,
    refreshProfile,
    isSubscribed,
    isBetaTester,
    isTrialActive,
    trialUsed,
    trialEndsAt,
    stripeSubscriptionStatus,
    subscriptionPlan,
    subscriptionCurrentPeriodEnd,
    subscriptionCancelAtPeriodEnd,
    unsubscribedAt,
  } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");
  const [trialStatus, setTrialStatus] = useState<TrialStatus>("idle");
  const [alreadyPremiumReason, setAlreadyPremiumReason] =
    useState<AlreadyPremiumReason>("other");
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Drapeau UI Stripe — lu uniquement côté client. Tant qu'il vaut
  // false, aucun bouton de paiement n'est actif et aucun appel
  // /api/subscribe n'est émis depuis cette page.
  const stripeUiEnabled =
    process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";

  const formattedTrialEndDate = formatLongDate(trialEndsAt);
  const formattedSubscriptionPeriodEnd = formatLongDateWithYear(
    subscriptionCurrentPeriodEnd
  );
  const formattedUnsubscribedAt = formatLongDateWithYear(unsubscribedAt);
  const subscriptionPlanLabel = formatPlanLabel(subscriptionPlan);
  const subscriptionEnded =
    !isSubscribed &&
    (stripeSubscriptionStatus === "canceled" || !!unsubscribedAt);

  // Gestion des retours Stripe Checkout — uniquement quand l'UI Stripe
  // est activée. En mode dormant, l'URL ne peut pas contenir ces query
  // params (puisque aucun checkout n'est lancé), donc le useEffect est
  // un no-op pour les testeurs.
  useEffect(() => {
    if (!stripeUiEnabled) return;
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      setCheckoutStatus("success");
      refreshProfile();
      const timeout = window.setTimeout(() => {
        refreshProfile();
      }, 1500);
      return () => window.clearTimeout(timeout);
    }
    if (checkout === "cancel") {
      setCheckoutStatus("cancel");
    }
  }, [stripeUiEnabled, searchParams, refreshProfile]);

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

      if (data?.alreadyPremium === true) {
        await refreshProfile();
        setAlreadyPremiumReason(
          data.reason === "beta"
            ? "beta"
            : data.reason === "subscribed"
            ? "subscribed"
            : "other"
        );
        setTrialStatus("already_premium");
        setTimeout(() => {
          router.push("/app");
        }, 1400);
        return;
      }

      if (data?.alreadyActive === true) {
        await refreshProfile();
        setTrialStatus("already_active");
        setTimeout(() => {
          router.push("/app");
        }, 1400);
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

  async function startCheckout(plan: Plan) {
    if (!stripeUiEnabled) return;

    if (!session?.access_token) {
      router.push("/app/connexion");
      return;
    }

    setSelectedPlan(plan);
    setCheckoutStatus("loading");
    setCheckoutError(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        router.push("/app/connexion");
        return;
      }

      if (
        res.status === 409 &&
        (data?.code === "already_subscribed" || data?.code === "already_beta")
      ) {
        await refreshProfile();
        setCheckoutStatus("idle");
        return;
      }

      if (res.ok && typeof data?.url === "string") {
        window.location.href = data.url;
        return;
      }

      if (data?.code === "stripe_disabled") {
        setCheckoutError("Le paiement n'est pas encore activé.");
      } else {
        setCheckoutError("Une erreur est survenue. Réessaie.");
      }
      setCheckoutStatus("error");
    } catch {
      setCheckoutError("Erreur réseau. Vérifie ta connexion et réessaie.");
      setCheckoutStatus("error");
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

        {/* Bandeaux retours Stripe Checkout — uniquement si UI Stripe activée */}
        {stripeUiEnabled && checkoutStatus === "success" && (
          <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.30)] bg-[rgba(214,165,106,0.06)] p-5 text-center space-y-2">
            <p className="font-serif text-xl text-t-beige">
              Bienvenue dans Premium.
            </p>
            <p className="font-body text-sm t-text-secondary">
              Ton accès peut prendre quelques secondes à s&apos;actualiser.
            </p>
          </div>
        )}
        {stripeUiEnabled && checkoutStatus === "cancel" && (
          <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.30)] bg-[rgba(214,165,106,0.06)] p-5 text-center space-y-2">
            <p className="font-serif text-xl text-t-beige">
              Souscription annulée.
            </p>
            <p className="font-body text-sm t-text-secondary">
              Tu peux reprendre quand tu veux.
            </p>
          </div>
        )}
        {stripeUiEnabled && checkoutStatus === "error" && (
          <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.30)] bg-[rgba(214,165,106,0.06)] p-5 text-center space-y-2">
            <p className="font-body text-sm t-text-secondary">
              {checkoutError || "Une erreur est survenue. Réessaie."}
            </p>
          </div>
        )}

        {/* Plans — décoratifs en mode dormant, cliquables pour checkout
            quand stripeUiEnabled et que l'utilisateur n'est pas déjà
            abonné ou bêta */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              if (stripeUiEnabled && !isSubscribed && !isBetaTester) {
                startCheckout("yearly");
              } else {
                setSelectedPlan("yearly");
              }
            }}
            disabled={stripeUiEnabled && checkoutStatus === "loading"}
            className={`w-full p-5 rounded-2xl border text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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
            {stripeUiEnabled && !isSubscribed && !isBetaTester && (
              <p className="font-inter text-xs t-text-secondary mt-2 underline underline-offset-2">
                {checkoutStatus === "loading" && selectedPlan === "yearly"
                  ? "Préparation…"
                  : "Choisir l'abonnement annuel"}
              </p>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (stripeUiEnabled && !isSubscribed && !isBetaTester) {
                startCheckout("monthly");
              } else {
                setSelectedPlan("monthly");
              }
            }}
            disabled={stripeUiEnabled && checkoutStatus === "loading"}
            className={`w-full p-5 rounded-2xl border text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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
            {stripeUiEnabled && !isSubscribed && !isBetaTester && (
              <p className="font-inter text-xs t-text-secondary mt-2 underline underline-offset-2">
                {checkoutStatus === "loading" && selectedPlan === "monthly"
                  ? "Préparation…"
                  : "Choisir l'abonnement mensuel"}
              </p>
            )}
          </button>
        </div>

        {/* Bloc Trial */}
        {stripeUiEnabled && stripeSubscriptionStatus === "past_due" ? (
          // Past_due (top-level, indépendant de isSubscribed) — orientation
          // vers /app/profil pour mettre à jour le moyen de paiement
          <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.30)] bg-[rgba(214,165,106,0.06)] p-5 text-center space-y-3">
            <p className="font-serif text-xl text-t-beige">
              Un paiement n&apos;a pas pu être pris.
            </p>
            <p className="font-body text-sm t-text-secondary">
              Tu peux mettre à jour ton moyen de paiement depuis ton profil.
            </p>
            <button
              type="button"
              onClick={() => router.push("/app/profil")}
              className="font-inter text-sm t-text-secondary hover:t-text-beige transition-colors underline underline-offset-4"
            >
              Aller à mon profil
            </button>
          </div>
        ) : isSubscribed ? (
          // Abonné — état informatif sobre + lien profil quand UI Stripe activée
          <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.30)] bg-[rgba(214,165,106,0.06)] p-5 text-center space-y-2">
            <p className="font-serif text-xl text-t-beige">
              Ton abonnement Premium est actif.
            </p>
            {subscriptionPlanLabel && (
              <p className="font-body text-sm t-text-secondary">
                {subscriptionPlanLabel}
              </p>
            )}
            {formattedSubscriptionPeriodEnd && (
              <p className="font-body text-sm t-text-secondary">
                {subscriptionCancelAtPeriodEnd === true
                  ? `Ton abonnement prend fin le ${formattedSubscriptionPeriodEnd}.`
                  : `Renouvellement le ${formattedSubscriptionPeriodEnd}.`}
              </p>
            )}
            {!subscriptionPlanLabel && !formattedSubscriptionPeriodEnd && (
              <p className="font-body text-sm t-text-secondary">
                Tu as accès aux fonctionnalités Premium.
              </p>
            )}
            {stripeUiEnabled && (
              <button
                type="button"
                onClick={() => router.push("/app/profil")}
                className="font-inter text-sm t-text-secondary hover:t-text-beige transition-colors underline underline-offset-4"
              >
                Voir mon profil
              </button>
            )}
          </div>
        ) : isBetaTester ? (
          // Bêta testeur — état informatif sobre, pas de CTA d'activation trial
          <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.30)] bg-[rgba(214,165,106,0.06)] p-5 text-center space-y-2">
            <p className="font-serif text-xl text-t-beige">
              Ton accès bêta est actif.
            </p>
            <p className="font-body text-sm t-text-secondary">
              Tu as accès aux fonctionnalités Premium.
            </p>
          </div>
        ) : isTrialActive ? (
          // Trial déjà actif — état d'information sobre, pas de CTA
          <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.30)] bg-[rgba(214,165,106,0.06)] p-5 text-center space-y-2">
            <p className="font-serif text-xl text-t-beige">
              Ton essai est en cours.
            </p>
            {formattedTrialEndDate && (
              <p className="font-body text-sm t-text-secondary">
                Jusqu&apos;au {formattedTrialEndDate}.
              </p>
            )}
            <p className="font-body text-sm t-text-secondary">
              Ton accès Premium est actif pendant ce temps.
            </p>
          </div>
        ) : stripeUiEnabled && subscriptionEnded ? (
          // Abonnement Premium terminé (Stripe canceled ou unsubscribed_at posé)
          <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.30)] bg-[rgba(214,165,106,0.06)] p-5 text-center space-y-2">
            <p className="font-serif text-xl text-t-beige">
              {formattedUnsubscribedAt
                ? `Ton abonnement Premium a pris fin le ${formattedUnsubscribedAt}.`
                : "Ton abonnement Premium a pris fin."}
            </p>
            <p className="font-body text-sm t-text-secondary">
              Tu peux reprendre Premium avec la formule de ton choix.
            </p>
          </div>
        ) : trialUsed ? (
          // Trial déjà consommé (expiré ou clôturé) — wording conditionné par stripeUiEnabled
          <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.30)] bg-[rgba(214,165,106,0.06)] p-5 text-center space-y-2">
            <p className="font-serif text-xl text-t-beige">
              {stripeUiEnabled
                ? "Ton essai gratuit est terminé."
                : "Tu as déjà fait ton essai gratuit."}
            </p>
            <p className="font-body text-sm t-text-secondary">
              {stripeUiEnabled
                ? "Pour continuer avec Premium, choisis la formule qui te convient."
                : "L'abonnement payant arrive bientôt."}
            </p>
          </div>
        ) : (
          // Pas de trial actif — CTA d'activation
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
              disabled={
                trialStatus === "loading" ||
                trialStatus === "success" ||
                trialStatus === "already_premium" ||
                trialStatus === "already_active"
              }
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

            {trialStatus === "already_premium" && (
              <p className="font-body text-sm text-t-beige">
                {alreadyPremiumReason === "beta"
                  ? "Ton accès bêta est déjà actif."
                  : alreadyPremiumReason === "subscribed"
                  ? "Ton abonnement Premium est déjà actif."
                  : "Ton accès Premium est déjà actif."}
              </p>
            )}

            {trialStatus === "already_active" && (
              <p className="font-body text-sm text-t-beige">
                Ton essai est déjà en cours.
              </p>
            )}

            {trialStatus === "trial_already_used" && (
              <div className="space-y-1">
                <p className="font-body text-sm t-text-secondary">
                  {stripeUiEnabled
                    ? "Ton essai gratuit est terminé."
                    : "Tu as déjà fait ton essai gratuit."}
                </p>
                <p className="font-body text-sm t-text-secondary">
                  {stripeUiEnabled
                    ? "Pour continuer avec Premium, choisis la formule qui te convient."
                    : "L'abonnement payant arrive bientôt."}
                </p>
              </div>
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
        )}

        {/* Bloc bêta — secondaire (le message "arrive bientôt" est masqué en mode Stripe actif) */}
        <div className="w-full rounded-2xl border border-t-beige/20 bg-black/20 p-4 text-center space-y-3">
          {!stripeUiEnabled && (
            <p className="font-body text-sm t-text-secondary">
              L&apos;abonnement payant arrive bientôt.
            </p>
          )}
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

export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribePageInner />
    </Suspense>
  );
}
