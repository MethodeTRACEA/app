import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-espresso text-beige">
      {/* ── HERO ── */}
      <section className="relative min-h-[95vh] flex items-center justify-center px-6 py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(196,112,74,0.25) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-xl mx-auto text-center">
          <div className="mb-12">
            <img
              src="/images/tracea-logo-terra-hd.png"
              alt="TRACEA"
              className="h-12 md:h-16 mx-auto object-contain"
            />
          </div>

          <h1 className="font-serif text-3xl md:text-5xl text-cream leading-[1.2] mb-6">
            Tu n&apos;es pas instable.
          </h1>
          <p className="font-serif text-2xl md:text-4xl text-terra leading-[1.2] mb-10">
            Tu es en &eacute;tat d&apos;alerte permanent.
          </p>

          <p className="font-body text-xl md:text-2xl text-cream/80 leading-relaxed mb-3">
            Et &ccedil;a peut redescendre.
          </p>
          <p className="font-body text-xl md:text-2xl text-terra leading-relaxed mb-14">
            En quelques minutes.
          </p>

          <Link
            href="/start"
            className="inline-block w-full sm:w-auto bg-terra hover:bg-terra-dark text-cream font-medium text-lg px-12 py-5 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(196,112,74,0.3)] active:scale-[0.98]"
          >
            Commencer maintenant (gratuit)
          </Link>

          <p className="font-body text-sm text-warm-gray/40 mt-6">
            10 minutes. Sans forcer. Tu peux arr&ecirc;ter &agrave; tout moment.
          </p>
        </div>
      </section>

      {/* ── IDENTIFICATION ── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-xl mx-auto">
          <div className="space-y-6 mb-12">
            <p className="font-body text-lg md:text-xl text-beige-dark leading-relaxed">
              Tu envoies un message&hellip;
              <br />
              et tu le regrettes avant m&ecirc;me qu&apos;il soit lu.
            </p>
            <p className="font-body text-lg md:text-xl text-beige-dark leading-relaxed">
              Tu rejoues la sc&egrave;ne.
              <br />
              Tu anticipes.
              <br />
              Tu t&apos;&eacute;puises.
            </p>
            <p className="font-body text-lg md:text-xl text-cream leading-relaxed">
              Tu voudrais juste que &ccedil;a s&apos;arr&ecirc;te.
            </p>
            <p className="font-body text-lg md:text-xl text-warm-gray/50 leading-relaxed">
              Mais ton corps ne te laisse pas.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/start"
              className="inline-block w-full sm:w-auto bg-terra hover:bg-terra-dark text-cream font-medium text-base px-10 py-4 rounded-full transition-all duration-300 active:scale-[0.98]"
            >
              Essayer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ── RECADRAGE ── */}
      <section className="px-6 py-20 md:py-28 bg-[#231710]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-4xl text-cream leading-tight mb-8">
            Ce n&apos;est pas dans ta t&ecirc;te.
          </h2>
          <p className="font-serif text-2xl md:text-3xl text-terra leading-snug mb-10">
            C&apos;est ton syst&egrave;me nerveux.
          </p>
          <p className="font-body text-lg text-beige-dark/70 leading-relaxed mb-3">
            Quand il est en alerte,
            <br />
            tout s&apos;emballe.
          </p>
          <p className="font-body text-lg text-warm-gray/50 leading-relaxed">
            Et tu ne peux pas juste &laquo;&thinsp;te calmer&thinsp;&raquo;.
          </p>
        </div>
      </section>

      {/* ── PROBLÈME ── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl text-cream leading-tight mb-10 text-center">
            Ton corps est bloqu&eacute; en mode alerte.
          </h2>

          <div className="space-y-5 mb-12">
            {[
              "Tu r\u00e9agis trop vite",
              "Tu sur-analyses",
              "Tu restes tendu, m\u00eame au repos",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-terra flex-shrink-0" />
                <p className="font-body text-lg md:text-xl text-beige-dark leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-3">
            <p className="font-body text-lg text-warm-gray leading-relaxed">
              On t&apos;a appris &agrave; g&eacute;rer tes &eacute;motions.
            </p>
            <p className="font-serif text-xl md:text-2xl text-terra leading-snug">
              Personne ne t&apos;a appris &agrave; r&eacute;guler ton corps.
            </p>
          </div>
        </div>
      </section>

      {/* ── BASCULE ── */}
      <section className="px-6 py-16 md:py-24 bg-[#231710]">
        <div className="max-w-xl mx-auto text-center">
          <p className="font-serif text-2xl md:text-3xl text-cream leading-snug mb-4">
            Le probl&egrave;me, ce n&apos;est pas ce que tu ressens.
          </p>
          <p className="font-serif text-2xl md:text-3xl text-terra leading-snug">
            C&apos;est ce qui ne redescend pas en toi.
          </p>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-xl mx-auto">
          <h2 className="font-serif text-2xl md:text-4xl text-cream leading-tight mb-10 text-center">
            TRAC&Eacute;A est un entra&icirc;nement guid&eacute;.
          </h2>

          <div className="space-y-5 mb-10 text-center">
            <p className="font-body text-lg text-beige-dark leading-relaxed">
              Tu arrives dans ton &eacute;tat actuel.
              <br />
              Tu suis les &eacute;tapes.
              <br />
              Ton corps redescend.
            </p>
          </div>

          <div className="text-center space-y-2 mb-14">
            <p className="font-body text-lg text-warm-gray/50">Pas de th&eacute;orie.</p>
            <p className="font-body text-lg text-warm-gray/50">Pas d&apos;analyse.</p>
            <p className="font-body text-xl text-cream">Du concret.</p>
          </div>

          <div className="text-center">
            <Link
              href="/start"
              className="inline-block w-full sm:w-auto bg-terra hover:bg-terra-dark text-cream font-medium text-lg px-12 py-5 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(196,112,74,0.3)] active:scale-[0.98]"
            >
              Je veux essayer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ── BÉNÉFICES ── */}
      <section className="px-6 py-20 md:py-28 bg-[#231710]">
        <div className="max-w-xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl text-cream leading-tight mb-10 text-center">
            En quelques minutes, tu peux :
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Ralentir la r\u00e9action",
              "Rel\u00e2cher la pression",
              "Retrouver de la clart\u00e9",
              "Agir sans exploser",
            ].map((text, i) => (
              <div
                key={i}
                className="rounded-2xl border border-terra/15 bg-terra/5 px-5 py-5 text-center"
              >
                <p className="font-serif text-lg text-cream">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÉTHODE ── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-xl mx-auto">
          <h2 className="font-serif text-2xl md:text-4xl text-cream leading-tight mb-4 text-center">
            6 &eacute;tapes. 10 minutes.
          </h2>
          <p className="font-serif text-xl md:text-2xl text-terra text-center mb-14">
            Un chemin clair.
          </p>

          <div className="space-y-4">
            {[
              { letter: "T", name: "Traverser", color: "bg-terra" },
              { letter: "R", name: "Reconna\u00eetre", color: "bg-terra/80" },
              { letter: "A", name: "Ancrer", color: "bg-sage" },
              { letter: "C", name: "Conscientiser", color: "bg-warm-gray" },
              { letter: "\u00c9", name: "\u00c9merger", color: "bg-dusty" },
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

      {/* ── EXPÉRIENCE ── */}
      <section className="px-6 py-20 md:py-28 bg-[#231710]">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <p className="font-body text-xl md:text-2xl text-warm-gray/50">Tu respires.</p>
          <p className="font-body text-xl md:text-2xl text-beige-dark/70">Ton corps ralentit.</p>
          <p className="font-body text-xl md:text-2xl text-cream">Tu reprends le contr&ocirc;le.</p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="px-6 py-24 md:py-36">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-4xl text-cream leading-tight mb-4">
            Tu n&apos;as rien &agrave; comprendre de plus.
          </h2>
          <p className="font-serif text-xl md:text-3xl text-terra leading-snug mb-14">
            Ton corps sait d&eacute;j&agrave; quoi faire.
          </p>

          <Link
            href="/start"
            className="inline-block w-full sm:w-auto bg-terra hover:bg-terra-dark text-cream font-medium text-lg px-14 py-5 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(196,112,74,0.3)] active:scale-[0.98]"
          >
            Commencer maintenant
          </Link>

          <p className="font-body text-sm text-warm-gray/40 mt-6">
            10 minutes. Gratuit. Sans engagement.
          </p>
        </div>
      </section>

      {/* ── RASSURANCE ── */}
      <section className="px-6 py-16 md:py-20 bg-[#231710]">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <p className="font-body text-base md:text-lg text-warm-gray leading-relaxed">
            Ce n&apos;est pas une th&eacute;rapie.
          </p>
          <p className="font-body text-base md:text-lg text-warm-gray leading-relaxed">
            Ce n&apos;est pas magique.
          </p>
          <p className="font-body text-base md:text-lg text-beige-dark leading-relaxed">
            Mais c&apos;est structur&eacute;.
            <br />
            Et &ccedil;a fonctionne.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-10 border-t border-terra/10">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
          <img
            src="/images/tracea-logo-terra-hd.png"
            alt="TRACEA"
            className="h-8 object-contain opacity-60"
          />
          <div className="flex flex-wrap justify-center gap-4 text-xs text-warm-gray/60">
            <Link href="/mentions-legales" className="hover:text-terra transition-colors">
              Mentions l&eacute;gales
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-terra transition-colors">
              Politique de confidentialit&eacute;
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
