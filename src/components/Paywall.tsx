"use client";

import Link from "next/link";

interface PaywallProps {
  onContinue: () => void;
}

export function Paywall({ onContinue }: PaywallProps) {
  return (
    <div className="flex flex-col items-center gap-10 text-center max-w-sm mx-auto px-4 py-12">
      <div className="space-y-4">
        <p className="font-body text-xl text-espresso leading-relaxed">
          Tu peux revenir ici quand ça monte.<br /><br />
          Et t&apos;entraîner pour que ça redescende plus vite.
        </p>
        <p className="font-body text-sm text-warm-gray leading-relaxed">
          Avec l&apos;accès complet, tu peux :<br />
          t&apos;entraîner régulièrement,<br />
          revenir autant de fois que nécessaire,<br />
          et sentir la différence dans le temps.
        </p>
      </div>
      <div className="w-full space-y-3">
        <Link
          href="/app/subscribe"
          className="btn-primary !block !w-full !py-4 !text-sm !rounded-2xl text-center"
        >
          Accéder à l&apos;expérience complète
        </Link>
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-2xl border border-warm-gray/30 text-warm-gray font-medium text-sm hover:bg-beige transition-all"
        >
          Continuer en accès limité
        </button>
      </div>
    </div>
  );
}
