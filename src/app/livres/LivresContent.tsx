"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { trackEvent } from "@/lib/supabase-store";
import { ChapitreOffertForm } from "./ChapitreOffertForm";

// ===================================================================
// PAGE /livres — chantier 63 (lancement commercial des livres)
//
// Tous les textes viennent du brief chantier 63, audités doctrine :
// ne pas les reformuler. L'état précommande/lancement est calculé
// côté serveur (voir page.tsx) et reçu en prop.
// ===================================================================

// ── Données des livres (URLs avec UTM déjà inclus — ne pas dupliquer) ──

type LivreId = "qcd" | "lds";

const LIVRES: Array<{
  id: LivreId;
  titre: string;
  sousTitre: string;
  image: string;
  imageAlt: string;
  amazon: string;
  pdf: string;
  paragraphes: string[];
  note: string;
}> = [
  {
    id: "qcd",
    titre: "Quand ça déborde",
    sousTitre: "Comprendre ce qui se passe en toi, et quoi poser dans l'instant",
    image: "/images/livres/COUVERTURE_QCD_kindle_1600x2560.png",
    imageAlt: "Couverture du livre Quand ça déborde",
    amazon: "https://www.amazon.fr/dp/B0H9512DQJ",
    pdf: "https://payhip.com/b/q0TdY?utm_source=site&utm_medium=page_livres&utm_campaign=lancement_livres",
    paragraphes: [
      `Il est 18h40. Tu rentres, les bras chargés, et une chaussette qui traîne suffit à tout faire basculer. Encore. Et après, toujours la même question : mais qu'est-ce qui ne va pas chez moi ?`,
      `Rien. C'est la réponse de ce livre, et il prend cent pages pour te la montrer.`,
      `Ton corps réagit avant toi, et ce n'est pas un défaut : c'est un système de protection qui fait son travail, un peu trop fort, un peu trop vite. Ce livre explique en langage simple ce qui se passe quand ça monte, pourquoi savoir ne suffit pas à s'arrêter, et ce que tu peux poser dans l'instant : des appuis concrets, à essayer, à garder ou à laisser.`,
    ],
    note: `Pas une thérapie. Pas un hack. Des repères honnêtes.`,
  },
  {
    id: "lds",
    titre: "Loin de soi",
    sousTitre: "Comprendre la dissociation émotionnelle et revenir, à son rythme",
    image: "/images/livres/COUVERTURE_Loin_de_soi_kindle.jpg",
    imageAlt: "Couverture du livre Loin de soi",
    amazon: "https://www.amazon.fr/dp/B0H954BMPJ",
    pdf: "https://payhip.com/b/5fxsq?utm_source=site&utm_medium=page_livres&utm_campaign=lancement_livres",
    paragraphes: [
      `Tu étais là. Tout le monde t'a vue là. Et pourtant, tu n'y étais pas.`,
      `Une réunion qui continue derrière une vitre invisible. Un trajet dont il ne reste aucune image. Un dimanche entier passé à côté de sa propre vie.`,
      `Cette expérience a un nom : la dissociation émotionnelle. Et ce n'est ni une folie, ni une faiblesse. C'est une protection, qui fait son travail un peu trop bien. Ce livre met des mots simples dessus, explique ce qui se passe dans ton corps, et propose des appuis concrets pour revenir, à ton rythme.`,
    ],
    note: `Parce qu'on ne se bat pas contre une protection. On apprend à revenir.`,
  },
];

const LIEN_PACK =
  "https://payhip.com/b/SgsGl?utm_source=site&utm_medium=page_livres&utm_campaign=lancement_livres";

// ── Habillage visuel : univers sombre chaleureux (réf. pages Articles) ──

const pageStyle: CSSProperties = {
  minHeight: "100dvh",
  position: "relative",
  background:
    "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
    "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%), " +
    "#1A120D",
};

const haloStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(circle at 50% 14%, rgba(201,123,106,0.07) 0%, transparent 52%)",
};

const containerStyle: CSSProperties = {
  maxWidth: 680,
  margin: "0 auto",
  padding: "72px 20px 96px",
  position: "relative",
  zIndex: 1,
};

const h1Style: CSSProperties = {
  fontSize: "clamp(1.9rem, 5.5vw, 2.6rem)",
  color: "#F5EFE6",
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
  margin: 0,
};

const chapoStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "1.0625rem",
  lineHeight: 1.7,
  color: "rgba(240,230,214,0.72)",
  margin: "18px auto 0",
  maxWidth: 560,
};

const bandeauStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.9375rem",
  lineHeight: 1.6,
  color: "#E8C99B",
  background: "rgba(212,169,106,0.10)",
  border: "1px solid rgba(212,169,106,0.30)",
  borderRadius: 14,
  padding: "12px 18px",
  margin: "28px auto 0",
  maxWidth: 520,
};

const bookTitleStyle: CSSProperties = {
  fontSize: "clamp(1.5rem, 4.2vw, 1.9rem)",
  color: "#F0E6D6",
  lineHeight: 1.25,
  margin: 0,
};

const bookSubtitleStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "1rem",
  lineHeight: 1.6,
  color: "#C97B6A",
  margin: "10px 0 0",
};

const pBody: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "1rem",
  lineHeight: 1.75,
  color: "rgba(240,230,214,0.78)",
  margin: 0,
};

const pNote: CSSProperties = {
  ...pBody,
  fontStyle: "italic",
  color: "rgba(240,230,214,0.62)",
};

const packCardStyle: CSSProperties = {
  background: "rgba(111,106,100,0.18)",
  border: "1px solid rgba(240,230,214,0.10)",
  borderRadius: 20,
  padding: "30px 26px",
  boxShadow:
    "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
  textAlign: "center",
};

const footerStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.9rem",
  lineHeight: 1.7,
  color: "rgba(240,230,214,0.55)",
  textAlign: "center",
  margin: "72px auto 0",
  maxWidth: 480,
};

// ── Boutons ──

const btnBase: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 15,
  fontWeight: 600,
  borderRadius: 40,
  padding: "13px 24px",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  whiteSpace: "nowrap",
};

const btnPrimary: CSSProperties = {
  ...btnBase,
  color: "#1A120D",
  background:
    "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
};

const btnSecondary: CSSProperties = {
  ...btnBase,
  color: "#F0E6D6",
  background: "transparent",
  border: "1.5px solid rgba(240,230,214,0.35)",
};

const btnDisabled: CSSProperties = {
  ...btnBase,
  fontWeight: 500,
  color: "rgba(240,230,214,0.38)",
  background: "rgba(111,106,100,0.16)",
  border: "1px solid rgba(240,230,214,0.10)",
  cursor: "not-allowed",
};

// Lien de vente actif (nouvel onglet) + event analytics au clic.
function BuyLink({
  href,
  label,
  livre,
  format,
  primary,
}: {
  href: string;
  label: string;
  livre: LivreId | "pack";
  format: "kindle" | "papier" | "pdf";
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="w-full sm:w-auto"
      style={primary ? btnPrimary : btnSecondary}
      onClick={() => {
        void trackEvent(null, "book_click", { livre, format });
      }}
    >
      {label}
    </a>
  );
}

// Bouton désactivé (état A : formats pas encore disponibles).
function DisabledButton({ label }: { label: string }) {
  return (
    <span aria-disabled="true" className="w-full sm:w-auto" style={btnDisabled}>
      {label}
    </span>
  );
}

// ── Page ──

