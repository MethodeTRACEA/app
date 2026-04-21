"use client";

import Link from "next/link";

interface PaywallProps {
  onContinue: () => void;
}

export function Paywall({ onContinue }: PaywallProps) {
  return (
    <div className="flex flex-col items-center gap-10 text-center max-w-sm mx-auto px-4 py-12">
      <p className="font-body text-xl text-espresso leading-relaxed">
        Tu peux revenir ici quand ça monte.<br />
        Et t&apos;entraîner pour que ça redescende plus vite.
      </p>
      <div className="w-full space-y-3">
        <Link
          href="/app/subscribe"
          className="btn-primary !block !w-full !py-4 !text-sm !rounded-2xl text-center"
        >
          Accès complet
        </Link>
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-2xl border border-warm-gray/30 text-warm-gray font-medium text-sm hover:bg-beige transition-all"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
