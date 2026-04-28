import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#1A120D" }}
    >
      {/* Background gradients V3 */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
            "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%)",
        }}
      />

      {/* Halo V3 */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(201,123,106,0.28) 0%, rgba(201,123,106,0) 75%)",
          zIndex: 0,
        }}
      />

      {/* ════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] md:min-h-[95vh] flex items-center justify-center px-6 py-10 md:py-28" style={{ zIndex: 1 }}>
        <div className="relative z-10 w-full text-center" style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Logo */}
          <div className="mb-4 md:mb-14">
            <img
              src="/images/tracea-logo-terra-transparent.png"
              alt="TRACÉA"
              className="mx-auto object-contain"
              style={{ height: "clamp(72px, 10vw, 88px)" }}
            />
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5 md:mb-12"
            style={{
              background: "rgba(111,106,100,0.16)",
              border: "1px solid rgba(240,230,214,0.12)",
            }}
          >
            <span
              className="text-[13px] tracking-wide"
              style={{ color: "rgba(240,230,214,0.62)" }}
            >
              1re traversée gratuite · 2 à 5 minutes
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-[30px] md:text-[40px] leading-[1.25] tracking-tight mb-4 md:mb-6" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            Quand ça te submerge,
            <br />
            tu fais quoi ?
          </h1>

          {/* Sous-titre */}
          <div
            className="mx-auto mb-6 md:mb-12"
            style={{
              maxWidth: 360,
              marginTop: 28,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              textAlign: "center",
            }}
          >
            {/* Symptômes */}
            <p
              style={{
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                fontSize: "clamp(1.02rem, 4vw, 1.18rem)",
                lineHeight: 1.65,
                fontWeight: 300,
                color: "rgba(240,230,214,0.52)",
                margin: 0,
              }}
            >
              Poitrine serr&eacute;e.<br />
              Souffle court.<br />
              Pens&eacute;es en boucle.
            </p>

            {/* Phrase centrale */}
            <p
              style={{
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                fontSize: "clamp(1.22rem, 4.8vw, 1.42rem)",
                lineHeight: 1.35,
                fontWeight: 500,
                color: "#F0E6D6",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              TRAC&Eacute;A t&apos;aide &agrave; redescendre.
            </p>

            {/* Promesse */}
            <p
              style={{
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                fontSize: "clamp(1.02rem, 4vw, 1.16rem)",
                lineHeight: 1.45,
                fontWeight: 400,
                color: "rgba(240,230,214,0.66)",
                margin: 0,
              }}
            >
              En quelques minutes.
            </p>

            {/* Différenciateur */}
            <p
              style={{
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                fontSize: "clamp(0.98rem, 3.8vw, 1.08rem)",
                lineHeight: 1.55,
                fontWeight: 300,
                color: "rgba(240,230,214,0.46)",
                margin: 0,
              }}
            >
              Sans r&eacute;fl&eacute;chir &agrave; l&apos;infini.<br />
              Sans tourner en boucle.
            </p>
          </div>

          {/* CTA principal */}
          <Link
            href="/start"
            className="font-sans inline-block w-full sm:w-auto text-center text-base md:text-lg px-8"
            style={{
              background: "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
              color: "#1A120D",
              borderRadius: 40,
              padding: "16px 40px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 8px 32px rgba(201,144,124,0.18), 0 2px 8px rgba(0,0,0,0.15), 0 0 40px rgba(200,120,90,0.35)",
            }}
          >
            Lancer ma 1re travers&eacute;e
          </Link>

          {/* CTA secondaire */}
          <div className="mt-4 md:mt-5">
            <Link
              href="/comment-ca-marche"
              className="text-sm transition-colors underline underline-offset-4"
              style={{ color: "rgba(201,123,106,0.60)", textDecorationColor: "rgba(201,123,106,0.20)" }}
            >
              Voir comment &ccedil;a marche
            </Link>
          </div>

          {/* Micro-texte */}
          <p className="text-[13px] mt-5 md:mt-8 tracking-wide" style={{ color: "rgba(240,230,214,0.35)" }}>
            1re travers&eacute;e gratuite · sans engagement
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          IDENTIFICATION
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-14 md:py-18" style={{ zIndex: 1 }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            background: "rgba(111,106,100,0.18)",
            border: "1px solid rgba(240,230,214,0.10)",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <h2 className="text-[24px] md:text-[30px] tracking-tight mb-8 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            Tu connais ce moment pr&eacute;cis
          </h2>

          <div className="space-y-4 mb-8">
            {[
              "Ça serre dans ta poitrine",
              "Ton souffle se coupe",
              "Tu relis le même message 10 fois",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <span
                  style={{
                    display: "inline-block",
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: "#C97B6A",
                    opacity: 0.85,
                    flexShrink: 0,
                    marginTop: 10,
                  }}
                />
                <p className="text-base leading-relaxed" style={{ color: "rgba(240,230,214,0.68)" }}>
                  {item}
                </p>
              </div>
            ))}
          </div>

          <p className="text-base font-medium text-center" style={{ color: "#D99A84", fontStyle: "italic" }}>
            C&apos;est l&agrave; que tout se joue.
          </p>
          <p className="text-base text-center mt-4" style={{ color: "rgba(240,230,214,0.50)" }}>
            Et &ccedil;a peut durer longtemps.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          BASCULE
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-6 md:py-10" style={{ zIndex: 1 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: "rgba(240,230,214,0.70)", fontWeight: 300 }}>
            Tu n&apos;as pas besoin de comprendre.
          </p>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: "rgba(240,230,214,0.50)", fontWeight: 300 }}>
            Quand &ccedil;a d&eacute;borde, r&eacute;fl&eacute;chir ne suffit plus.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FONCTIONNEMENT
      ════════════════════════════════════════════════════════════ */}
      <section id="fonctionnement" className="relative px-6 py-14 md:py-18 scroll-mt-8" style={{ zIndex: 1 }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            background: "rgba(111,106,100,0.18)",
            border: "1px solid rgba(240,230,214,0.10)",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <h2 className="text-[24px] md:text-[30px] tracking-tight mb-6 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            Tu prends 2 minutes
          </h2>

          <p className="text-base text-center mb-8" style={{ color: "rgba(240,230,214,0.50)", fontWeight: 300 }}>
            En quelques minutes, voil&agrave; ce qui se passe&nbsp;:
          </p>

          <div className="space-y-3 mb-8">
            {[
              "Tu poses ce qui est là",
              "Tu reviens à ton corps",
              "Tu ralentis un peu",
              "Tu comprends ce qui se joue",
              "Tu vois ce qui aiderait",
              "Tu choisis un geste simple",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center text-sm font-medium shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(201,123,106,0.15)",
                    border: "1px solid rgba(201,123,106,0.25)",
                    color: "#C97B6A",
                  }}
                >
                  {i + 1}
                </div>
                <p className="text-base leading-relaxed" style={{ color: "rgba(240,230,214,0.68)" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-base mb-3" style={{ color: "rgba(240,230,214,0.50)", fontWeight: 300 }}>
            Et &agrave; la fin&hellip;
            <br />
            quelque chose redescend.
          </p>

          <p className="text-center text-base font-medium" style={{ color: "#D99A84", fontStyle: "italic" }}>
            Et quelque chose change.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CAS D'USAGE
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-14 md:py-18" style={{ zIndex: 1 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              background: "rgba(111,106,100,0.18)",
              border: "1px solid rgba(240,230,214,0.10)",
              borderRadius: 24,
              padding: "32px 28px",
              boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <h2 className="text-[22px] md:text-[28px] tracking-tight mb-8 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
              Utilise TRAC&Eacute;A quand &ccedil;a monte
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
                  style={{
                    padding: "14px 18px",
                    borderRadius: 16,
                    background: "rgba(26,18,13,0.35)",
                    border: "1px solid rgba(240,230,214,0.07)",
                  }}
                >
                  <p style={{ fontSize: 14, color: "rgba(240,230,214,0.65)", lineHeight: 1.55 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          IMPACT
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-14 md:py-18" style={{ zIndex: 1 }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            background: "rgba(111,106,100,0.18)",
            border: "1px solid rgba(240,230,214,0.10)",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <h2 className="text-[24px] md:text-[30px] tracking-tight mb-6 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            En quelques minutes
          </h2>

          <p className="text-base text-center mb-6" style={{ color: "rgba(240,230,214,0.50)", fontWeight: 300 }}>
            Tu le sens tout de suite&nbsp;:
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              "Ça relâche un peu",
              "Tu respires mieux",
              "C'est plus clair",
              "Tu sais quoi faire",
            ].map((text, i) => (
              <div
                key={i}
                style={{
                  minHeight: 72,
                  padding: "14px 12px",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(26,18,13,0.35)",
                  border: "1px solid rgba(240,230,214,0.07)",
                }}
              >
                <p style={{ fontSize: 14, color: "rgba(240,230,214,0.72)", lineHeight: 1.35, textAlign: "center", margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm font-medium" style={{ color: "#D99A84", fontStyle: "italic" }}>
            C&apos;est d&eacute;j&agrave; suffisant.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-16 md:py-20" style={{ zIndex: 1 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 className="text-[26px] md:text-[32px] tracking-tight mb-6" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            Essaye maintenant
          </h2>

          <p className="text-base mb-10" style={{ color: "rgba(240,230,214,0.60)" }}>
            Juste 2 minutes.
            <br />
            Juste voir.
          </p>

          <Link
            href="/start"
            className="font-sans inline-block w-full sm:w-auto text-center text-base md:text-lg"
            style={{
              background: "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
              color: "#1A120D",
              borderRadius: 40,
              padding: "16px 40px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 8px 32px rgba(201,144,124,0.18), 0 2px 8px rgba(0,0,0,0.15), 0 0 40px rgba(200,120,90,0.35)",
            }}
          >
            Lancer ma travers&eacute;e
          </Link>

          <p className="text-[13px] mt-6 tracking-wide" style={{ color: "rgba(240,230,214,0.35)" }}>
            Premi&egrave;re travers&eacute;e gratuite
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════ */}
      <footer className="relative px-6 py-10" style={{ borderTop: "1px solid rgba(240,230,214,0.06)", zIndex: 1 }}>
        <div className="flex flex-col items-center gap-5" style={{ maxWidth: 640, margin: "0 auto" }}>
          <img
            src="/images/tracea-logo-terra-transparent.png"
            alt="TRACÉA"
            className="h-7 object-contain"
            style={{ opacity: 0.4 }}
          />
          <div className="flex flex-wrap justify-center gap-5 text-[12px]" style={{ color: "rgba(240,230,214,0.35)" }}>
            <Link href="/mentions-legales" className="transition-colors" style={{ color: "rgba(240,230,214,0.35)" }}>
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="transition-colors" style={{ color: "rgba(240,230,214,0.35)" }}>
              Politique de confidentialité
            </Link>
            <Link href="/conditions-utilisation" className="transition-colors" style={{ color: "rgba(240,230,214,0.35)" }}>
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
