import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commencer | TRACEA",
  description:
    "Commence ta traversee emotionnelle guidee. 10 minutes, gratuit, sans engagement.",
};

export default function StartPage() {
  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="font-serif text-2xl text-terra mb-12 tracking-wide">
          TRACEA
        </div>

        {/* Titre */}
        <h1 className="font-serif text-3xl md:text-4xl text-cream leading-tight mb-6">
          &Ccedil;a peut redescendre. Maintenant.
        </h1>

        {/* Texte principal */}
        <p className="font-body text-base md:text-lg text-cream/70 leading-relaxed mb-8">
          Ton corps sait d&eacute;j&agrave;.
        </p>

        {/* Sous-texte */}
        <p className="font-body text-sm text-cream/50 leading-relaxed mb-1">
          Tu vas juste te laisser guider.
        </p>
        <p className="font-body text-sm text-cream/50 leading-relaxed mb-10">
          Pendant quelques minutes.
        </p>

        {/* Rassurance */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-10">
          {[
            "10 minutes",
            "Gratuit",
            "Sans engagement",
            "Arr\u00eate quand tu veux",
          ].map((item) => (
            <span
              key={item}
              className="text-xs text-cream/40 font-medium tracking-wide"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Accroche pré-CTA */}
        <p className="font-serif text-lg text-cream/60 mb-6">
          On commence ?
        </p>

        {/* CTA principal */}
        <Link
          href="/app"
          className="inline-block w-full sm:w-auto bg-terra text-cream font-medium text-base px-10 py-4 rounded-2xl hover:bg-terra/90 transition-all"
        >
          Commencer maintenant
        </Link>

        {/* Micro texte */}
        <p className="font-body text-xs text-cream/30 mt-6 leading-relaxed">
          Acc&egrave;s imm&eacute;diat. Sans engagement.
        </p>
      </div>
    </div>
  );
}
