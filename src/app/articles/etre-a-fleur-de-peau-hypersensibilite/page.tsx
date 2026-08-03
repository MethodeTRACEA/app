import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { SafetyResources } from "@/components/SafetyResources";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, articleBreadcrumbJsonLd } from "@/lib/structured-data";

// Page serveur : porte la metadata SEO de l'article.
// Contenu repris au mot près du fichier source
// Articles/article_etre_a_fleur_de_peau.md
export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.methodetracea.fr/articles/etre-a-fleur-de-peau-hypersensibilite",
  },
  title: "Être à fleur de peau : vivre avec l'hypersensibilité | TRACÉA",
  description:
    "Tu ressens tout plus fort, le moindre imprévu te submerge ? Comprendre l'hypersensibilité au quotidien et des appuis concrets quand ça monte. Pas une thérapie.",
};

// ── Habillage visuel : univers sombre chaleureux (réf. page Ressources / accueil) ──
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

export default function ArticleEtreAFleurDePeau() {
  const slug = "etre-a-fleur-de-peau-hypersensibilite";
  const headline = "Être à fleur de peau : comprendre l'hypersensibilité au quotidien";
  const image = "article-fleur-de-peau.jpg";
  const imageAlt =
    "Tissu drapé en plis doux, dans des tons bruns chauds et une lumière tamisée";
  return (
    <div style={pageStyle}>
      <JsonLd
        data={articleJsonLd({
          slug,
          headline,
          description: metadata.description as string,
          image,
        })}
      />
      <JsonLd data={articleBreadcrumbJsonLd({ slug, title: headline })} />
      <div style={haloStyle} aria-hidden="true" />

      <article style={containerStyle}>
        <Image
          src={`/images/${image}`}
          alt={imageAlt}
          width={1730}
          height={909}
          sizes="(max-width: 720px) 100vw, 680px"
          priority
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 20,
            display: "block",
            marginBottom: 28,
          }}
        />
        <h1 className="font-serif" style={h1Style}>
          Être à fleur de peau : comprendre l&apos;hypersensibilité au quotidien
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginTop: 32,
          }}
        >
          <p style={pBody}>{`Un bruit de trop. Une remarque anodine. Une journée déjà trop pleine. Et d'un coup, c'est trop. Tu te sens à fleur de peau, à vif, prête à craquer pour quelque chose qui paraît minuscule vu de l'extérieur.`}</p>
          <p style={pBody}>{`Si tu ressens les choses plus fort que la plupart des gens autour de toi, tu n'es pas en train d'exagérer, et tu n'es pas seule. Voici ce qui se passe, et ce que tu peux faire quand ça déborde.`}</p>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Être à fleur de peau, c&apos;est quoi
            </h2>
            <p style={pBody}>{`C'est quand ton seuil est vite atteint. Les émotions montent vite et fort. Les sons, les lumières, les tensions des autres, tout entre sans filtre et prend beaucoup de place. Une contrariété que d'autres balaieraient d'un haussement d'épaules peut, chez toi, occuper toute la pièce.`}</p>
            <p style={pBody}>{`On appelle souvent ça l'hypersensibilité, ou la grande sensibilité. Ce n'est pas une faiblesse, ni un caprice. C'est une manière de fonctionner, avec laquelle beaucoup de personnes vivent.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Pourquoi tu ressens tout plus fort
            </h2>
            <p style={pBody}>{`Chez les personnes très sensibles, le système nerveux capte énormément d'informations en même temps, et les trie moins. Là où certains filtrent le bruit de fond sans y penser, toi tu reçois tout, en pleine intensité. Les émotions des autres, les détails, les ambiances.`}</p>
            <p style={pBody}>{`Ce n'est ni une maladie, ni quelque chose que tu fais exprès. C'est un trait qui concerne une part importante de la population. Le souci n'est pas de ressentir beaucoup. C'est de ne pas savoir quoi faire quand ça déborde.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Ces moments où ça déborde d&apos;un coup
            </h2>
            <p style={pBody}>{`Tu les connais. La notification de trop. Le bruit qui devient insupportable. Quelqu'un qui parle alors que tu n'as plus de place mentale. L'imprévu qui s'ajoute à une journée déjà saturée.`}</p>
            <p style={pBody}>
              {`Souvent, ce n'est pas un gros événement qui fait craquer. C'est la petite chose en plus, posée sur tout ce que tu portais déjà sans le dire. C'est exactement ce genre de moment où `}
              <Link
                href="/articles/submerge-par-ses-emotions-que-faire"
                style={linkInline}
              >
                une émotion te submerge
              </Link>
              {` sans prévenir.`}
            </p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Que faire quand tu sens que tu vas craquer
            </h2>
            <p style={pBody}>{`Quelques appuis, à essayer sans rien forcer.`}</p>
            <p style={pBody}>{`Si c'est possible, baisse un peu le volume autour de toi. Sortir deux minutes. T'éloigner du bruit. Fermer une porte. Réduire ce qui entre, même un tout petit peu, change déjà quelque chose.`}</p>
            <p style={pBody}>{`Tu peux revenir à ton corps. Sentir tes pieds sur le sol, le contact d'une surface sous ta main. Ralentir ton souffle si tu peux, sans technique compliquée, juste un peu moins vite.`}</p>
            <p style={pBody}>{`Et tu peux mettre un mot sur ce qui se passe. "Je suis saturée." "C'est trop, là." Le dire, même seulement dans ta tête, remet une petite distance.`}</p>
            <p style={pBody}>{`Rien de tout ça ne supprime ta sensibilité, et ce n'est pas le but. L'idée, c'est d'avoir quelque chose à faire pendant le pic, pour le traverser sans tout faire exploser.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Vivre avec, sans se reprocher d&apos;être comme ça
            </h2>
            <p style={pBody}>{`Ta sensibilité n'a pas que des moments difficiles. C'est aussi elle qui te fait percevoir ce que les autres ne voient pas, ressentir profondément, être présente aux gens. Le problème n'est pas toi.`}</p>
            <p style={pBody}>{`Ce qui aide, sur la durée, c'est d'apprendre à protéger tes limites. Doser les stimulations quand tu peux. T'autoriser des pauses sans culpabiliser. Ne pas passer tes journées à te sur-adapter à un rythme qui n'est pas le tien.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Quand c&apos;est trop lourd à porter
            </h2>
            <p style={pBody}>{`Si cette sensibilité te fait souffrir au quotidien, si tu te sens débordée presque tout le temps, ou si tu traverses une vraie détresse, ce n'est pas une faiblesse, et tu n'as pas à gérer ça seule. Un médecin ou un psychologue peut t'aider à y voir clair et à t'accompagner.`}</p>
            <p style={pBody}>{`Et si la détresse est forte, tu peux contacter le 3114, le numéro national de prévention du suicide, gratuit, confidentiel, ouvert 24h/24.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              TRACÉA, pour les moments où ça déborde
            </h2>
            <p style={pBody}>{`TRACÉA est un outil de régulation émotionnelle pensé pour ces instants précis. Pas pour t'expliquer pourquoi tu es comme ça. Pour te donner quelque chose à faire avec ton corps, tout de suite, quand la sensibilité passe en trop-plein.`}</p>
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
