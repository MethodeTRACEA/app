import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import {
  Band,
  CercleLogo,
  FONT_CHIFFRE,
  FONT_SANS,
  SectionTitle,
  accentStyle,
  cardStyle,
  colors,
  containerStyle,
  ctaStyle,
  h1Style,
  h2Style,
  h3Style,
  linkStyle,
  pStyle,
  smallCardStyle,
} from "./_ui";
import { CercleForm } from "./CercleForm";
import { Verre } from "./Verre";
import {
  TOUTES_PLACES_LIBRES,
  inscriptionsCloses,
  type PlacesState,
} from "@/lib/cercle/config";
import { compterPlaces, getCercleStripe } from "@/lib/cercle/stripe";

// Le Cercle TRACÉA en ligne — page de présentation.
// Texte repris mot pour mot du document « Page d'inscription · Le Cercle
// TRACÉA en ligne » (13 oct. 2026) ; seule la présentation est travaillée
// (style de l'accueil, sections alternées, cartes). Courts libellés
// ajoutés, soumis à la validation d'Alyson : repères du haut, étiquettes des façons
// de participer, titres des cartes de créneaux.
// La zone d'inscription affiche le formulaire (étape 2), « bientôt
// disponible » tant que CERCLE_INSCRIPTIONS_ACTIVES n'est pas posé, ou
// « closes » après le 13 novembre 2026 à 23 h 59 (Paris).
export const metadata: Metadata = {
  title: "Le Cercle TRACÉA · Quand ça déborde",
  description:
    "Parce que personne ne devrait rester seul avec ce qui déborde.",
};

// Page calculée à chaque visite : date de clôture et places restantes.
export const dynamic = "force-dynamic";

type EtatInscription =
  | { type: "bientot" }
  | { type: "clos" }
  | { type: "ouvert"; places: PlacesState };

async function lireEtatInscription(): Promise<EtatInscription> {
  if (inscriptionsCloses()) return { type: "clos" };
  const cs = getCercleStripe();
  if (!cs.ok) return { type: "bientot" };
  try {
    return { type: "ouvert", places: await compterPlaces(cs.stripe) };
  } catch (err) {
    // Stripe injoignable : on affiche le formulaire, le serveur
    // revérifiera les places au moment de « Valider et payer ».
    console.error(
      "[CERCLE] Comptage des places impossible:",
      err instanceof Error ? err.message : String(err)
    );
    return { type: "ouvert", places: TOUTES_PLACES_LIBRES };
  }
}

// ── Contenus ─────────────────────────────────────────────────────────

const REPERES = [
  "4 rencontres",
  "en direct sur Zoom",
  "12 €",
  "12 personnes au plus",
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

// ── Petits éléments de mise en page ─────────────────────────────────

const etiquetteStyle: CSSProperties = {
  fontFamily: FONT_SANS,
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: colors.terra,
  margin: "0 0 8px",
};

function Point({ children }: { children: ReactNode }) {
  return (
    <li style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: colors.terra,
          flexShrink: 0,
          marginTop: 12,
        }}
      />
      <span style={{ ...pStyle, margin: 0 }}>{children}</span>
    </li>
  );
}

function Tel({ numero, href, grand = false }: { numero: string; href: string; grand?: boolean }) {
  return (
    <a
      href={href}
      style={{
        ...linkStyle,
        fontWeight: grand ? 700 : 600,
        fontSize: grand ? "1.25rem" : undefined,
        color: grand ? colors.title : colors.link,
      }}
    >
      {numero}
    </a>
  );
}

