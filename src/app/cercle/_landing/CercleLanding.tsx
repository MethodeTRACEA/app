import type { CSSProperties } from "react";
import { CercleForm } from "../CercleForm";
import { h2Style } from "../_ui";
import type { EtatInscription } from "./etat";
import { Mouvement } from "./Mouvement";
import { CercleDeDouze, GrandVerre, PhotoAnimatrice } from "./visuels";

// ===================================================================
// Le Cercle TRACÉA en ligne — page de présentation (/cercle).
//
// Version « aube » retenue par Alyson le 13/10/2026 (palette claire,
// cercle.css). Textes d'Alyson mot pour mot. Libellés courts validés :
// repères (dont « dès le 17 novembre »), « En bref », étiquettes
// Écouter/Écrire/Parler/Partager, numéros, titres « Le soir » /
// « En journée », texte de la carte prix.
// Volontairement absents : compte à rebours, message d'urgence,
// compteur de places restantes.
// ===================================================================

const REPERES = [
  "4 rencontres",
  "dès le 17 novembre",
  "en direct sur Zoom",
  "12 €",
  "12 personnes au plus",
];

const PAROLES = [
  "Je réagis plus fort que je ne voudrais.",
  "Je sens que ça monte, mais je ne sais pas quoi faire.",
  "Après, je ne me reconnais plus.",
];

const RENCONTRES: { titre: string; texte: string }[] = [
  { titre: "Quand ça se remplit", texte: "Ce qui s'accumule sans qu'on le voie." },
  { titre: "La dernière goutte", texte: "Ce qui se passe juste avant." },
  { titre: "L'après-coup", texte: "Ce qui reste quand la vague est passée." },
  { titre: "Revenir à soi", texte: "Ce qui nous ramène, même un peu." },
];

const PARTICIPER: { etiquette: string; texte: string }[] = [
  { etiquette: "Écouter", texte: "Tu peux juste écouter." },
  { etiquette: "Écrire", texte: "Écrire dans le chat." },
  { etiquette: "Parler", texte: "Parler au micro." },
  {
    etiquette: "Partager",
    texte:
      "Ou proposer de partager un moment de ton histoire, que nous préparerons ensemble avant.",
  },
];

const CADRE = [
  "Les rencontres ne sont pas enregistrées.",
  "Chaque personne s'engage à garder pour elle ce qu'elle entend, et à ne rien filmer ni photographier.",
  "Le groupe reste petit, douze personnes au plus, pour que chaque personne ait sa place.",
  "Les numéros d'aide restent à portée de main, pour que personne ne reste seul si quelque chose devient trop lourd.",
];

const CRENEAUX_CARTES = [
  {
    titre: "Le soir",
    jours: "Les vendredis 20 et 27 novembre, 4 et 11 décembre,",
    heures: "de 21 h à 22 h 30.",
  },
  {
    titre: "En journée",
    jours: "Les mardis 17 et 24 novembre, 1er et 8 décembre,",
    heures: "de 14 h à 15 h 30.",
  },
];

const APRES = [
  "Tu reçois un email de confirmation.",
  "Le 13 novembre, je te confirme ton créneau.",
  "La veille de chaque rencontre, tu reçois le lien Zoom.",
  "Le jour venu, tu arrives comme tu es, caméra allumée ou non.",
];

