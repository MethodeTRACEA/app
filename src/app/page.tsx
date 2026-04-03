import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      className="landing-page min-h-screen text-beige relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 50% 20%, rgba(205,120,80,0.18), transparent 40%),
          radial-gradient(circle at 30% 60%, rgba(205,120,80,0.12), transparent 45%),
          radial-gradient(circle at 70% 80%, rgba(205,120,80,0.10), transparent 50%),
          linear-gradient(180deg, #1A0F0B 0%, #2A1712 40%, #1A0F0B 100%)
        `,
      }}
    >
      {/* Grain texture — casse le flat digital */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" aria-hidden="true" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px 256px" }} />

      {/* ── HERO ── */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden" style={{ padding: "100px 20px" }}>
        {/* Halo hero */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(circle, rgba(205,120,80,0.15), transparent 60%)", filter: "blur(60px)" }} />

        <div className="relative z-10 w-full text-center" style={{ maxWidth: 580, margin: "0 auto" }}>
          <div className="mb-12">
            <img
              src="/images/tracea-logo-terra-v2.png"
              alt="TRACEA"
              className="h-16 md:h-24 mx-auto object-contain"
            />
          </div>

          <h1 className="font-serif text-cream" style={{ fontSize: 32, lineHeight: 1.3, letterSpacing: "-0.5px", marginBottom: 24 }}>
            Tu n&apos;es pas instable.
          </h1>
          <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, color: "#D28A6A", margin: "20px 0 40px" }}>
            Tu es en &eacute;tat d&apos;alerte permanent.
          </p>

          <p className="font-body text-cream/80" style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9, marginBottom: 12 }}>
            Et &ccedil;a peut redescendre.
          </p>
          <p className="font-body" style={{ fontSize: 20, fontWeight: 500, color: "#D28A6A", margin: "20px 0 56px" }}>
            En quelques minutes.
          </p>

          <Link
            href="/start"
            className="inline-block w-full sm:w-auto text-white transition-all duration-300 active:scale-[0.98] hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #C97B57, #B96A48)",
              padding: "18px 28px",
              borderRadius: 40,
              fontSize: 18,
              fontWeight: 500,
              boxShadow: "0 10px 30px rgba(201,123,87,0.25)",
            }}
          >
            Commencer maintenant (gratuit)
          </Link>

          <p className="font-body text-warm-gray/40" style={{ fontSize: 14, marginTop: 24 }}>
            10 minutes. Sans forcer. Tu peux arr&ecirc;ter &agrave; tout moment.
          </p>
        </div>
      </section>

      {/* ── IDENTIFICATION — alignement gauche soft ── */}
      <section className="relative" style={{ padding: "60px 20px" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div style={{ maxWidth: 480 }}>
            <div className="space-y-6 mb-12">
              <p className="font-body text-beige-dark" style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
                Tu envoies un message. Tu le regrettes.
              </p>
              <p className="font-body text-beige-dark" style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
                Tu rejoues. Tu anticipes. Tu t&apos;&eacute;puises.
              </p>
              <p className="font-body text-cream" style={{ fontSize: 18, lineHeight: 1.6 }}>
                Tu voudrais que &ccedil;a s&apos;arr&ecirc;te.
              </p>
              <p className="font-body text-warm-gray/50" style={{ fontSize: 18, lineHeight: 1.6 }}>
                Ton corps ne te laisse pas.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/start"
              className="inline-block w-full sm:w-auto text-white transition-all duration-300 active:scale-[0.98] hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #C97B57, #B96A48)",
                padding: "18px 28px",
                borderRadius: 40,
                fontSize: 18,
                fontWeight: 500,
                boxShadow: "0 10px 30px rgba(201,123,87,0.25)",
              }}
            >
              Essayer maintenant (gratuit)
            </Link>
          </div>
        </div>
      </section>

      {/* ── RECADRAGE — centré avec halo ── */}
      <section className="relative" style={{ padding: "100px 20px" }}>
        {/* Halo derrière titre */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(circle, rgba(205,120,80,0.15), transparent 60%)", filter: "blur(60px)" }} />

        <div className="relative z-10 text-center" style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 className="font-serif text-cream" style={{ fontSize: 32, lineHeight: 1.3, letterSpacing: "-0.5px", marginBottom: 32 }}>
            Ce n&apos;est pas dans ta t&ecirc;te.
          </h2>
          <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, color: "#D28A6A", margin: "20px 0 40px" }}>
            C&apos;est ton syst&egrave;me nerveux.
          </p>
          <p className="font-body text-beige-dark/70" style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 12 }}>
            Quand il s&apos;emballe, tout s&apos;emballe.
          </p>
          <p className="font-body text-warm-gray/50" style={{ fontSize: 18, lineHeight: 1.6 }}>
            Tu ne peux pas juste &laquo;&thinsp;te calmer&thinsp;&raquo;.
          </p>
        </div>
      </section>

      {/* ── PROBLÈME — gauche soft ── */}
      <section className="relative" style={{ padding: "60px 20px" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 className="font-serif text-cream text-center" style={{ fontSize: 32, lineHeight: 1.3, letterSpacing: "-0.5px", marginBottom: 40 }}>
            Ton corps est bloqu&eacute;.
          </h2>

          <div style={{ maxWidth: 480 }}>
            <div className="space-y-5 mb-12">
              {[
                "Tu r\u00e9agis trop vite",
                "Tu sur-analyses",
                "Tu restes tendu, m\u00eame au repos",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#D28A6A" }} />
                  <p className="font-body text-beige-dark" style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="font-body text-warm-gray" style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
              On t&apos;a appris &agrave; g&eacute;rer tes &eacute;motions.
            </p>
            <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, color: "#D28A6A", margin: "20px 0" }}>
              Personne ne t&apos;a appris &agrave; r&eacute;guler ton corps.
            </p>
          </div>
        </div>
      </section>

      {/* ── BASCULE — centré, section importante ── */}
      <section className="relative" style={{ padding: "100px 20px" }}>
        {/* Halo bascule */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(circle, rgba(205,120,80,0.15), transparent 60%)", filter: "blur(60px)" }} />

        <div className="relative z-10 text-center" style={{ maxWidth: 580, margin: "0 auto" }}>
          <p className="font-serif text-cream" style={{ fontSize: 32, lineHeight: 1.3, letterSpacing: "-0.5px", marginBottom: 16 }}>
            Le probl&egrave;me, ce n&apos;est pas ce que tu ressens.
          </p>
          <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, color: "#D28A6A", margin: "20px 0" }}>
            C&apos;est ce qui ne redescend pas en toi.
          </p>
        </div>
      </section>

      {/* ── SOLUTION — centré ── */}
      <section className="relative" style={{ padding: "60px 20px" }}>
        <div className="text-center" style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 className="font-serif text-cream" style={{ fontSize: 32, lineHeight: 1.3, letterSpacing: "-0.5px", marginBottom: 40 }}>
            TRAC&Eacute;A est un entra&icirc;nement guid&eacute;.
          </h2>

          <div className="space-y-5 mb-10">
            <p className="font-body text-beige-dark" style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
              Tu arrives dans ton &eacute;tat actuel.
              <br />
              Tu suis les &eacute;tapes.
              <br />
              Ton corps redescend.
            </p>
          </div>

          <div className="space-y-2 mb-14">
            <p className="font-body text-warm-gray/50" style={{ fontSize: 18, lineHeight: 1.6 }}>Pas de th&eacute;orie.</p>
            <p className="font-body text-warm-gray/50" style={{ fontSize: 18, lineHeight: 1.6 }}>Pas d&apos;analyse.</p>
            <p className="font-body text-cream" style={{ fontSize: 20, fontWeight: 500, marginTop: 20 }}>Du concret.</p>
          </div>

          <Link
            href="/start"
            className="inline-block w-full sm:w-auto text-white transition-all duration-300 active:scale-[0.98] hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #C97B57, #B96A48)",
              padding: "18px 28px",
              borderRadius: 40,
              fontSize: 18,
              fontWeight: 500,
              boxShadow: "0 10px 30px rgba(201,123,87,0.25)",
            }}
          >
            Je veux essayer maintenant
          </Link>
        </div>
      </section>

      {/* ── BÉNÉFICES — cartes glass ── */}
      <section className="relative" style={{ padding: "100px 20px" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 className="font-serif text-cream text-center" style={{ fontSize: 32, lineHeight: 1.3, letterSpacing: "-0.5px", marginBottom: 40 }}>
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
                className="text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: 20,
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                <p className="font-serif text-cream" style={{ fontSize: 18, lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÉTHODE — gauche soft ── */}
      <section className="relative" style={{ padding: "60px 20px" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 className="font-serif text-cream text-center" style={{ fontSize: 32, lineHeight: 1.3, letterSpacing: "-0.5px", marginBottom: 16 }}>
            6 &eacute;tapes. 10 minutes.
          </h2>
          <p className="font-serif text-center" style={{ fontSize: 20, fontWeight: 500, color: "#D28A6A", margin: "20px 0 56px" }}>
            Un chemin clair.
          </p>

          <div style={{ maxWidth: 480 }}>
            <div className="space-y-4">
              {[
                { letter: "T", name: "Traverser", color: "#C97B57" },
                { letter: "R", name: "Reconna\u00eetre", color: "rgba(201,123,87,0.8)" },
                { letter: "A", name: "Ancrer", color: "#8A9E7A" },
                { letter: "C", name: "Conscientiser", color: "#9E8E80" },
                { letter: "\u00c9", name: "\u00c9merger", color: "#C4998A" },
                { letter: "A", name: "Aligner", color: "#8A4A2F" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl text-cream flex-shrink-0"
                    style={{ background: step.color }}
                  >
                    {step.letter}
                  </div>
                  <span className="font-serif text-cream" style={{ fontSize: 20, lineHeight: 1.3 }}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPÉRIENCE — centré, section importante ── */}
      <section className="relative" style={{ padding: "100px 20px" }}>
        <div className="text-center space-y-5" style={{ maxWidth: 580, margin: "0 auto" }}>
          <p className="font-body text-warm-gray/50" style={{ fontSize: 18, lineHeight: 1.6 }}>Tu respires.</p>
          <p className="font-body text-beige-dark/70" style={{ fontSize: 18, lineHeight: 1.6 }}>Ton corps ralentit.</p>
          <p className="font-body text-cream" style={{ fontSize: 20, fontWeight: 500 }}>Tu reprends le contr&ocirc;le.</p>
        </div>
      </section>

      {/* ── CTA FINAL — centré avec halo fort ── */}
      <section className="relative" style={{ padding: "100px 20px" }}>
        {/* Halo CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(circle, rgba(205,120,80,0.15), transparent 60%)", filter: "blur(60px)" }} />

        <div className="relative z-10 text-center" style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 className="font-serif text-cream" style={{ fontSize: 32, lineHeight: 1.3, letterSpacing: "-0.5px", marginBottom: 16 }}>
            Tu n&apos;as rien &agrave; comprendre de plus. Juste &agrave; commencer.
          </h2>
          <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, color: "#D28A6A", margin: "20px 0 56px" }}>
            Ton corps sait d&eacute;j&agrave; quoi faire.
          </p>

          <Link
            href="/start"
            className="inline-block w-full sm:w-auto text-white transition-all duration-300 active:scale-[0.98] hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #C97B57, #B96A48)",
              padding: "18px 28px",
              borderRadius: 40,
              fontSize: 18,
              fontWeight: 500,
              boxShadow: "0 10px 30px rgba(201,123,87,0.25)",
            }}
          >
            Commencer maintenant
          </Link>

          <p className="font-body text-warm-gray/40" style={{ fontSize: 14, marginTop: 24 }}>
            10 minutes. Gratuit. Sans engagement.
          </p>
        </div>
      </section>

      {/* ── RASSURANCE ── */}
      <section className="relative" style={{ padding: "60px 20px" }}>
        <div className="text-center space-y-4" style={{ maxWidth: 580, margin: "0 auto" }}>
          <p className="font-body text-warm-gray" style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
            Ce n&apos;est pas une th&eacute;rapie.
          </p>
          <p className="font-body text-warm-gray" style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
            Ce n&apos;est pas magique.
          </p>
          <p className="font-body text-beige-dark" style={{ fontSize: 18, lineHeight: 1.6 }}>
            Mais c&apos;est structur&eacute;.
            <br />
            Et &ccedil;a fonctionne.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative" style={{ padding: "40px 20px" }}>
        <div className="flex flex-col items-center gap-4" style={{ maxWidth: 580, margin: "0 auto" }}>
          <img
            src="/images/tracea-logo-terra-v2.png"
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