export default async function CerclePage() {
  const etatInscription = await lireEtatInscription();

  return (
    <>
      {/* ═══ En-tête ═══════════════════════════════════════════════ */}
      <header
        className="pt-14 pb-16 md:pt-20 md:pb-24"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div style={{ ...containerStyle, maxWidth: 680, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
            <CercleLogo size={72} />
          </div>
          <h1 style={{ ...h1Style, fontSize: "clamp(2rem, 7vw, 2.9rem)" }}>
            {/* Coupure de ligne seulement après le point médian. */}
            <span style={{ whiteSpace: "nowrap" }}>{"Le Cercle TRACÉA ·"}</span>{" "}
            <span style={{ whiteSpace: "nowrap" }}>{"Quand ça déborde"}</span>
          </h1>
          <p
            style={{
              ...pStyle,
              fontSize: "clamp(1.12rem, 4.2vw, 1.3rem)",
              lineHeight: 1.5,
              color: colors.accent,
              fontStyle: "italic",
              margin: "22px auto 0",
              maxWidth: 520,
            }}
          >
            {"Parce que personne ne devrait rester seul avec ce qui déborde."}
          </p>

          <ul
            aria-label="En bref"
            style={{
              listStyle: "none",
              padding: 0,
              margin: "32px auto 0",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {REPERES.map((r) => (
              <li
                key={r}
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  color: colors.heading,
                  background: "rgba(111,106,100,0.22)",
                  border: "1px solid rgba(240,230,214,0.12)",
                  borderRadius: 999,
                  padding: "8px 16px",
                }}
              >
                {r}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 36 }}>
            <a href="#inscription" style={ctaStyle} className="w-full sm:w-auto">
              {"Je m'inscris au Cercle"}
            </a>
          </div>
        </div>
      </header>

      {/* ═══ Ouverture ═════════════════════════════════════════════ */}
      <Band tone="b" narrow>
        <p style={{ ...pStyle, fontSize: "1.125rem" }}>
          {
            "Tu connais peut-être ces moments. Tout monte d'un coup. La réaction dépasse ce que tu voudrais. Et après, il reste la honte, la fatigue, et cette impression que personne d'autre ne vit ça."
          }
        </p>
        <p style={{ ...accentStyle, fontSize: "1.25rem", margin: "28px 0" }}>
          {"D'autres le vivent aussi."}
        </p>
        <p style={pStyle}>
          {
            "Le Cercle, c'est quatre rencontres en direct sur Zoom, pour en parler avec d'autres qui le vivent aussi. On y met des mots sur ce qui s'accumule, ce qui déclenche, ce qui reste après. Et on regarde ensemble ce qui aide, même un peu, à revenir à soi."
          }
        </p>
        <p style={{ ...pStyle, margin: 0 }}>
          {
            "Pour certaines personnes, ce moment s'accompagne d'une envie de fuir, par un verre, un écran, la nourriture… Elles ont aussi toute leur place ici."
          }
        </p>
      </Band>

      {/* ═══ Les quatre rencontres ═════════════════════════════════ */}
      <Band tone="a" labelledBy="rencontres-titre">
        <SectionTitle id="rencontres-titre">{"Les quatre rencontres"}</SectionTitle>
        <p style={pStyle}>{"Chaque rencontre suit un moment du débordement."}</p>

        <ol
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          style={{ listStyle: "none", padding: 0, margin: "28px 0" }}
        >
          {RENCONTRES.map((r, i) => (
            <li
              key={r.titre}
              style={{ ...cardStyle, padding: "22px 20px", display: "flex", gap: 18, alignItems: "center" }}
            >
              <div style={{ flexShrink: 0 }}>
                <Verre etape={(i + 1) as 1 | 2 | 3 | 4} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: FONT_CHIFFRE,
                    fontSize: "1.6rem",
                    lineHeight: 1,
                    color: colors.terra,
                    margin: "0 0 6px",
                  }}
                >
                  {i + 1}
                </p>
                <h3 style={h3Style}>{r.titre}</h3>
                <p style={{ ...pStyle, fontSize: "1rem", lineHeight: 1.55, margin: 0 }}>
                  {r.texte}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p style={{ ...accentStyle, margin: 0 }}>
          {
            "Chaque rencontre se suffit à elle-même. Si tu en manques une, la suivante t'accueille comme si c'était la première."
          }
        </p>

        {/* Un cadre reconnu : court encadré dans la même bande, pour garder
            l'alternance des fonds. Texte d'Alyson, mot pour mot. */}
        <section
          aria-labelledby="cadre-reconnu-titre"
          style={{ ...smallCardStyle, marginTop: 40, padding: "26px 22px" }}
        >
          <h2
            id="cadre-reconnu-titre"
            style={{ ...h2Style, fontSize: "clamp(1.25rem, 4.2vw, 1.45rem)", margin: "0 0 14px" }}
          >
            {"Un cadre reconnu"}
          </h2>
          <p style={pStyle}>
            {
              "Le Cercle s'inscrit dans ce que Santé publique France appelle les compétences psychosociales. Parmi elles, les compétences émotionnelles : reconnaître ce qu'on ressent, repérer son stress, trouver ce qui aide à le traverser. Elles comptent pour la santé mentale de chacun, et elles se travaillent à tout âge."
            }
          </p>
          <p style={{ ...pStyle, margin: 0 }}>
            {
              "Chaque rencontre les explore à sa façon, en partant de ce que chacun vit. Sans rien promettre : en s'y exerçant ensemble, simplement."
            }
          </p>
        </section>
      </Band>

      {/* ═══ Comment ça se passe ═══════════════════════════════════ */}
      <Band tone="b" labelledBy="deroulement-titre">
        <SectionTitle id="deroulement-titre">{"Comment ça se passe"}</SectionTitle>
        <p style={{ ...pStyle, fontSize: "1.125rem" }}>
          {
            "On arrive avec un mot, ou en silence. On écoute. On parle de soi, en « je », sans conseil et sans jugement. On prend un petit moment pour le corps, les yeux ouverts, rien à réussir. Puis on cherche ensemble ce dont on aurait eu besoin."
          }
        </p>

        <ul
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          style={{ listStyle: "none", padding: 0, margin: "28px 0" }}
        >
          {PARTICIPER.map((p) => (
            <li key={p.etiquette} style={smallCardStyle}>
              <p style={etiquetteStyle}>{p.etiquette}</p>
              <p style={{ ...pStyle, fontSize: "1rem", lineHeight: 1.55, margin: 0, color: colors.heading }}>
                {p.texte}
              </p>
            </li>
          ))}
        </ul>

        <p style={{ ...pStyle, margin: 0 }}>
          {
            "Tu choisis ta place, et tu peux en changer chaque semaine. Ta caméra peut rester éteinte du début à la fin."
          }
        </p>
      </Band>

      {/* ═══ Un espace fermé, et tenu ══════════════════════════════ */}
      <Band tone="a" labelledBy="cadre-titre" narrow>
        <div
          style={{
            ...cardStyle,
            background: "rgba(201,123,106,0.10)",
            border: "1px solid rgba(201,123,106,0.38)",
            padding: "32px 24px",
          }}
        >
          <h2 id="cadre-titre" style={h2Style}>
            {"Un espace fermé, et tenu"}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {CADRE.map((phrase) => (
              <Point key={phrase}>{phrase}</Point>
            ))}
          </ul>
        </div>
      </Band>

      {/* ═══ Qui anime ═════════════════════════════════════════════ */}
      <Band tone="b" labelledBy="animation-titre" narrow>
        <div
          style={{
            ...cardStyle,
            borderLeft: `3px solid ${colors.terra}`,
            padding: "32px 26px",
          }}
        >
          <h2 id="animation-titre" style={h2Style}>
            {"Qui anime"}
          </h2>
          <p style={{ ...pStyle, fontSize: "1.125rem", margin: 0 }}>
            {
              "Je m'appelle Alyson. Je ne suis pas thérapeute. J'anime à partir de ce que j'ai vécu, et de ce que j'ai appris en chemin sur le débordement. Ancienne aide-soignante, j'ai aussi participé pendant plus d'un an à des groupes d'entraide entre pairs, où j'ai co-animé des réunions. Ce Cercle est une phase pilote : on le construit ensemble."
            }
          </p>
        </div>
      </Band>

      {/* ═══ Ce que le Cercle n'est pas + pas le bon moment ════════ */}
      <Band tone="a" narrow>
        <div
          style={{
            borderRadius: 24,
            padding: "30px 24px",
            background: "rgba(110,125,109,0.24)",
            border: "1px solid rgba(138,158,122,0.45)",
          }}
        >
          <section aria-labelledby="nest-pas-titre">
            <h2 id="nest-pas-titre" style={{ ...h2Style, fontSize: "clamp(1.3rem, 4.4vw, 1.6rem)" }}>
              {"Ce que le Cercle n'est pas"}
            </h2>
            <p style={{ ...pStyle, margin: 0 }}>
              {
                "Ce n'est ni une thérapie, ni un groupe de soins, ni du coaching. Il ne remplace pas un suivi médical, psychologique ou en addictologie, ni un groupe d'entraide. Il se tient à côté."
              }
            </p>
          </section>

          <div style={{ height: 1, background: "rgba(240,230,214,0.12)", margin: "28px 0" }} />

          <section aria-labelledby="moment-titre">
            <h2 id="moment-titre" style={{ ...h2Style, fontSize: "clamp(1.3rem, 4.4vw, 1.6rem)" }}>
              {"Ce n'est peut-être pas le bon moment"}
            </h2>
            <p style={{ ...pStyle, margin: 0 }}>
              {
                "Si tu traverses en ce moment des idées suicidaires, si tu sors d'une hospitalisation, ou si tu vis une situation de violence sans accompagnement, ta place reste ici pour un prochain cycle. Aujourd'hui, tu peux appeler le "
              }
              <Tel numero="3114" href="tel:3114" grand />
              {", jour et nuit, pour toi ou pour un proche."}
            </p>
          </section>
        </div>
      </Band>

      {/* ═══ Dates et tarif + formulaire ═══════════════════════════ */}
      <Band tone="b" labelledBy="dates-titre">
        <SectionTitle id="dates-titre">{"Dates et tarif"}</SectionTitle>
        <p style={pStyle}>{"Deux créneaux, au choix."}</p>

        <ul
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          style={{ listStyle: "none", padding: 0, margin: "24px 0" }}
        >
          {CRENEAUX_CARTES.map((c) => (
            <li key={c.titre} style={{ ...cardStyle, padding: "24px 22px" }}>
              <h3 style={{ ...h3Style, fontSize: "1.25rem", color: colors.title }}>{c.titre}</h3>
              <p style={{ ...pStyle, margin: "0 0 6px" }}>{c.jours}</p>
              <p style={{ ...pStyle, margin: 0, color: colors.accent, fontWeight: 600 }}>
                {c.heures}
              </p>
            </li>
          ))}
        </ul>

        <div style={{ ...smallCardStyle, padding: "6px 20px" }}>
          <p style={{ ...pStyle, margin: 0, padding: "16px 0", borderBottom: `1px solid ${colors.line}` }}>
            {"En direct sur Zoom. "}
            <strong style={{ color: colors.title, fontSize: "1.25rem", fontWeight: 600 }}>
              {"12 €"}
            </strong>
            {" les quatre rencontres, en tarif pilote pour ce premier cycle."}
          </p>
          <p style={{ ...pStyle, margin: 0, padding: "16px 0", borderBottom: `1px solid ${colors.line}` }}>
            <strong style={{ color: colors.heading, fontWeight: 600 }}>
              {"Inscriptions ouvertes jusqu'au 13 novembre."}
            </strong>
          </p>
          <p style={{ ...pStyle, margin: 0, padding: "16px 0" }}>
            {
              "Chaque groupe a besoin d'au moins quatre personnes pour exister. Si ton créneau n'en réunit pas assez, je te propose l'autre, ou je te rembourse entièrement."
            }
          </p>
        </div>

        {/* Zone d'inscription : formulaire, ou message si fermé */}
        <section
          id="inscription"
          aria-labelledby="inscription-titre"
          tabIndex={-1}
          style={{
            ...cardStyle,
            marginTop: 40,
            padding: etatInscription.type === "ouvert" ? "30px 20px" : "30px 22px",
            border: "1px solid rgba(201,123,106,0.30)",
            textAlign: etatInscription.type === "ouvert" ? "left" : "center",
            scrollMarginTop: 24,
          }}
        >
          {etatInscription.type === "ouvert" ? (
            <CercleForm places={etatInscription.places} />
          ) : etatInscription.type === "clos" ? (
            <h2 id="inscription-titre" style={{ ...h2Style, margin: 0 }}>
              {
                "Les inscriptions sont closes. Le prochain cycle sera annoncé ici."
              }
            </h2>
          ) : (
            <h2 id="inscription-titre" style={{ ...h2Style, margin: 0 }}>
              {"Inscription bientôt disponible"}
            </h2>
          )}
        </section>
      </Band>

      {/* ═══ Numéros d'aide ════════════════════════════════════════ */}
      <Band tone="a" labelledBy="aide-titre" narrow>
        <p id="aide-titre" style={{ ...pStyle, color: colors.heading, fontWeight: 500 }}>
          {"Si ça devient trop lourd, aujourd'hui ou plus tard :"}
        </p>
        <ul style={{ ...pStyle, listStyle: "none", paddingLeft: 0, margin: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <Tel numero="3114" href="tel:3114" />
            {", prévention du suicide, 24 h/24"}
          </li>
          <li style={{ marginBottom: 8 }}>
            <Tel numero="15" href="tel:15" />
            {" ou "}
            <Tel numero="112" href="tel:112" />
            {", urgence"}
          </li>
          <li style={{ marginBottom: 8 }}>
            <Tel numero="3919" href="tel:3919" />
            {", violences faites aux femmes"}
          </li>
          <li style={{ marginBottom: 8 }}>
            <Tel numero="09 72 39 40 50" href="tel:+33972394050" />
            {", SOS Amitié"}
          </li>
          <li>
            <Tel numero="0 980 980 930" href="tel:+33980980930" />
            {", Alcool Info Service."}
          </li>
        </ul>
      </Band>
    </>
  );
}