const QUESTIONS: { q: string; r: string }[] = [
  {
    q: "Je n'ose pas parler devant d'autres.",
    r: "Tu n'as pas à le faire. Tu peux écouter toute la rencontre, écrire seulement dans le chat, garder ta caméra éteinte. Ta place est la même.",
  },
  {
    q: "Est-ce une thérapie ?",
    r: "Non. C'est un espace de parole entre pairs. Il ne remplace pas un suivi médical ou psychologique, il se tient à côté.",
  },
  {
    q: "Et si je rate une rencontre ?",
    r: "Chaque rencontre se suffit à elle-même. La suivante t'accueille comme si c'était la première.",
  },
  {
    q: "Qui saura que j'étais là ?",
    r: "Tu peux utiliser un pseudonyme. Les rencontres ne sont pas enregistrées, et chaque personne s'engage à garder pour elle ce qu'elle entend.",
  },
  {
    q: "Et si ça me remue trop pendant la rencontre ?",
    r: "Tu peux couper ta caméra, faire une pause, ou m'écrire en privé : je te proposerai un moment à part. Les numéros d'aide restent épinglés dans le chat.",
  },
  {
    q: "Pourquoi 12 € ?",
    r: "C'est un tarif pilote, pour ce premier cycle qu'on construit ensemble. Si ton groupe n'a pas lieu, je te rembourse entièrement.",
  },
  {
    q: "Comment savoir si c'est pour moi ?",
    r: "Si ces moments te parlent, si tu as envie d'en parler, ou juste d'écouter d'autres qui les vivent, ta place est ici. Et si ce n'est pas le bon moment, d'autres cycles suivront.",
  },
];

function Trait() {
  return <span aria-hidden="true" className="cl-trait" />;
}

// Bouton supplémentaire vers le formulaire, sur ordinateur seulement.
function BoutonOrdi() {
  return (
    <div className="cl-cta-ordi">
      <a href="#inscription" className="cl-cta">
        {"Je m'inscris au Cercle"}
      </a>
    </div>
  );
}

