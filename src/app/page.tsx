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
      <section className="relative min-h-[88vh] md:min-h-[95vh] flex items-center justify-center px-6 py-20 md:py-28" style={{ zIndex: 1 }}>
        <div className="relative z-10 w-full text-center" style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Logo */}
          <div className="mb-10 md:mb-14">
            <img
              src="/images/tracea-logo-terra-transparent.png"
              alt="TRACÉA"
              className="h-14 md:h-20 mx-auto object-contain"
            />
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10 md:mb-12"
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
          <h1 className="text-[32px] md:text-[40px] leading-[1.25] tracking-tight mb-6" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            Quand ça monte dans ton corps,
            <br />
            tu fais quoi ?
          </h1>

          {/* Sous-titre */}
          <div className="text-base md:text-lg leading-relaxed max-w-sm mx-auto mb-10 md:mb-12 space-y-4" style={{ color: "rgba(240,230,214,0.60)" }}>
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
          <div className="mt-5">
            <Link
              href="/comment-ca-marche"
              className="text-sm transition-colors underline underline-offset-4"
              style={{ color: "rgba(201,123,106,0.60)", textDecorationColor: "rgba(201,123,106,0.20)" }}
            >
              Voir comment &ccedil;a marche
            </Link>
          </div>

          {/* Micro-texte */}
          <p className="text-[13px] mt-8 tracking-wide" style={{ color: "rgba(240,230,214,0.35)" }}>
            Gratuit · Sans engagement
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
              "ça serre dans ta poitrine",
              "ton souffle se coupe",
              "tu relis le même message 10 fois",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <span style={{ color: "#C97B6A", fontSize: 15, lineHeight: 1.65, flexShrink: 0 }}>—</span>
                <p className="text-base leading-relaxed" style={{ color: "rgba(240,230,214,0.68)" }}>
                  {item}
                </p>
              </div>
            ))}
          </div>

          <p className="text-base font-medium text-center" style={{ color: "#D99A84", fontStyle: "italic" }}>
            C&apos;est l&agrave; que tout se joue.
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
          <h2 className="text-[24px] md:text-[30px] tracking-tight mb-10 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            Tu prends 2 minutes
          </h2>

          <div className="space-y-5 mb-10">
            {[
              "Tu poses ce qui est là",
              "Tu reviens à ton corps",
              "Tu ralentis un peu",
              "Tu vois ce qui aiderait",
              "Tu choisis un geste simple",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-5">
                <div
                  className="flex items-center justify-center text-sm font-medium shrink-0"
                  style={{
                    width: 36,
                    height: 36,
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
          <h2 className="text-[24px] md:text-[30px] tracking-tight mb-8 text-center" style={{ fontWeight: 300, color: "#F0E6D6" }}>
            En quelques minutes
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              "ça relâche un peu",
              "tu respires mieux",
              "c'est plus clair",
              "tu sais quoi faire",
            ].map((text, i) => (
              <div
                key={i}
                style={{
                  padding: "18px 14px",
                  borderRadius: 16,
                  textAlign: "center",
                  background: "rgba(26,18,13,0.35)",
                  border: "1px solid rgba(240,230,214,0.07)",
                }}
              >
                <p style={{ fontSize: 14, color: "rgba(240,230,214,0.72)", lineHeight: 1.5 }}>{text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm font-medium" style={{ color: "#D99A84", fontStyle: "italic" }}>
            C&apos;est d&eacute;j&agrave; suffisant.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CADRE / SÉCURITÉ
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-14 md:py-18" style={{ zIndex: 1 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              background: "rgba(111,106,100,0.18)",
              border: "1px solid rgba(240,230,214,0.14)",
              borderRadius: 24,
              padding: "28px 26px",
              boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <h2 className="text-base md:text-lg mb-5" style={{ fontWeight: 400, color: "#F0E6D6" }}>
              Ce n&apos;est pas pour tous les moments
            </h2>

            <div className="space-y-3 text-sm leading-relaxed mb-5" style={{ color: "rgba(240,230,214,0.60)" }}>
              <p>Si tu es compl&egrave;tement submerg&eacute;(e)</p>
              <p>ou en &eacute;tat de d&eacute;tresse :</p>
              <p style={{ color: "#F0E6D6", fontWeight: 500, paddingTop: 4 }}>ne reste pas seul(e) avec &ccedil;a.</p>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "rgba(240,230,214,0.60)" }}>
              TRAC&Eacute;A est un appui.
              <br />
              Pas une solution d&apos;urgence.
            </p>
          </div>
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
