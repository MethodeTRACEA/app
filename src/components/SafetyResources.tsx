"use client";

export function SafetyResources() {
  return (
    <div className="safety-card animate-fade-up mt-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-terra animate-pulse-gentle flex-shrink-0" />
        <span className="font-medium text-sm text-terra-dark">
          Si tu te sens en détresse
        </span>
      </div>
      <p className="font-body text-sm text-espresso leading-relaxed mb-3">
        Si tu te sens en détresse, tu peux contacter :
      </p>
      <ul className="space-y-1.5 mb-3">
        <li className="font-body text-sm text-espresso">
          <span className="font-medium">3114</span> — Numéro national de prévention du suicide, 24h/24
        </li>
        <li className="font-body text-sm text-espresso">
          <span className="font-medium">SOS Amitié</span> — 09 72 39 40 50
        </li>
        <li className="font-body text-sm text-espresso">
          <span className="font-medium">Fil Santé Jeunes</span> — 0 800 235 236
        </li>
      </ul>
      <p className="text-xs text-warm-gray italic">
        Ces lignes sont gratuites, anonymes et confidentielles.
      </p>
    </div>
  );
}