export function LivresContent({ enPrecommande }: { enPrecommande: boolean }) {
  return (
    <div style={pageStyle}>
      <div style={haloStyle} aria-hidden="true" />

      <div style={containerStyle}>
        {/* 1. En-tête */}
        <header style={{ textAlign: "center" }}>
          <h1 className="font-serif" style={h1Style}>
            Les livres
          </h1>
          <p style={chapoStyle}>
            {`Deux livres pour comprendre ce qui se passe en toi. Quand tout monte trop fort, et quand tout s'éloigne.`}
          </p>
          {enPrecommande && (
            <p style={bandeauStyle}>
              Sortie le 1er août. Les versions Kindle sont déjà en précommande.
            </p>
          )}
        </header>

        {/* 2 & 3. Les deux livres */}
        {LIVRES.map((livre) => (
          <section key={livre.id} style={{ marginTop: 72, textAlign: "center" }}>
            <Image
              src={livre.image}
              alt={livre.imageAlt}
              width={1600}
              height={2560}
              sizes="(max-width: 640px) 60vw, 240px"
              priority={livre.id === "qcd"}
              style={{
                width: "100%",
                maxWidth: 240,
                height: "auto",
                borderRadius: 10,
                display: "inline-block",
                boxShadow: "0 22px 48px rgba(0,0,0,0.45)",
              }}
            />
            <h2 className="font-serif" style={{ ...bookTitleStyle, marginTop: 28 }}>
              {livre.titre}
            </h2>
            <p style={bookSubtitleStyle}>{livre.sousTitre}</p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginTop: 24,
                textAlign: "left",
              }}
            >
              {livre.paragraphes.map((p, i) => (
                <p key={i} style={pBody}>
                  {p}
                </p>
              ))}
              <p style={pNote}>{livre.note}</p>
            </div>

            <div
              className="flex flex-col sm:flex-row sm:justify-center"
              style={{ gap: 12, marginTop: 28, flexWrap: "wrap" }}
            >
              {enPrecommande ? (
                <>
                  <BuyLink
                    href={livre.amazon}
                    label="Précommander sur Kindle — 6,99 €"
                    livre={livre.id}
                    format="kindle"
                    primary
                  />
                  <DisabledButton label="Papier — disponible le 1er août" />
                  <DisabledButton label="PDF — disponible le 1er août" />
                </>
              ) : (
                <>
                  <BuyLink
                    href={livre.amazon}
                    label="Lire sur Kindle — 6,99 €"
                    livre={livre.id}
                    format="kindle"
                    primary
                  />
                  <BuyLink
                    href={livre.amazon}
                    label="Commander en papier — 9,99 €"
                    livre={livre.id}
                    format="papier"
                  />
                  <BuyLink
                    href={livre.pdf}
                    label="Télécharger le PDF — 9 €"
                    livre={livre.id}
                    format="pdf"
                  />
                </>
              )}
            </div>
          </section>
        ))}

        {/* 4. Le pack */}
        <section style={{ marginTop: 72 }}>
          <div style={packCardStyle}>
            <Image
              src="/images/livres/VISUEL_pack_2_livres.png"
              alt="Les deux livres en pack"
              width={1600}
              height={1600}
              sizes="(max-width: 640px) 80vw, 380px"
              style={{
                width: "100%",
                maxWidth: 380,
                height: "auto",
                borderRadius: 12,
                display: "inline-block",
              }}
            />
            <h2 className="font-serif" style={{ ...bookTitleStyle, marginTop: 24 }}>
              Les deux, en pack
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginTop: 18,
              }}
            >
              <p style={pBody}>
                {`Quand tout monte. Quand tout s'éloigne. La plupart des gens connaissent les deux, parfois la même semaine.`}
              </p>
              <p style={pBody}>
                {`Les deux livres en PDF, pour 14 € au lieu de 18 €. Le pack n'existe qu'ici.`}
              </p>
            </div>
            <div style={{ marginTop: 26 }}>
              {enPrecommande ? (
                <DisabledButton label="Le pack — disponible le 1er août" />
              ) : (
                <BuyLink
                  href={LIEN_PACK}
                  label="Prendre le pack — 14 €"
                  livre="pack"
                  format="pdf"
                  primary
                />
              )}
            </div>
          </div>
        </section>

        {/* 5. Le chapitre 1 est offert */}
        <section style={{ marginTop: 72, textAlign: "center" }}>
          <h2 className="font-serif" style={bookTitleStyle}>
            {`Tu veux lire avant d'acheter ?`}
          </h2>
          <p style={{ ...pBody, margin: "18px auto 0", maxWidth: 520 }}>
            {`Le premier chapitre de « Quand ça déborde » est offert, en entier. Dix minutes de lecture, et tu sauras si ce livre est pour toi.`}
          </p>
          {/* Formulaire natif (aucun script tiers) — actif dans les DEUX
              états de la page (précommande et lancement), sans exception. */}
          <div style={{ marginTop: 26 }}>
            <ChapitreOffertForm />
          </div>
        </section>

        {/* 6. Pied de page */}
        <p style={footerStyle}>
          Ces livres ne remplacent pas un accompagnement professionnel. Ils
          peuvent être un premier pas vers lui.
        </p>
      </div>
    </div>
  );
}
