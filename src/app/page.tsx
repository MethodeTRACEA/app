import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-espresso text-beige">
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(196,112,74,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(138,158,122,0.15) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-10 animate-fade-in">
            <img
              src="/images/tracea-logo-terra-hd.png"
              alt="TRACÉA"
              className="h-14 md:h-20 mx-auto object-contain"
            />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream leading-[1.15] mb-8 animate-reveal animate-reveal-delay-1">
            Tu n&apos;es pas instable.
            <br />
            <span className="text-terra">Tu es en état d&apos;alerte permanent.</span>
          </h1>

          <p className="font-body text-xl md:text-2xl text-beige-dark leading-relaxed mb-4 animate-reveal animate-reveal-delay-2">
            Tu réagis trop vite, trop fort…
            <br />
            et tu t&apos;en veux après ?
          </p>

          <p className="font-body text-lg md:text-xl text-warm-gray leading-relaxed mb-12 animate-reveal animate-reveal-delay-3">
            Ce n&apos;est pas un problème de volonté.
            <br />
            C&apos;est ton système nerveux qui n&apos;arrive plus à redescendre.
          </p>

          <div className="animate-reveal animate-reveal-delay-4">
            <a
              href="#comprendre"
              className="inline-block font-sans text-sm tracking-widest uppercase text-terra hover:text-terra-light transition-colors duration-300"
            >
              Comprendre pourquoi
              <span className="block mt-2 mx-auto w-5 h-5">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 mx-auto animate-pulse-gentle">
                  <path d="M10 4v10m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── SECTION : CE QUE TU VIS ── */}
      <section id="comprendre" className="px-6 py-20 md:py-28">
        <div className="max-w-2xl mx-auto">
          <p className="text-[0.7rem] font-sans font-medium tracking-[0.3em] uppercase text-terra mb-4">
            Ce que tu vis
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-cream leading-tight mb-10">
            Ce n&apos;est pas &laquo;&thinsp;dans ta tête&thinsp;&raquo;
          </h2>

          <div className="space-y-5 mb-10">
            {[
              "Tu relis des conversations encore et encore",
              "Tu anticipes des scénarios catastrophe",
              "Tu sur-réagis… puis tu culpabilises",
              "Tu veux te calmer… mais ton corps ne suit pas",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-terra mt-2.5 flex-shrink-0" />
                <p className="font-body text-lg md:text-xl text-beige-dark leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="border-l-2 border-terra/40 pl-6 py-2">
            <p className="font-serif text-xl md:text-2xl text-cream leading-snug">
              Tu ne manques pas de volonté.
              <br />
              <span className="text-terra">Tu manques de régulation.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION : LE VRAI PROBLÈME ── */}
      <section className="px-6 py-20 md:py-28 bg-[#231710]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[0.7rem] font-sans font-medium tracking-[0.3em] uppercase text-terra mb-4">
            Le vrai problème
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-cream leading-tight mb-10">
            Ton système nerveux est bloqué en mode alerte
          </h2>

          <div className="space-y-5 mb-10">
            {[
              "Tu réagis avant de réfléchir",
              "Ton corps reste sous tension",
              "Tu n'arrives pas à redescendre",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-dusty mt-2.5 flex-shrink-0" />
                <p className="font-body text-lg md:text-xl text-beige-dark leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="border-l-2 border-dusty/40 pl-6 py-2">
            <p className="font-serif text-xl md:text-2xl text-cream leading-snug">
              On t&apos;a appris à gérer tes émotions
              <br />
              <span className="text-dusty">mais pas à réguler ton corps.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION : TRACÉA ── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-2xl mx-auto">
          <p className="text-[0.7rem] font-sans font-medium tracking-[0.3em] uppercase text-terra mb-4">
            La solution
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-cream leading-tight mb-6">
            TRACÉA : entraîner ton système nerveux
          </h2>

          <p className="font-body text-lg md:text-xl text-warm-gray leading-relaxed mb-3">
            TRACÉA n&apos;est pas une thérapie.
          </p>
          <p className="font-body text-lg md:text-xl text-warm-gray leading-relaxed mb-10">
            C&apos;est un entraînement structuré pour :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {[
              { text: "Ralentir tes réactions", icon: "01" },
              { text: "Revenir dans ton corps", icon: "02" },
              { text: "Récupérer plus vite", icon: "03" },
              { text: "Agir depuis un état stable", icon: "04" },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-card border border-terra/15 bg-terra/5 p-5"
              >
                <span className="text-[0.65rem] font-sans font-medium tracking-widest text-terra/60 uppercase">
                  {item.icon}
                </span>
                <p className="font-serif text-lg text-cream mt-2">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="text-center border-t border-b border-terra/15 py-8">
            <p className="font-serif text-xl md:text-2xl text-cream leading-snug">
              Tu ne changes pas qui tu es.
              <br />
              <span className="text-terra">
                Tu changes l&apos;état depuis lequel tu réagis.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION : 6 ÉTAPES ── */}
      <section className="px-6 py-20 md:py-28 bg-[#231710]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[0.7rem] font-sans font-medium tracking-[0.3em] uppercase text-terra mb-4 text-center">
            Le protocole
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-cream leading-tight mb-12 text-center">
            Une méthode en 6 étapes
          </h2>

          <div className="space-y-4">
            {[
              { letter: "T", name: "Traverser", color: "bg-terra" },
              { letter: "R", name: "Reconnaître", color: "bg-terra/80" },
              { letter: "A", name: "Ancrer", color: "bg-sage" },
              { letter: "C", name: "Conscientiser", color: "bg-espresso border border-terra/20" },
              { letter: "É", name: "Émerger", color: "bg-dusty" },
              { letter: "A", name: "Aligner", color: "bg-terra-dark" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-5">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl text-cream flex-shrink-0 ${step.color}`}
                >
                  {step.letter}
                </div>
                <span className="font-serif text-xl md:text-2xl text-cream">
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION : CTA ── */}
      <section id="offre" className="px-6 py-24 md:py-32">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[0.7rem] font-sans font-medium tracking-[0.3em] uppercase text-terra mb-4">
            Commencer
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-cream leading-tight mb-10">
            Commencer sans pression
          </h2>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {[
              "1 traversée gratuite",
              "Accès immédiat",
              "10 minutes",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-sage" />
                <span className="font-sans text-sm text-beige-dark tracking-wide">
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            href="/app"
            className="inline-block w-full sm:w-auto bg-terra hover:bg-terra-dark text-cream font-sans font-medium text-lg tracking-wide px-12 py-5 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(196,112,74,0.3)] active:scale-[0.98]"
          >
            Faire ma première traversée
          </Link>

          <p className="font-body text-sm text-warm-gray mt-6">
            Aucun paiement requis. Aucune inscription obligatoire.
          </p>
        </div>
      </section>

      {/* ── SECTION : DISCLAIMER ── */}
      <section className="px-6 py-16 border-t border-terra/10">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[0.7rem] font-sans font-medium tracking-[0.3em] uppercase text-warm-gray/60 mb-6">
            Avant de commencer
          </p>
          <div className="space-y-3">
            {[
              "Ce n'est pas une thérapie",
              "Ce n'est pas magique",
              "Mais c'est accessible, structuré, et ça commence maintenant",
            ].map((item, i) => (
              <p key={i} className="font-body text-base md:text-lg text-warm-gray leading-relaxed">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-10 border-t border-terra/10">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
          <img
            src="/images/tracea-logo-terra-hd.png"
            alt="TRACÉA"
            className="h-8 object-contain opacity-60"
          />
          <div className="flex flex-wrap justify-center gap-4 text-xs text-warm-gray/60">
            <Link href="/mentions-legales" className="hover:text-terra transition-colors">
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-terra transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/conditions-utilisation" className="hover:text-terra transition-colors">
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
