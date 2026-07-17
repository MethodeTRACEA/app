"use client";

export function SafetyResources() {
  return (
    <div className="safety-card animate-fade-up mt-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-terra animate-pulse-gentle flex-shrink-0" />
        {/* WCAG AA (chantier 60, Lighthouse) : 20px + gras 700 = "texte
            large" → seuil 3:1, que le ratio actuel (4,38) dépasse. La
            couleur terra-dark reste intacte (décision Alyson 13/07).
            700 minimum : l'audit axe-core ne compte pas 600 comme gras. */}
        <span className="font-bold text-xl text-terra-dark">
          Si tu te sens en détresse
        </span>
      </div>
      <ul className="space-y-1.5 mb-3">
        <li className="font-body text-sm text-espresso">
          <a href="tel:3114" className="font-medium underline">3114</a> — Numéro national de prévention du suicide, 24h/24
        </li>
        <li className="font-body text-sm text-espresso">
          <span className="font-medium">SOS Amitié</span> — <a href="tel:0972394050" className="underline">09 72 39 40 50</a>
        </li>
        <li className="font-body text-sm text-espresso">
          <span className="font-medium">Fil Santé Jeunes</span> — <a href="tel:0800235236" className="underline">0 800 235 236</a>
        </li>
      </ul>
      <p className="text-xs text-warm-gray italic">
        Ces lignes sont gratuites, anonymes et confidentielles.
      </p>
    </div>
  );
}
