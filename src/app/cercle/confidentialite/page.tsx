import type { Metadata } from "next";
import type { CSSProperties } from "react";
import {
  Section,
  colors,
  SimpleHeader,
  containerStyle,
  linkStyle,
  pStyle,
} from "../_ui";

// Le Cercle TRACÉA en ligne — politique de confidentialité.
// Texte repris mot pour mot du document du 13 oct. 2026. Le tableau
// s'affiche en vrai tableau sur grand écran, et en fiches empilées sur
// téléphone (une seule des deux versions est visible, l'autre est
// display:none donc ignorée par les lecteurs d'écran).
export const metadata: Metadata = {
  title: "Confidentialité · Le Cercle TRACÉA en ligne",
  description:
    "Ce que le Cercle TRACÉA en ligne fait de tes informations, et tes droits.",
};

const EMAIL = "cercledeparole@methodetracea.fr";

const COLONNES = [
  "Information",
  "À quoi elle sert",
  "Sur quelle base",
  "Combien de temps",
] as const;

const LIGNES: [string, string, string, string][] = [
  [
    "Prénom ou pseudonyme, email, créneau, façon de participer",
    "Organiser ta participation et t'envoyer les liens",
    "L'exécution de ton inscription",
    "Jusqu'à une semaine après la dernière rencontre",
  ],
  [
    "Téléphone et commune",
    "Te joindre, ou prévenir les secours, si tu sembles en danger pendant une rencontre",
    "Ton consentement, et en cas d'urgence la protection de ta vie",
    "Effacés une semaine après la dernière rencontre",
  ],
  [
    "Email, si tu as coché « prévenir du prochain cycle »",
    "T'annoncer le prochain cycle, et rien d'autre",
    "Ton consentement",
    "Jusqu'au prochain cycle, et au plus un an",
  ],
  [
    "Informations de paiement",
    "Ma comptabilité",
    "Une obligation légale",
    "Dix ans, comme la loi l'exige",
  ],
];

const cellStyle: CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "0.9375rem",
  lineHeight: 1.55,
  color: colors.body,
  padding: "12px 10px",
  borderTop: `1px solid ${colors.line}`,
  verticalAlign: "top",
  textAlign: "left",
};

const thStyle: CSSProperties = {
  ...cellStyle,
  color: colors.heading,
  fontWeight: 600,
  borderTop: "none",
};

function Para({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <Section title={titre}>
      <p style={pStyle}>{children}</p>
    </Section>
  );
}

