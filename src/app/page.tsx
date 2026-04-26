import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-t-nuit font-inter text-t-beige">
      {/* Grain texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-[1]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Background gradients */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: [
            "radial-gradient(ellipse 70% 45% at 25% 12%, rgba(214,165,106,0.06), transparent 60%)",
            "radial-gradient(ellipse 55% 35% at 75% 55%, rgba(110,67,50,0.05), transparent 55%)",
            "radial-gradient(ellipse 70% 40% at 40% 85%, rgba(214,165,106,0.04), transparent 60%)",
            "linear-gradient(180deg, #231916 0%, #2a1e1a 40%, #231916 100%)",
          ].join(", "),
        }}
      />

      {/* ════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[88vh] md:min-h-[95vh] flex items-center justify-center px-6 py-20 md:py-28">
        {/* Halo */}
        <div
          className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] pointer-events-none"
          aria-hidden="true"
          style={{
            background: "radial-gradient(circle, rgba(214,165,106,0.07), transparent 65%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 w-full max-w-lg mx-auto text-center">
          {/* Logo */}
          <div className="mb-10 md:mb-14">
            <img
              src="/images/tracea-logo-terra-transparent.png"
              alt="TRACÉA"
              className="h-14 md:h-20 mx-auto object-contain"
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10 md:mb-12 border border-t-creme/[0.12] bg-t-brume/20">
            <span className="text-[13px] t-text-secondary tracking-wide">
              1re traversée gratuite · 2 à 5 minutes
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-[32px] md:text-[40px] leading-[1.2] font-medium tracking-tight text-t-beige mb-6">
            Quand ça monte dans ton corps,
            <br />
            tu fais quoi ?
          </h1>

          {/* Sous-titre */}
          <div className="text-base md:text-lg leading-relaxed t-text-secondary max-w-sm mx-auto mb-10 md:mb-12 space-y-4">
            <p>Poitrine serrée. Souffle court. Pensées en boucle.</p>
            <p>
              TRACÉA t&apos;aide à redescendre.
              <br />
              En quelques minutes.
            </p>
          </div>

          {/* CTA principal */}
          <Link
            href="/start"
            className="t-btn-primary inline-block w-full sm:w-auto text-center text-base md:text-lg px-8"
          >
            Lancer ma 1re traversée
          </Link>

          {/* CTA secondaire */}
          <div className="mt-5">
            <a
              href="#fonctionnement"
              className="text-sm text-t-dore/60 hover:text-t-dore/90 transition-colors underline underline-offset-4 decoration-t-dore/20"
            >
              Voir comment ça marche
            </a>
          </div>

          {/* Micro-texte */}
          <p className="text-[13px] t-text-ghost mt-8 tracking-wide">
            Gratuit · Sans engagement
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          IDENTIFICATION
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-20 md:py-28">
        <div className="max-w-lg mx-auto">
          <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight text-t-beige mb-10 text-center">
            Tu connais ce moment précis
          </h2>

          <div className="space-y-5 mb-10 max-w-md">
            {[
              "ça serre dans ta poitrine",
              "ton souffle se coupe",
              "tu relis le même message 10 fois",
              "tu sens que tu vas répondre trop vite",
              "ou tu n'arrives plus à répondre du tout",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-t-dore/50 mt-2.5 shrink-0" />
                <p className="text-base md:text-lg leading-relaxed t-text-secondary">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <p className="text-lg md:text-xl font-medium text-t-dore/80 text-center">
            C&apos;est là que tout se joue.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          POSITIONNEMENT
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-20 md:py-28">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] pointer-events-none"
          aria-hidden="true"
          style={{
            background: "radial-gradient(circle, rgba(214,165,106,0.05), transparent 65%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 max-w-lg mx-auto text-center">
          <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight text-t-beige mb-8">
            Tu n&apos;as pas besoin de comprendre.
          </h2>

          <div className="space-y-4 text-base md:text-lg leading-relaxed t-text-secondary mb-10">
            <p>Quand ça déborde,</p>
            <p>réfléchir ne suffit plus.</p>
          </div>

          <div className="space-y-3 text-base md:text-lg leading-relaxed t-text-primary">
            <p className="font-medium">Il faut redescendre.</p>
            <p className="text-t-dore/80 pt-2">TRACÉA est fait pour ça.</p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FONCTIONNEMENT
      ════════════════════════════════════════════════════════════ */}
      <section id="fonctionnement" className="relative px-6 py-20 md:py-28 scroll-mt-8">
        <div className="max-w-lg mx-auto">
          <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight text-t-beige mb-12 text-center">
            Tu prends 2 minutes
          </h2>

          <div className="space-y-5 max-w-md mx-auto mb-12">
            {[
              "Tu poses ce qui est là",
              "Tu reviens à ton corps",
              "Tu ralentis un peu",
              "Tu vois ce qui aiderait",
              "Tu choisis un geste simple",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                  style={{
                    background: "rgba(214,165,106,0.12)",
                    border: "1px solid rgba(214,165,106,0.15)",
                    color: "#D6A56A",
                  }}
                >
                  {i + 1}
                </div>
                <p className="text-base md:text-lg t-text-primary leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-lg md:text-xl t-text-primary font-medium">
            Et quelque chose change.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          DIFFÉRENCIATION
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-20 md:py-28">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] pointer-events-none"
          aria-hidden="true"
          style={{
            background: "radial-gradient(circle, rgba(214,165,106,0.05), transparent 65%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 max-w-lg mx-auto text-center">
          <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight text-t-beige mb-10">
            Comprendre ne calme pas le corps
          </h2>

          <div className="space-y-4 text-base md:text-lg leading-relaxed t-text-secondary mb-8">
            <p>Tu peux tout analyser.</p>
            <p>Ça ne change rien dans le moment.</p>
          </div>

          <div className="space-y-3 text-base md:text-lg leading-relaxed t-text-primary">
            <p>Ce qui change quelque chose :</p>
            <p className="text-t-dore/80 font-medium">revenir dans ton corps.</p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CAS D'USAGE
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-20 md:py-28">
        <div className="max-w-lg mx-auto">
          <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight text-t-beige mb-10 text-center">
            Utilise TRACÉA quand ça monte
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "après un message qui te déclenche",
              "quand ton corps est trop tendu",
              "quand ça tourne sans arrêt",
              "quand tu sens que tu vas exploser",
              "quand tu es saturée",
              "avant une discussion difficile",
            ].map((text, i) => (
              <div
                key={i}
                className="px-5 py-4 rounded-[20px] border border-t-creme/[0.08] bg-t-brume/15"
                style={{
                  backdropFilter: "blur(10px)",
                }}
              >
                <p className="text-[15px] t-text-secondary leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          IMPACT
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-20 md:py-28">
        <div className="max-w-lg mx-auto">
          <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight text-t-beige mb-10 text-center">
            En quelques minutes
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {[
              "ça relâche un peu",
              "tu respires mieux",
              "c'est plus clair",
              "tu sais quoi faire",
            ].map((text, i) => (
              <div
                key={i}
                className="px-5 py-5 rounded-[20px] text-center border border-t-dore/[0.10] bg-t-brume/10"
                style={{
                  boxShadow: "0 0 30px rgba(214,165,106,0.04)",
                }}
              >
                <p className="text-[15px] t-text-primary leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-base text-t-dore/70 font-medium">
            C&apos;est déjà suffisant.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          GRATUITÉ / MODÈLE
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-20 md:py-28">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] pointer-events-none"
          aria-hidden="true"
          style={{
            background: "radial-gradient(circle, rgba(214,165,106,0.06), transparent 65%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 max-w-lg mx-auto text-center">
          <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight text-t-beige mb-8">
            Commence sans réfléchir
          </h2>

          <div className="space-y-4 text-base md:text-lg leading-relaxed t-text-secondary mb-6">
            <p>La première traversée est gratuite.</p>
            <p>Tu testes.</p>
            <p>Tu vois si ça t&apos;aide.</p>
          </div>

          <p className="text-sm t-text-secondary leading-relaxed mb-10 max-w-sm mx-auto">
            Ensuite, l&apos;accès complet se poursuit par abonnement.
          </p>

          <Link
            href="/start"
            className="t-btn-primary inline-block w-full sm:w-auto text-center text-base md:text-lg px-8"
          >
            Essayer ma 1re traversée gratuite
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CADRE / SÉCURITÉ
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-16 md:py-20">
        <div className="max-w-lg mx-auto">
          <div
            className="px-6 py-8 md:px-8 md:py-10 rounded-[28px] border border-t-creme/[0.06] bg-t-brume/10"
            style={{ backdropFilter: "blur(10px)" }}
          >
            <h2 className="text-lg md:text-xl font-medium t-text-primary mb-5">
              Ce n&apos;est pas pour tous les moments
            </h2>

            <div className="space-y-3 text-sm md:text-base leading-relaxed t-text-secondary mb-5">
              <p>Si tu es complètement submergé(e)</p>
              <p>ou en état de détresse :</p>
              <p className="t-text-primary font-medium pt-1">ne reste pas seul(e) avec ça.</p>
            </div>

            <p className="text-sm md:text-base leading-relaxed t-text-secondary">
              TRACÉA est un appui.
              <br />
              Pas une solution d&apos;urgence.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-24 md:py-32">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[450px] pointer-events-none"
          aria-hidden="true"
          style={{
            background: "radial-gradient(circle, rgba(214,165,106,0.07), transparent 65%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 max-w-lg mx-auto text-center">
          <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight text-t-beige mb-6">
            Essaye maintenant
          </h2>

          <p className="text-base t-text-secondary mb-10">
            Juste 2 minutes.
            <br />
            Juste voir.
          </p>

          <Link
            href="/start"
            className="t-btn-primary inline-block w-full sm:w-auto text-center text-base md:text-lg px-8"
          >
            Lancer ma traversée
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════ */}
      <footer className="relative px-6 py-10 border-t border-t-creme/[0.06]">
        <div className="flex flex-col items-center gap-5 max-w-lg mx-auto">
          <img
            src="/images/tracea-logo-terra-transparent.png"
            alt="TRACÉA"
            className="h-7 object-contain opacity-40"
          />
          <div className="flex flex-wrap justify-center gap-5 text-[12px] t-text-ghost">
            <Link href="/mentions-legales" className="hover:text-t-creme/50 transition-colors">
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-t-creme/50 transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/conditions-utilisation" className="hover:text-t-creme/50 transition-colors">
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
