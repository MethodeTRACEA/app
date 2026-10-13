import type { Metadata } from "next";
import { Section, containerStyle, h1Style, linkStyle, pStyle } from "../_ui";

// Le Cercle TRACÉA en ligne — conditions d'inscription.
// Texte repris mot pour mot du document du 13 oct. 2026 (bloc « Les
// conditions d'inscription »). Les intitulés en début de paragraphe
// deviennent des titres de section, sans leur point final.
export const metadata: Metadata = {
  title: "Conditions d'inscription · Le Cercle TRACÉA en ligne",
  description:
    "Les conditions d'inscription au Cercle TRACÉA en ligne : créneaux, tarif, rétractation, remboursements.",
};

const EMAIL = "cercledeparole@methodetracea.fr";

export default function CercleConditionsPage() {
  return (
    <div style={containerStyle}>
      <h1 style={h1Style}>{"Les conditions d'inscription"}</h1>

      <Section id="qui" title="Qui peut s'inscrire">
        <p style={pStyle}>
          {
            "Le Cercle est ouvert à toute personne de 18 ans et plus. Chaque groupe accueille douze personnes au plus. Pour protéger chacun, les messages privés entre participants sont désactivés sur Zoom, et ce qui touche à des violences est accueilli en privé, après la rencontre, jamais devant le groupe."
          }
        </p>
      </Section>

      <Section id="creneaux" title="Les créneaux">
        <p style={pStyle}>
          {
            "Deux créneaux sont proposés : le vendredi de 21 h à 22 h 30, et le mardi de 14 h à 15 h 30, du 17 novembre au 11 décembre 2026. Chaque créneau a lieu s'il réunit au moins quatre personnes inscrites au 13 novembre 2026. Ce jour-là, je confirme à chaque personne son créneau par email."
          }
        </p>
      </Section>

      <Section id="tarif" title="Le tarif et le paiement">
        <p style={pStyle}>
          {
            "L'inscription coûte 12 € pour les quatre rencontres. C'est un tarif pilote, propre à ce premier cycle. TVA non applicable, article 293 B du CGI. Le paiement se fait en une fois, en ligne, par Stripe. Je ne vois jamais tes coordonnées bancaires. Un email de confirmation t'est envoyé, avec ces conditions et le formulaire de rétractation."
          }
        </p>
      </Section>

      <Section id="retractation" title="Ton droit de rétractation">
        <p style={pStyle}>
          {
            "Tu as quatorze jours après ton inscription pour changer d'avis, sans avoir à te justifier. Il suffit de cliquer sur « "
          }
          <a href="/cercle/renoncer" style={linkStyle}>
            {"Renoncer au contrat ici"}
          </a>
          {
            " », en bas de la page du Cercle, ou de m'écrire. Je te rembourse sous quatorze jours, par le même moyen de paiement."
          }
        </p>
        <p style={pStyle}>
          {
            "Le Cercle peut commencer avant la fin de ces quatorze jours. Dans ce cas, le formulaire te demande ton accord. Si tu te rétractes alors que le Cercle a déjà commencé, je te rembourse les rencontres qui restent : 3 € par rencontre."
          }
        </p>
        <p style={pStyle}>
          {
            "Une absence n'est pas une rétractation. Si tu ne viens pas à une rencontre sans m'avoir écrit, elle n'est pas remboursée."
          }
        </p>
      </Section>

      <Section id="remboursements" title="Les autres remboursements">
        <p style={pStyle}>
          {
            "Je te rembourse entièrement si ton créneau n'a pas lieu et que l'autre ne te convient pas, ou si j'annule le cycle. Après la fin de ton délai de rétractation, l'inscription n'est plus remboursée, sauf situation particulière : écris-moi, on en parlera."
          }
        </p>
      </Section>

      <Section id="report" title="Si une rencontre est reportée">
        <p style={pStyle}>
          {
            "En cas d'imprévu de mon côté, la rencontre est reportée à la semaine suivante, et je te préviens par email au plus vite. Si la nouvelle date ne te convient pas, je te rembourse cette rencontre."
          }
        </p>
      </Section>

      <Section id="engagement" title="Ton engagement">
        <p style={pStyle}>
          {
            "En t'inscrivant, tu t'engages à garder pour toi ce que tu entends, à ne rien enregistrer, filmer ni photographier, et à parler de toi plutôt que des autres. Si cet engagement n'est pas respecté, je peux mettre fin à la participation d'une personne, pour protéger le groupe. Les rencontres restantes lui sont alors remboursées."
          }
        </p>
      </Section>

      <Section id="nest-pas" title="Ce que le Cercle n'est pas">
        <p style={pStyle}>
          {
            "Le Cercle est un espace de parole entre pairs. Ce n'est ni une thérapie, ni un soin, ni du coaching. Il ne remplace pas un suivi médical, psychologique, en addictologie ou juridique. Je m'engage à tenir le cadre décrit sur cette page. Je ne promets aucun effet."
          }
        </p>
      </Section>

      <Section id="desaccord" title="En cas de désaccord">
        <p style={pStyle}>
          {
            "Écris-moi d'abord, on cherchera ensemble une solution. Si elle ne vient pas, tu peux saisir gratuitement le médiateur de la consommation : CM2C, 49 rue de Ponthieu, 75008 Paris, "
          }
          <a
            href="https://www.cm2c.net"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            www.cm2c.net
          </a>
          {", 01 89 47 00 14."}
        </p>
      </Section>

      <Section id="vendeur" title="Qui vend">
        <p style={pStyle}>
          {
            "Alyson Sire EI, entrepreneuse individuelle · SIRET 512 468 174 00036 · 57 chemin des Marronniers, 81630 Salvagnac · "
          }
          <a href={`mailto:${EMAIL}`} style={linkStyle}>
            {EMAIL}
          </a>
        </p>
      </Section>
    </div>
  );
}
