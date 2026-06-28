import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { SafetyResources } from "@/components/SafetyResources";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, articleBreadcrumbJsonLd } from "@/lib/structured-data";

// Page serveur : porte la metadata SEO de l'article.
// Contenu repris au mot près du fichier source
// Articles/article_colere_qui_monte.md
export const metadata: Metadata = {
  title: "La colère qui monte : que faire dans l'instant | TRACÉA",
  description:
    "La chaleur qui monte, l'envie de tout envoyer balader ? Comprendre ta colère sans la subir, et un appui concret quand elle déborde. Pas une thérapie.",
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

export default function ArticleColereQuiMonte() {
  const slug = "colere-qui-monte-que-faire";
  const headline = "La colère qui monte d'un coup : que faire dans l'instant";
  const image = "article-colere.jpg";
  const imageAlt = "Texture de braise dans des tons chauds";
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
          La colère qui monte d&apos;un coup : que faire dans l&apos;instant
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginTop: 32,
          }}
        >
          <p style={pBody}>{`La chaleur qui monte dans la poitrine. La mâchoire qui se serre. L'envie de crier, de claquer une porte, de tout envoyer balader. La colère, quand elle monte d'un coup, prend toute la place en quelques secondes.`}</p>
          <p style={pBody}>{`Si tu cherches quoi faire dans ces moments, commençons par une chose : ta colère n'est pas le problème. Voici ce qu'elle est vraiment, et comment ne pas te laisser emporter par elle quand elle déborde.`}</p>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Cette colère qui monte d&apos;un coup
            </h2>
            <p style={pBody}>{`Tu la sens dans le corps avant même de penser. La chaleur, la tension, les poings qui se ferment, la voix qui monte. Tout pousse vers l'action immédiate : répondre, hausser le ton, partir en claquant.`}</p>
            <p style={pBody}>{`Et souvent, juste après, autre chose arrive : la honte, ou la culpabilité d'avoir réagi comme ça. Comme si la colère était une faute. Elle ne l'est pas.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              La colère n&apos;est pas le problème
            </h2>
            <p style={pBody}>{`La colère est une émotion saine, et même utile. Elle te signale quelque chose d'important : qu'une limite a été franchie, qu'un besoin n'a pas été respecté, qu'on est allé trop loin avec toi. C'est une alarme, pas un défaut.`}</p>
            <p style={pBody}>{`Quelqu'un qui ne ressent jamais de colère, ce n'est pas un idéal. C'est souvent quelqu'un qui ne s'autorise plus à dire stop. Donc le souci n'est pas de ressentir de la colère. Le souci, c'est quand elle déborde et te fait dire ou faire ce que tu regrettes ensuite. C'est ça, et seulement ça, qu'on cherche à apprivoiser.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Pourquoi se raisonner ne suffit pas
            </h2>
            <p style={pBody}>{`Quand la colère monte, ton système nerveux passe en alerte, et c'est la partie rapide et instinctive du cerveau qui prend les commandes. Se dire « calme-toi » glisse, parce qu'à ce moment précis, la tête n'est plus vraiment joignable.`}</p>
            <p style={pBody}>{`C'est pour ça qu'on change de porte d'entrée. Pas le mental. Le corps. C'est souvent par lui que l'intensité peut retomber un peu, quand les mots n'y arrivent plus.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Que faire quand la colère monte
            </h2>
            <p style={pBody}>{`Quelques appuis, à essayer sans rien forcer.`}</p>
            <p style={pBody}>{`Si tu peux, marque une pause physique. Sortir de la pièce, t'éloigner de la situation quelques instants, mettre un peu d'espace entre toi et ce qui t'a allumée. Ce n'est pas fuir, c'est te donner une chance de ne pas exploser.`}</p>
            <p style={pBody}>{`Reviens à ton corps. Sens tes pieds sur le sol, desserre la mâchoire, ouvre les poings, laisse ton souffle ralentir. Le corps se relâche un peu, et l'intensité avec lui.`}</p>
            <p style={pBody}>
              {`Surtout, n'agis pas sur le pic. Ne réponds pas, n'envoie pas, ne tranche pas dans la seconde. C'est souvent là qu'on dérape, comme `}
              <Link href="/articles/ne-pas-repondre-a-chaud" style={linkInline}>
                pour un message qu&apos;on va regretter
              </Link>
              {`. Ce que tu as à dire pourra se dire après, et mieux.`}
            </p>
            <p style={pBody}>{`Et tu peux nommer ce qui se passe. « Là, je suis en colère. » Le reconnaître, plutôt que d'être agie par elle.`}</p>
            <p style={pBody}>{`Sois honnête avec toi : ça ne fait pas disparaître ta colère, et elle a le droit d'être là. Ça t'évite juste d'être complètement emportée par elle.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Après, écouter ce qu&apos;elle dit
            </h2>
            <p style={pBody}>{`Une fois la colère retombée, tu peux regarder ce qu'elle protégeait. Très souvent, sous la colère, il y a quelque chose de plus fragile : une peur, une tristesse, un besoin qui n'a pas été entendu.`}</p>
            <p style={pBody}>{`La colère est un peu le garde du corps de ces émotions-là. Elle monte au front pour les protéger. L'écouter vraiment, ce n'est pas s'excuser d'avoir été en colère, c'est se demander : de quoi avais-je besoin, là, que je n'ai pas eu ? C'est souvent là que se trouve l'essentiel.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Quand la colère déborde trop souvent
            </h2>
            <p style={pBody}>{`Si la colère te déborde souvent, si elle abîme tes relations ou si elle te fait peur à toi-même, ce n'est pas une fatalité ni un défaut de caractère. Un psychologue peut t'aider à comprendre ce qui se rejoue dans ces moments.`}</p>
            <p style={pBody}>{`Et si la détresse est forte, tu peux contacter le 3114, le numéro national de prévention du suicide, gratuit, confidentiel, ouvert 24h/24.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              TRACÉA, pour l&apos;instant où ça monte
            </h2>
            <p style={pBody}>{`TRACÉA est un outil de régulation émotionnelle pensé pour ces secondes où la colère monte et menace de déborder. Pas pour t'apprendre à ne plus jamais ressentir. Pour te donner quelque chose à faire avec ton corps, tout de suite, le temps de redevenir celle qui choisit.`}</p>
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
