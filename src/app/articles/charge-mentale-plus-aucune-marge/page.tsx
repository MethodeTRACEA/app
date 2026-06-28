import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { SafetyResources } from "@/components/SafetyResources";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, articleBreadcrumbJsonLd } from "@/lib/structured-data";

// Page serveur : porte la metadata SEO de l'article.
// Contenu repris au mot près du fichier source
// Articles/article_charge_mentale.md
export const metadata: Metadata = {
  title: "Charge mentale : quand il n'y a plus aucune marge | TRACÉA",
  description:
    "Tu penses à tout, tout le temps, plus aucune marge ? Comprendre la charge mentale et des appuis concrets pour les moments où ça déborde. Pas une thérapie.",
};

// ── Habillage visuel : univers sombre chaleureux (réf. page Ressources / articles) ──
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

const h2Style: CSSProperties = {
  fontSize: "clamp(1.3rem, 3.5vw, 1.6rem)",
  color: "#F0E6D6",
  lineHeight: 1.3,
  margin: 0,
};

const pBody: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "1.0625rem",
  lineHeight: 1.78,
  color: "rgba(240,230,214,0.82)",
  margin: 0,
};

const linkInline: CSSProperties = {
  color: "#D99A84",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

const btnPrimary: CSSProperties = {
  display: "inline-block",
  textAlign: "center",
  background:
    "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
  color: "#1A120D",
  borderRadius: 40,
  padding: "15px 32px",
  fontWeight: 600,
  fontSize: "1rem",
  textDecoration: "none",
  boxShadow: "0 8px 32px rgba(201,144,124,0.18), 0 2px 8px rgba(0,0,0,0.15)",
};

const btnSecondary: CSSProperties = {
  display: "inline-block",
  textAlign: "center",
  background: "transparent",
  color: "#E8D8C7",
  border: "1px solid rgba(232,216,199,0.28)",
  borderRadius: 40,
  padding: "15px 32px",
  fontWeight: 500,
  fontSize: "1rem",
  textDecoration: "none",
};

export default function ArticleChargeMentale() {
  const slug = "charge-mentale-plus-aucune-marge";
  const headline = "Charge mentale : quand il n'y a plus aucune marge";
  return (
    <div style={pageStyle}>
      <JsonLd
        data={articleJsonLd({
          slug,
          headline,
          description: metadata.description as string,
        })}
      />
      <JsonLd data={articleBreadcrumbJsonLd({ slug, title: headline })} />
      <div style={haloStyle} aria-hidden="true" />

      <article style={containerStyle}>
        <h1 className="font-serif" style={h1Style}>
          Charge mentale : quand il n&apos;y a plus aucune marge
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginTop: 32,
          }}
        >
          <p style={pBody}>{`Tu penses à tout. Les rendez-vous, les courses, ce qui manque, ce qu'il faut prévoir, ce que les autres oublient. Même quand tu ne fais rien, ton cerveau, lui, ne s'arrête jamais. Et un jour, il n'y a plus de marge. Une chose de trop, et tu débordes.`}</p>
          <p style={pBody}>{`Si tu te reconnais là-dedans, ça porte un nom : la charge mentale. Voici ce que c'est vraiment, pourquoi ça épuise autant, et ce que tu peux faire, dans le moment comme sur la durée.`}</p>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              La charge mentale, c&apos;est quoi
            </h2>
            <p style={pBody}>{`Ce n'est pas faire les tâches. C'est y penser, tout le temps. Anticiper, organiser, retenir, coordonner. Savoir qu'il faut racheter du pain, que le rendez-vous est mardi, qu'il manque une taille au-dessus, que l'un a piscine et l'autre pas.`}</p>
            <p style={pBody}>{`C'est ce travail invisible de gestion qui ne se voit pas, ne se pose jamais, et tourne en fond du matin au soir. Souvent, ce sont les femmes qui le portent, en plus de tout le reste. Et comme ça ne se voit pas, c'est rarement reconnu.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Pourquoi ça épuise autant
            </h2>
            <p style={pBody}>{`Parce que ça ne s'arrête jamais. Une tâche, tu la finis. La charge mentale, elle, reste allumée en permanence, même la nuit, même en vacances. Ton cerveau ne se met jamais vraiment en veille.`}</p>
            <p style={pBody}>{`Et il y a une double peine : c'est invisible, donc personne ne voit l'effort que ça demande, et toi tu finis par croire que tu devrais « y arriver » sans broncher. Tu portes la charge, et en plus tu culpabilises de fatiguer. Ce n'est pas un manque d'organisation. C'est juste trop, pour une seule tête.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Quand il n&apos;y a plus aucune marge
            </h2>
            <p style={pBody}>{`Arrive le moment où le réservoir est vide. Tu as tout géré, tout tenu, et il ne reste plus rien. Là, une petite chose suffit. Un imprévu. Une demande de plus. Un « maman ? » de trop. Et tu craques.`}</p>
            <p style={pBody}>
              {`Vu de l'extérieur, on dirait que tu réagis fort pour pas grand-chose. Mais ce n'est pas pour pas grand-chose. C'est pour tout ce que tu portais déjà, en silence, depuis longtemps. C'est exactement ce moment où `}
              <Link
                href="/articles/submerge-par-ses-emotions-que-faire"
                style={linkInline}
              >
                une émotion te submerge
              </Link>
              {` d'un coup.`}
            </p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Que faire dans le moment où ça déborde
            </h2>
            <p style={pBody}>{`Quand tu sens que ça monte, quelques appuis, à essayer sans rien forcer.`}</p>
            <p style={pBody}>{`Tu peux t'arrêter une minute, même au milieu de tout. Poser ce que tu tiens. T'éloigner deux pas. Couper, juste un instant, le flux des choses à gérer.`}</p>
            <p style={pBody}>{`Tu peux revenir à ton corps. Sentir tes pieds sur le sol, tes mains, ton souffle. Ralentir un peu, sans technique compliquée. C'est concret, et ça ne demande pas de réfléchir, justement au moment où réfléchir est trop.`}</p>
            <p style={pBody}>{`Sois honnête avec toi : ça ne vide pas ta charge mentale. Aucun exercice ne le fait. Mais ça t'évite d'être complètement emportée par le pic, et ça, dans l'instant, c'est déjà beaucoup.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Et au-delà du moment, alléger pour de vrai
            </h2>
            <p style={pBody}>{`Parce que le vrai sujet est là : la charge mentale ne se règle pas dans ta seule tête. Elle s'allège quand elle se partage.`}</p>
            <p style={pBody}>{`Ça veut dire rendre l'invisible visible, en parler, dire ce que tu portes au lieu de le garder. Déléguer vraiment, pas « déléguer en continuant de tout superviser ». Poser des limites, et accepter que les choses soient faites autrement que par toi, parfois moins bien, et que ça aille quand même.`}</p>
            <p style={pBody}>{`TRACÉA peut t'accompagner dans les moments où ça déborde. Mais alléger ta charge passe aussi par ce qui se joue autour de toi, pas seulement en toi. Et ce n'est pas à toi seule de tout porter.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Quand l&apos;épuisement devient trop lourd
            </h2>
            <p style={pBody}>{`Si la fatigue s'installe et ne part plus, si tu te sens vidée en permanence, sans élan, peut-être au bord de l'épuisement, ce n'est pas une faiblesse. C'est un signal à écouter. Un médecin ou un psychologue peut t'aider à y voir clair et à souffler.`}</p>
            <p style={pBody}>{`Et si la détresse est forte, tu peux contacter le 3114, le numéro national de prévention du suicide, gratuit, confidentiel, ouvert 24h/24.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              TRACÉA, pour les moments où ça déborde
            </h2>
            <p style={pBody}>{`TRACÉA est un outil de régulation émotionnelle pensé pour ces instants où la charge devient trop lourde d'un coup. Pas pour ajouter une tâche de plus à ta liste. Pour te donner quelque chose à faire avec ton corps, tout de suite, quand il n'y a plus de marge.`}</p>
            <p style={pBody}>{`C'est gratuit, sans compte pour commencer, en deux minutes.`}</p>
          </section>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12 }}>
            <Link href="/start" className="font-sans" style={btnPrimary}>
              Commencer maintenant
            </Link>
            <Link href="/comment-ca-marche" className="font-sans" style={btnSecondary}>
              Voir comment ça marche
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 48 }}>
          <SafetyResources />
        </div>
      </article>
    </div>
  );
}
