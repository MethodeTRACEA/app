import type { Metadata } from "next";
import type { CSSProperties } from "react";
import {
  Section,
  colors,
  containerStyle,
  h1Style,
  h2Style,
  linkStyle,
  listStyle,
  pStyle,
} from "./_ui";

// Le Cercle TRACÉA en ligne — page de présentation.
// Texte repris mot pour mot du document « Page d'inscription · Le Cercle
// TRACÉA en ligne » (13 oct. 2026). Étape 1 : pas encore d'inscription,
// le bouton mène à la zone « Inscription bientôt disponible ».
export const metadata: Metadata = {
  title: "Le Cercle TRACÉA · Quand ça déborde",
  description:
    "Parce que personne ne devrait rester seul avec ce qui déborde.",
};

const btnStyle: CSSProperties = {
  display: "inline-block",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "1.0625rem",
  fontWeight: 600,
  color: "#1A120D",
  background:
    "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
  borderRadius: 40,
  padding: "15px 30px",
  textDecoration: "none",
  textAlign: "center",
};

export default function CerclePage() {
  return (
    <div style={containerStyle}>
      {/* Titre */}
      <header>
        <h1 style={h1Style}>{"Le Cercle TRACÉA · Quand ça déborde"}</h1>
        <p
          style={{
            ...pStyle,
            fontSize: "1.1875rem",
            color: colors.heading,
            margin: "18px 0 0",
          }}
        >
          {"Parce que personne ne devrait rester seul avec ce qui déborde."}
        </p>
      </header>

      {/* Ouverture */}
      <div style={{ marginTop: 40 }}>
        <p style={pStyle}>
          {
            "Tu connais peut-être ces moments. Tout monte d'un coup. La réaction dépasse ce que tu voudrais. Et après, il reste la honte, la fatigue, et cette impression que personne d'autre ne vit ça."
          }
        </p>
        <p style={{ ...pStyle, color: colors.heading, fontWeight: 500 }}>
          {"D'autres le vivent aussi."}
        </p>
        <p style={pStyle}>
          {
            "Le Cercle, c'est quatre rencontres en direct sur Zoom, pour en parler avec d'autres qui le vivent aussi. On y met des mots sur ce qui s'accumule, ce qui déclenche, ce qui reste après. Et on regarde ensemble ce qui aide, même un peu, à revenir à soi."
          }
        </p>
        <p style={pStyle}>
          {
            "Pour certaines personnes, ce moment s'accompagne d'une envie de fuir, par un verre, un écran, la nourriture… Elles ont aussi toute leur place ici."
          }
        </p>
      </div>

      <Section id="rencontres" title="Les quatre rencontres">
        <p style={pStyle}>
          {"Chaque rencontre suit un moment du débordement."}
        </p>
        <ul style={listStyle}>
          <li style={{ marginBottom: 6 }}>
            {"Quand ça se remplit : ce qui s'accumule sans qu'on le voie."}
          </li>
          <li style={{ marginBottom: 6 }}>
            {"La dernière goutte : ce qui se passe juste avant."}
          </li>
          <li style={{ marginBottom: 6 }}>
            {"L'après-coup : ce qui reste quand la vague est passée."}
          </li>
          <li>{"Revenir à soi : ce qui nous ramène, même un peu."}</li>
        </ul>
        <p style={pStyle}>
          {
            "Chaque rencontre se suffit à elle-même. Si tu en manques une, la suivante t'accueille comme si c'était la première."
          }
        </p>
      </Section>

      <Section id="deroulement" title="Comment ça se passe">
        <p style={pStyle}>
          {
            "On arrive avec un mot, ou en silence. On écoute. On parle de soi, en « je », sans conseil et sans jugement. On prend un petit moment pour le corps, les yeux ouverts, rien à réussir. Puis on cherche ensemble ce dont on aurait eu besoin."
          }
        </p>
        <p style={pStyle}>
          {
            "Tu peux juste écouter. Écrire dans le chat. Parler au micro. Ou proposer de partager un moment de ton histoire, que nous préparerons ensemble avant. Tu choisis ta place, et tu peux en changer chaque semaine. Ta caméra peut rester éteinte du début à la fin."
          }
        </p>
      </Section>

      <Section id="cadre" title="Un espace fermé, et tenu">
        <p style={pStyle}>
          {
            "Les rencontres ne sont pas enregistrées. Chaque personne s'engage à garder pour elle ce qu'elle entend, et à ne rien filmer ni photographier. Le groupe reste petit, douze personnes au plus, pour que chaque personne ait sa place. Les numéros d'aide restent à portée de main, pour que personne ne reste seul si quelque chose devient trop lourd."
          }
        </p>
      </Section>

      <Section id="animation" title="Qui anime">
        <p style={pStyle}>
          {
            "Je m'appelle Alyson. Je ne suis pas thérapeute. J'anime à partir de ce que j'ai vécu, et de ce que j'ai appris en chemin sur le débordement. Ancienne aide-soignante, j'ai aussi participé pendant plus d'un an à des groupes d'entraide entre pairs, où j'ai animé des réunions. Ce Cercle est une phase pilote : on le construit ensemble."
          }
        </p>
      </Section>

      <Section id="nest-pas" title="Ce que le Cercle n'est pas">
        <p style={pStyle}>
          {
            "Ce n'est ni une thérapie, ni un groupe de soins, ni du coaching. Il ne remplace pas un suivi médical, psychologique ou en addictologie, ni un groupe d'entraide. Il se tient à côté."
          }
        </p>
      </Section>

      <Section id="moment" title="Ce n'est peut-être pas le bon moment">
        <p style={pStyle}>
          {
            "Si tu traverses en ce moment des idées suicidaires, si tu sors d'une hospitalisation, ou si tu vis une situation de violence sans accompagnement, ta place reste ici pour un prochain cycle. Aujourd'hui, tu peux appeler le "
          }
          <a href="tel:3114" style={linkStyle}>
            3114
          </a>
          {", jour et nuit, pour toi ou pour un proche."}
        </p>
      </Section>

      <Section id="dates" title="Dates et tarif">
        <p style={pStyle}>{"Deux créneaux, au choix."}</p>
        <ul style={listStyle}>
          <li style={{ marginBottom: 6 }}>
            {
              "Le soir : les vendredis 20 et 27 novembre, 4 et 11 décembre, de 21 h à 22 h 30."
            }
          </li>
          <li>
            {
              "En journée : les mardis 17 et 24 novembre, 1er et 8 décembre, de 14 h à 15 h 30."
            }
          </li>
        </ul>
        <p style={pStyle}>
          {
            "En direct sur Zoom. 12 € les quatre rencontres, en tarif pilote pour ce premier cycle."
          }
        </p>
        <p style={pStyle}>
          {
            "Inscriptions ouvertes jusqu'au 13 novembre. Chaque groupe a besoin d'au moins quatre personnes pour exister. Si ton créneau n'en réunit pas assez, je te propose l'autre, ou je te rembourse entièrement."
          }
        </p>
      </Section>

      {/* Bouton */}
      <div style={{ marginTop: 36, textAlign: "center" }}>
        <a href="#inscription" style={btnStyle}>
          {"Je m'inscris au Cercle"}
        </a>
      </div>

      {/* Zone d'inscription : provisoire (étape 1) */}
      <section
        id="inscription"
        aria-labelledby="inscription-titre"
        tabIndex={-1}
        style={{
          marginTop: 48,
          padding: "28px 22px",
          borderRadius: 18,
          border: `1px solid ${colors.line}`,
          background: colors.surface,
          textAlign: "center",
          scrollMarginTop: 24,
        }}
      >
        <h2 id="inscription-titre" style={{ ...h2Style, margin: 0 }}>
          {"Inscription bientôt disponible"}
        </h2>
      </section>

      {/* Pied de page : numéros d'aide */}
      <aside
        aria-labelledby="aide-titre"
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: `1px solid ${colors.line}`,
        }}
      >
        <p id="aide-titre" style={{ ...pStyle, color: colors.heading }}>
          {"Si ça devient trop lourd, aujourd'hui ou plus tard :"}
        </p>
        <ul style={{ ...listStyle, listStyle: "none", paddingLeft: 0 }}>
          <li style={{ marginBottom: 6 }}>
            <a href="tel:3114" style={linkStyle}>
              3114
            </a>
            {", prévention du suicide, 24 h/24"}
          </li>
          <li style={{ marginBottom: 6 }}>
            <a href="tel:15" style={linkStyle}>
              15
            </a>
            {" ou "}
            <a href="tel:112" style={linkStyle}>
              112
            </a>
            {", urgence"}
          </li>
          <li style={{ marginBottom: 6 }}>
            <a href="tel:3919" style={linkStyle}>
              3919
            </a>
            {", violences faites aux femmes"}
          </li>
          <li style={{ marginBottom: 6 }}>
            <a href="tel:+33972394050" style={linkStyle}>
              09 72 39 40 50
            </a>
            {", SOS Amitié"}
          </li>
          <li>
            <a href="tel:+33980980930" style={linkStyle}>
              0 980 980 930
            </a>
            {", Alcool Info Service."}
          </li>
        </ul>
      </aside>
    </div>
  );
}
