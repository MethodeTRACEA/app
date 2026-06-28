import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { SafetyResources } from "@/components/SafetyResources";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, articleBreadcrumbJsonLd } from "@/lib/structured-data";

// Page serveur : porte la metadata SEO de l'article.
// Contenu repris au mot près du fichier source
// Articles/article_ruminer_la_nuit.md
export const metadata: Metadata = {
  title: "Ruminer la nuit : quand le mental ne s'arrête pas | TRACÉA",
  description:
    "Il est tard, tout dort, et ton cerveau repasse tout en boucle ? Comprendre la rumination nocturne et des appuis quand le mental ne lâche pas. Pas une thérapie.",
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

export default function ArticleRuminerLaNuit() {
  const slug = "ruminer-la-nuit-mental-en-boucle";
  const headline = "Ruminer la nuit : quand le mental ne s'arrête pas";
  const image = "article-ruminer-nuit.jpg";
  const imageAlt =
    "Personne assise au bord d'un lit la nuit face à la fenêtre, réveil affichant 3 h 07";
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
          Ruminer la nuit : quand le mental ne s&apos;arrête pas
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginTop: 32,
          }}
        >
          <p style={pBody}>{`Il est tard. Tout le monde dort. Et toi, tu es là, les yeux ouverts, le cerveau qui repasse tout en boucle. Ce que tu aurais dû dire. Ce qui s'est passé. Ce qui t'attend demain. Et plus tu veux que ça s'arrête, plus ça tourne.`}</p>
          <p style={pBody}>{`Si tes nuits ressemblent à ça, tu n'es pas seule, et tu n'es pas en train de mal faire. Voici pourquoi le mental s'emballe surtout la nuit, et ce que tu peux faire quand il ne lâche pas.`}</p>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Pourquoi ça tourne surtout la nuit
            </h2>
            <p style={pBody}>{`Le jour, tu es prise dans le mouvement. Les tâches, les gens, les choses à faire occupent l'espace et couvrent le reste. La nuit, le silence et l'immobilité retirent tout ça d'un coup. Et là, tout ce que tu avais mis de côté remonte.`}</p>
            <p style={pBody}>{`Ton cerveau, enfin « libre », se met à dérouler ce qu'il n'a pas eu le temps de traiter dans la journée. En plus, la fatigue baisse tes défenses : à 3 heures du matin, tout paraît plus gros, plus grave, plus sans issue qu'en plein jour. Ce n'est pas toi qui dramatises. C'est l'heure et l'épuisement qui déforment.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Ruminer, ce n&apos;est pas réfléchir
            </h2>
            <p style={pBody}>{`C'est une distinction importante. Réfléchir, ça cherche une solution et ça avance vers quelque chose. Ruminer, ça tourne en rond sur le même point, encore et encore, sans jamais avancer.`}</p>
            <p style={pBody}>{`C'est pour ça qu'à 3 heures du matin, tu ne « résous » presque jamais rien. Ce n'est pas de la réflexion utile, c'est une boucle. Et se dire « arrête d'y penser » ne marche pas : plus tu pousses une pensée dehors, plus elle revient fort. Ce n'est pas un manque de volonté de ta part, c'est juste comme ça que le mental fonctionne.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Pourquoi se raisonner ne suffit pas
            </h2>
            <p style={pBody}>{`Quand le mental est emballé, essayer de le calmer avec des pensées, ça revient à éteindre un feu avec du bois. Tu restes dans la tête, et la tête, justement, est le problème à ce moment-là.`}</p>
            <p style={pBody}>
              {`D'où l'intérêt de changer de porte d'entrée. Pas le mental. Le corps. C'est souvent par lui qu'on peut sortir de la boucle, quand les mots n'y arrivent plus. C'est la même logique que `}
              <Link
                href="/articles/submerge-par-ses-emotions-que-faire"
                style={linkInline}
              >
                quand une émotion te submerge
              </Link>
              {` en plein jour.`}
            </p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Que faire quand le mental ne lâche pas
            </h2>
            <p style={pBody}>{`Quelques appuis, à essayer sans rien forcer.`}</p>
            <p style={pBody}>{`Tu peux revenir à ton corps. Sentir le contact du lit, le poids de ton corps qui s'enfonce dans le matelas, ta respiration qui va et vient. Pas pour t'endormir à tout prix, juste pour quitter la tête et revenir dans quelque chose de concret.`}</p>
            <p style={pBody}>{`Tu peux aussi sortir les pensées de ta tête en les posant ailleurs. Garde un papier près du lit, et note ce qui tourne, en vrac. Ce n'est pas pour résoudre quoi que ce soit cette nuit, c'est pour ne plus avoir à tout tenir dans ta tête, et pouvoir te dire « j'en occuperai demain ».`}</p>
            <p style={pBody}>{`Et tu peux nommer ce qui se passe. « Là, je rumine. » Le reconnaître, ça t'évite de te faire happer par la boucle comme si chaque pensée était une urgence.`}</p>
            <p style={pBody}>{`Sois honnête avec toi : ça ne garantit pas que tu vas t'endormir, et ça ne fait pas taire le mental sur commande. Mais ça te donne quelque chose à faire au lieu de lutter contre tes propres pensées, et cette nuit, c'est déjà un appui.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Et si ça revient toutes les nuits
            </h2>
            <p style={pBody}>{`Si les nuits blanches s'enchaînent, si l'angoisse du soir s'installe, ou si l'épuisement de mal dormir pèse sur tes journées, ce n'est pas une faiblesse, et tu n'as pas à t'en accommoder seule. Un médecin peut t'aider sur le sommeil et sur ce qui tourne en boucle.`}</p>
            <p style={pBody}>{`Et si la détresse est forte, surtout dans ces heures de nuit où l'on se sent très seule, tu peux contacter le 3114, le numéro national de prévention du suicide, gratuit, confidentiel, ouvert 24h/24.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              TRACÉA, pour ces moments où ça ne lâche pas
            </h2>
            <p style={pBody}>{`TRACÉA est un outil de régulation émotionnelle pensé pour les instants où le mental s'emballe et que tu n'arrives plus à l'arrêter. Pas pour analyser tes pensées une par une. Pour te donner quelque chose à faire avec ton corps, tout de suite, quand la tête tourne trop.`}</p>
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