export default function CercleConfidentialitePage() {
  const mail = (
    <a href={`mailto:${EMAIL}`} style={linkStyle}>
      {EMAIL}
    </a>
  );

  return (
    <>
    <SimpleHeader
      title="Politique de confidentialité du Cercle TRACÉA en ligne"
      sub="Dernière mise à jour : 13 octobre 2026"
    />
    <div style={{ ...containerStyle, paddingBottom: 80 }}>

      <p style={{ ...pStyle, marginTop: 0 }}>
        {
          "Le Cercle repose sur la confiance. Ça commence par ce que je fais de tes informations. Je recueille le moins possible, je le garde le moins longtemps possible, et je te dis exactement à quoi ça sert."
        }
      </p>

      <Para titre="Qui est responsable de tes données">
        {
          "Alyson Sire EI, entrepreneuse individuelle, SIRET 512 468 174 00036, 57 chemin des Marronniers, 81630 Salvagnac. Tu peux m'écrire à "
        }
        {mail}
        {" pour toute question."}
      </Para>

      <Para titre="Ce que je recueille">
        {
          "Ton prénom ou un pseudonyme, ton email, ton numéro de téléphone, la commune où tu seras pendant les rencontres, la confirmation que tu as 18 ans ou plus, ton créneau et ta façon de participer. Je ne te demande rien sur ta santé ni sur ta situation personnelle. Toutes ces informations sont nécessaires pour t'inscrire, sauf la case « prévenir du prochain cycle », qui reste libre."
        }
      </Para>

      <Para titre="Ce que je ne recueille jamais">
        {
          "Ce qui se dit pendant les rencontres. Les rencontres ne sont pas enregistrées, et je ne note ni les noms ni les phrases des personnes présentes. Les questionnaires de fin de rencontre sont anonymes."
        }
      </Para>

      {/* Tableau : grand écran */}
      <div className="hidden md:block" style={{ marginTop: 36 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {COLONNES.map((c) => (
                <th key={c} scope="col" style={thStyle}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LIGNES.map((ligne) => (
              <tr key={ligne[0]}>
                <th scope="row" style={{ ...cellStyle, color: colors.heading, fontWeight: 500 }}>
                  {ligne[0]}
                </th>
                <td style={cellStyle}>{ligne[1]}</td>
                <td style={cellStyle}>{ligne[2]}</td>
                <td style={cellStyle}>{ligne[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fiches : téléphone */}
      <div className="md:hidden" style={{ marginTop: 32 }}>
        {LIGNES.map((ligne) => (
          <div
            key={ligne[0]}
            style={{
              border: `1px solid ${colors.line}`,
              background: colors.surface,
              borderRadius: 14,
              padding: "16px 16px 4px",
              marginBottom: 14,
            }}
          >
            <p style={{ ...pStyle, color: colors.heading, fontWeight: 600, marginBottom: 10 }}>
              {ligne[0]}
            </p>
            <dl style={{ margin: 0 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <dt
                    style={{
                      ...pStyle,
                      fontSize: "0.875rem",
                      color: colors.muted,
                      margin: 0,
                    }}
                  >
                    {COLONNES[i]}
                  </dt>
                  <dd style={{ ...pStyle, fontSize: "1rem", margin: 0 }}>
                    {ligne[i]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <Para titre="Le paiement">
        {
          "Il passe par Stripe, un prestataire de paiement sécurisé, qui traite ta carte selon ses propres règles de confidentialité. Je ne vois jamais ta carte bancaire. Les informations de ton inscription sont enregistrées avec ton paiement, chez Stripe. Je n'utilise aucune autre base de données pour le Cercle."
        }
      </Para>

      <Para titre="Qui a accès à tes données">
        {
          "Moi seule. Elles transitent aussi par les outils qui font fonctionner le Cercle : Stripe pour l'inscription et le paiement, Zoom pour les rencontres, Vercel pour l'hébergement du site, Resend pour l'envoi des emails automatiques, et IONOS pour ma messagerie professionnelle. Zoom, Vercel et Resend sont des sociétés américaines : les transferts vers les États-Unis sont encadrés par les garanties prévues par le règlement européen. En cas d'urgence pendant une rencontre, ton numéro et ta commune peuvent être transmis aux secours, ou à la personne de confiance qui les appelle à ma place. En dehors de ce cas, tes données ne sont jamais vendues, louées, ni partagées avec qui que ce soit d'autre."
        }
      </Para>

      <Para titre="Pas de mélange">
        {
          "Les données du Cercle ne servent qu'au Cercle. Elles ne sont jamais utilisées pour l'application TRACÉA, même si le paiement passe par le même compte Stripe. Les pages du Cercle ne contiennent aucun outil de mesure d'audience ni aucun traceur, et n'utilisent aucun cookie. Je ne t'enverrai aucune publicité, et je ne t'ajouterai à aucune liste sans que tu l'aies demandé."
        }
      </Para>

      <Para titre="Tes droits">
        {
          "Tu peux à tout moment consulter tes données, les corriger, demander leur effacement, retirer ton consentement ou t'opposer à leur usage. Il suffit de m'écrire à "
        }
        {mail}
        {
          ". Je te réponds dans un délai d'un mois au plus. Si tu retires ton consentement pour le téléphone et la commune avant le cycle, je ne pourrai plus garantir ta sécurité en cas d'urgence : on en parlera ensemble."
        }
      </Para>

      <Para titre="Si ma réponse ne te convient pas">
        {"Tu peux adresser une réclamation à la CNIL, sur "}
        <a
          href="https://www.cnil.fr"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          cnil.fr
        </a>
        {"."}
      </Para>
    </div>
    </>
  );
}