export function CercleLanding({ etat }: { etat: EtatInscription }) {
  return (
    <div id="cercle-racine" className="cl-landing">
      {/* ═══ Premier écran ═══════════════════════════════════════ */}
      <section id="cercle-hero" className="cl-hero" aria-labelledby="cercle-h1">
        <div className="cl-wrap">
          <p className="cl-eyebrow">{"Le Cercle TRACÉA"}</p>
          <h1 id="cercle-h1" className="cl-h1">
            {"Quand ça déborde"}
          </h1>
          <p className="cl-accroche">
            {"Parce que personne ne devrait rester seul avec ce qui déborde."}
          </p>
          <ul className="cl-reperes" aria-label="En bref">
            {REPERES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <a href="#inscription" className="cl-cta">
            {"Je m'inscris au Cercle"}
          </a>
        </div>
        <span className="cl-cue" aria-hidden="true" />
      </section>

      {/* ═══ Ouverture : texte + cercle de douze ═════════════════ */}
      <div className="cl-band cl-band--alt">
        <div className="cl-wrap">
          <div className="cl-split">
            <p
              className="cl-lead"
              data-reveal
              style={{ margin: 0, fontSize: "clamp(1.3rem, 2.8vw, 1.75rem)", lineHeight: 1.5 }}
            >
              {
                "Tu connais peut-être ces moments. Tout monte d'un coup. La réaction dépasse ce que tu voudrais. Et après, il reste la honte, la fatigue, et cette impression que personne d'autre ne vit ça."
              }
            </p>
            <div data-reveal>
              <CercleDeDouze />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Paroles, puis moment fort ═══════════════════════════ */}
      <div className="cl-band cl-band--deep cl-band--statement">
        <div className="cl-wrap">
          <ul className="cl-paroles">
            {PAROLES.map((p, i) => (
              <li key={p} data-reveal style={{ "--d": i } as CSSProperties}>
                {`« ${p} »`}
              </li>
            ))}
          </ul>
          <p className="cl-statement" data-reveal>
            {"D'autres le vivent aussi."}
          </p>
        </div>
      </div>

      {/* ═══ Le Cercle : une colonne centrée ═════════════════════ */}
      <div className="cl-band">
        <div className="cl-wrap">
          <div className="cl-centre">
            <p className="cl-lead" data-reveal style={{ margin: 0 }}>
              {
                "Le Cercle, c'est quatre rencontres en direct sur Zoom, pour en parler avec d'autres qui le vivent aussi. On y met des mots sur ce qui s'accumule, ce qui déclenche, ce qui reste après. Et on regarde ensemble ce qui aide, même un peu, à revenir à soi."
              }
            </p>
            <p className="cl-retrait" data-reveal>
              {
                "Pour certaines personnes, ce moment s'accompagne d'une envie de fuir, par un verre, un écran, la nourriture… Elles ont aussi toute leur place ici."
              }
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Les quatre rencontres : frise du verre ══════════════ */}
      <section className="cl-band cl-band--alt" aria-labelledby="rencontres-titre">
        <div className="cl-wrap">
          <div data-reveal>
            <Trait />
            <h2 id="rencontres-titre" className="cl-h2">
              {"Les quatre rencontres"}
            </h2>
            <p className="cl-lead">{"Chaque rencontre suit un moment du débordement."}</p>
          </div>

          <ol className="cl-frise" data-reveal>
            {RENCONTRES.map((r, i) => (
              <li key={r.titre} className="cl-etape">
                <GrandVerre etape={(i + 1) as 1 | 2 | 3 | 4} />
                <div>
                  <p className="cl-num">{i + 1}</p>
                  <h3 className="cl-h3">{r.titre}</h3>
                  <p className="cl-p">{r.texte}</p>
                </div>
              </li>
            ))}
          </ol>

          <p
            className="cl-accent"
            data-reveal
            style={{ textAlign: "center", maxWidth: 640, margin: "0 auto", textWrap: "balance" }}
          >
            {
              "Chaque rencontre se suffit à elle-même. Si tu en manques une, la suivante t'accueille comme si c'était la première."
            }
          </p>

          <BoutonOrdi />

          {/* Un cadre reconnu (texte d'Alyson, mot pour mot) */}
          <section className="cl-aside" aria-labelledby="cadre-reconnu-titre" data-reveal>
            <div className="cl-split cl-split--title">
              <h2 id="cadre-reconnu-titre" className="cl-h2 cl-h2--sm">
                {"Un cadre reconnu"}
              </h2>
              <div>
                <p className="cl-lead">
                  {
                    "Le Cercle s'inscrit dans ce que Santé publique France appelle les compétences psychosociales. Parmi elles, les compétences émotionnelles : reconnaître ce qu'on ressent, repérer son stress, trouver ce qui aide à le traverser. Elles comptent pour la santé mentale de chacun, et elles se travaillent à tout âge."
                  }
                </p>
                <p className="cl-lead" style={{ margin: 0 }}>
                  {
                    "Chaque rencontre les explore à sa façon, en partant de ce que chacun vit. Sans rien promettre : en s'y exerçant ensemble, simplement."
                  }
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* ═══ Comment ça se passe : cartes compactes ══════════════ */}
      <section className="cl-band" aria-labelledby="deroulement-titre">
        <div className="cl-wrap">
          <div data-reveal style={{ maxWidth: 820 }}>
            <Trait />
            <h2 id="deroulement-titre" className="cl-h2">
              {"Comment ça se passe"}
            </h2>
            <p className="cl-lead">
              {
                "On arrive avec un mot, ou en silence. On écoute. On parle de soi, en « je », sans conseil et sans jugement. On prend un petit moment pour le corps, les yeux ouverts, rien à réussir. Puis on cherche ensemble ce dont on aurait eu besoin."
              }
            </p>
          </div>

          <ul className="cl-grid4" data-reveal>
            {PARTICIPER.map((p) => (
              <li key={p.etiquette} className="cl-card">
                <p className="cl-etiquette">{p.etiquette}</p>
                <p className="cl-p">{p.texte}</p>
              </li>
            ))}
          </ul>

          <p className="cl-p" data-reveal style={{ maxWidth: 820, margin: 0 }}>
            {
              "Tu choisis ta place, et tu peux en changer chaque semaine. Ta caméra peut rester éteinte du début à la fin."
            }
          </p>
        </div>
      </section>

      {/* ═══ Un espace fermé, et tenu : titre + filets ═══════════ */}
      <section className="cl-band cl-band--tint" aria-labelledby="cadre-titre">
        <div className="cl-wrap">
          <div className="cl-split cl-split--title">
            <div data-reveal>
              <Trait />
              <h2 id="cadre-titre" className="cl-h2" style={{ margin: 0 }}>
                {"Un espace fermé, et tenu"}
              </h2>
            </div>
            <ul className="cl-filets" data-reveal>
              {CADRE.map((phrase) => (
                <li key={phrase}>
                  <p className="cl-p">{phrase}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ Qui anime : photo + texte ═══════════════════════════ */}
      <section className="cl-band cl-band--alt" aria-labelledby="animation-titre">
        <div className="cl-wrap">
          <div className="cl-split cl-split--reverse">
            <div data-reveal>
              <PhotoAnimatrice />
            </div>
            <div data-reveal>
              <Trait />
              <h2 id="animation-titre" className="cl-h2">
                {"Qui anime"}
              </h2>
              <p className="cl-lead" style={{ margin: 0 }}>
                {
                  "Je m'appelle Alyson. Je ne suis pas thérapeute. J'anime à partir de ce que j'ai vécu, et de ce que j'ai appris en chemin sur le débordement. Ancienne aide-soignante, j'ai aussi participé pendant plus d'un an à des groupes d'entraide entre pairs, où j'ai "
                }
                {/* « co-animé » ne se coupe pas au trait d'union */}
                <span style={{ whiteSpace: "nowrap" }}>{"co-animé"}</span>
                {" des réunions. Ce Cercle est une phase pilote : on le construit ensemble."}
              </p>
            </div>
          </div>
          <BoutonOrdi />
        </div>
      </section>

      {/* ═══ Encadré doux ════════════════════════════════════════ */}
      <div className="cl-band">
        <div className="cl-wrap">
          <div className="cl-doux cl-narrow" data-reveal>
            <section aria-labelledby="nest-pas-titre">
              <h2 id="nest-pas-titre" className="cl-h2 cl-h2--sm">
                {"Ce que le Cercle n'est pas"}
              </h2>
              <p className="cl-p" style={{ margin: 0 }}>
                {
                  "Ce n'est ni une thérapie, ni un groupe de soins, ni du coaching. Il ne remplace pas un suivi médical, psychologique ou en addictologie, ni un groupe d'entraide. Il se tient à côté."
                }
              </p>
            </section>
            <hr />
            <section aria-labelledby="moment-titre">
              <h2 id="moment-titre" className="cl-h2 cl-h2--sm">
                {"Ce n'est peut-être pas le bon moment"}
              </h2>
              <p className="cl-p" style={{ margin: 0 }}>
                {
                  "Si tu traverses en ce moment des idées suicidaires, si tu sors d'une hospitalisation, ou si tu vis une situation de violence sans accompagnement, ta place reste ici pour un prochain cycle. Aujourd'hui, tu peux appeler le "
                }
                <a href="tel:3114" className="cl-tel-grand">
                  3114
                </a>
                {", jour et nuit, pour toi ou pour un proche."}
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* ═══ Dates et tarif + après l'inscription + formulaire ═══ */}
      <section className="cl-band cl-band--alt" aria-labelledby="dates-titre">
        <div className="cl-wrap">
          <div data-reveal>
            <Trait />
            <h2 id="dates-titre" className="cl-h2">
              {"Dates et tarif"}
            </h2>
            <p className="cl-lead">{"Deux créneaux, au choix."}</p>
          </div>

          <ul className="cl-creneaux" data-reveal>
            {CRENEAUX_CARTES.map((c) => (
              <li key={c.titre} className="cl-card">
                <h3 className="cl-h3" style={{ fontSize: "1.75rem", marginBottom: 12 }}>
                  {c.titre}
                </h3>
                <p className="cl-p" style={{ margin: "0 0 4px" }}>
                  {c.jours}
                </p>
                <p className="cl-p cl-heures" style={{ margin: 0 }}>
                  {c.heures}
                </p>
              </li>
            ))}
            <li className="cl-card cl-carte-prix">
              <p className="cl-prix" style={{ margin: 0 }}>
                {"12 €"}
              </p>
              <p className="cl-p">{"les quatre rencontres · tarif pilote"}</p>
            </li>
          </ul>

          <div data-reveal style={{ maxWidth: 820, marginBottom: 72 }}>
            <p className="cl-lead" style={{ fontWeight: 600, color: "var(--c-title)", margin: "0 0 10px" }}>
              {"Inscriptions ouvertes jusqu'au 13 novembre."}
            </p>
            <p className="cl-p" style={{ margin: 0 }}>
              {
                "Chaque groupe a besoin d'au moins quatre personnes pour exister. Si ton créneau n'en réunit pas assez, je te propose l'autre, ou je te rembourse entièrement."
              }
            </p>
          </div>

          {/* Après ton inscription : frise en quatre temps */}
          <section className="cl-apres" aria-labelledby="apres-titre" data-reveal>
            <h3 id="apres-titre" className="cl-h3" style={{ fontSize: "clamp(1.5rem, 3.4vw, 2rem)" }}>
              {"Après ton inscription"}
            </h3>
            <ol>
              {APRES.map((etape, i) => (
                <li key={etape}>
                  <span className="cl-pastille" aria-hidden="true">
                    {i + 1}
                  </span>
                  <p className="cl-p">{etape}</p>
                </li>
              ))}
            </ol>
          </section>

          <section
            id="inscription"
            className="cl-form-card"
            aria-labelledby="inscription-titre"
            tabIndex={-1}
            style={{ textAlign: etat.type === "ouvert" ? "left" : "center" }}
          >
            {etat.type === "ouvert" ? (
              <CercleForm places={etat.places} />
            ) : etat.type === "clos" ? (
              <h2 id="inscription-titre" style={{ ...h2Style, margin: 0 }}>
                {"Les inscriptions sont closes. Le prochain cycle sera annoncé ici."}
              </h2>
            ) : (
              <h2 id="inscription-titre" style={{ ...h2Style, margin: 0 }}>
                {"Inscription bientôt disponible"}
              </h2>
            )}
          </section>
        </div>
      </section>

      {/* ═══ Tes questions ═══════════════════════════════════════ */}
      <section className="cl-band" aria-labelledby="questions-titre">
        <div className="cl-wrap">
          <div className="cl-faq">
            <div data-reveal>
              <Trait />
              <h2 id="questions-titre" className="cl-h2">
                {"Tes questions"}
              </h2>
            </div>
            <div data-reveal>
              {QUESTIONS.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p className="cl-p">{item.r}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Numéros d'aide ══════════════════════════════════════ */}
      <div className="cl-band" style={{ paddingTop: 72, paddingBottom: 72, borderTop: "1px solid var(--c-line)" }}>
        <div className="cl-wrap">
          <div style={{ maxWidth: 760 }}>
            <p id="aide-titre" className="cl-p" style={{ color: "var(--c-heading)", fontWeight: 600 }}>
              {"Si ça devient trop lourd, aujourd'hui ou plus tard :"}
            </p>
            <ul className="cl-p" aria-labelledby="aide-titre" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <a href="tel:3114" className="cl-link">3114</a>
                {", prévention du suicide, 24 h/24"}
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="tel:15" className="cl-link">15</a>
                {" ou "}
                <a href="tel:112" className="cl-link">112</a>
                {", urgence"}
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="tel:3919" className="cl-link">3919</a>
                {", violences faites aux femmes"}
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="tel:+33972394050" className="cl-link">09 72 39 40 50</a>
                {", SOS Amitié"}
              </li>
              <li>
                <a href="tel:+33980980930" className="cl-link">0 980 980 930</a>
                {", Alcool Info Service."}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Mouvement
        racineId="cercle-racine"
        heroId="cercle-hero"
        formId="inscription"
        barre={etat.type !== "clos"}
      />
    </div>
  );
}
