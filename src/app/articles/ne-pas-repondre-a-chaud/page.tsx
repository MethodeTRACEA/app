import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { SafetyResources } from "@/components/SafetyResources";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, articleBreadcrumbJsonLd } from "@/lib/structured-data";

// Page serveur : porte la metadata SEO de l'article.
// Contenu repris au mot près du fichier source
// Articles/article_ne_pas_repondre_a_chaud.md
export const metadata: Metadata = {
  title: "Ne pas répondre à chaud : avant d'envoyer ce message | TRACÉA",
  description:
    "Le pouce au-dessus du bouton envoyer, l'envie de répondre cash ? Comprendre pourquoi on réagit si vite, et un appui pour ne pas envoyer ce qu'on regrettera.",
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

export default function ArticleNePasRepondreAChaud() {
  const slug = "ne-pas-repondre-a-chaud";
  const headline = "Ne pas répondre à chaud : avant d'envoyer ce message";
  const image = "article-repondre-a-chaud.jpg";
  const imageAlt =
    "Main tenant un téléphone à l'écran éteint près d'une fenêtre, le soir, dans des tons chauds";
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
          Ne pas répondre à chaud : avant d&apos;envoyer ce message
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginTop: 32,
          }}
        >
          <p style={pBody}>{`Tu as lu le message. Quelque chose s'est serré, ou a explosé. Et déjà tes doigts tapent la réponse, celle qui va remettre les choses à leur place, là, tout de suite. Le pouce est au-dessus du bouton envoyer.`}</p>
          <p style={pBody}>{`C'est exactement le moment où ça vaut la peine de s'arrêter une seconde. Voici pourquoi on réagit si vite quand une émotion monte, et ce que tu peux faire avant d'envoyer ce que tu risques de regretter.`}</p>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Ce moment juste avant d&apos;appuyer sur envoyer
            </h2>
            <p style={pBody}>{`Tu le connais. Le cœur qui bat plus vite, la chaleur qui monte, cette urgence de répondre maintenant. L'impression que si tu n'envoies pas tout de suite, tu vas exploser. Tout, en toi, pousse vers l'envoi.`}</p>
            <p style={pBody}>{`Ce n'est pas de la méchanceté. C'est une vague. Et sur le moment, elle paraît tellement légitime que ne pas y céder semble presque impossible.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Pourquoi on réagit si vite
            </h2>
            <p style={pBody}>{`Quand une émotion monte d'un coup, ton système nerveux passe en alerte, et c'est la partie rapide et instinctive de ton cerveau qui prend la main. Celle qui réagit avant même que tu aies pensé. C'est utile face à un vrai danger. Beaucoup moins face à un message.`}</p>
            <p style={pBody}>
              {`Du coup, sur l'instant, ce n'est pas vraiment toi qui réponds. C'est l'émotion qui parle à ta place. Et elle parle fort, en majuscules, sans nuances. C'est le même mécanisme que `}
              <Link
                href="/articles/submerge-par-ses-emotions-que-faire"
                style={linkInline}
              >
                quand une émotion te submerge
              </Link>
              {` tout entière.`}
            </p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Le piège du « je vais lui dire ses quatre vérités »
            </h2>
            <p style={pBody}>{`Sur le moment, l'idée d'envoyer soulage. Tu te sens puissante, dans ton bon droit, enfin prête à dire les choses. C'est grisant.`}</p>
            <p style={pBody}>{`Mais une fois le message parti, il ne se reprend pas. Et très souvent, le soulagement de quelques secondes se paie ensuite en heures : réparer, t'expliquer, ou tourner ça en boucle le soir venu. Ce que tu voulais régler, tu l'as parfois aggravé.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Que faire dans la seconde où tu allais répondre
            </h2>
            <p style={pBody}>{`Quelques appuis, à essayer sans rien forcer.`}</p>
            <p style={pBody}>{`D'abord, n'envoie pas tout de suite. C'est tout. Repose le téléphone, même deux minutes. Tu pourras toujours répondre après, mais tu ne pourras jamais reprendre un message parti.`}</p>
            <p style={pBody}>{`Pendant ces deux minutes, reviens à ton corps. Sens tes pieds sur le sol, desserre les épaules, laisse ton souffle ralentir un peu. Le temps que le pic retombe, juste assez pour que ce soit toi qui décides, et plus l'émotion seule.`}</p>
            <p style={pBody}>{`Si tu as besoin de vider ce que tu as sur le cœur, écris-le, mais pas dans la conversation. Tape-le dans tes notes, ou sur un papier. Tu déposes tout, sans envoyer, sans dégât.`}</p>
            <p style={pBody}>{`Et tu peux nommer ce qui se passe. « Là, je suis blessée. » « Là, je suis en colère. » Le dire remet un peu de distance entre l'émotion et le message.`}</p>
            <p style={pBody}>{`Sois honnête avec toi : ça ne t'empêche pas de ressentir ce que tu ressens, et ce n'est pas le but. Mais ça te laisse le temps de choisir ta réponse, au lieu de la subir.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Et si tu as déjà envoyé
            </h2>
            <p style={pBody}>{`Ça arrive à tout le monde, vraiment. Un message de trop ne fait pas de toi quelqu'un de mauvais, et il ne te définit pas. Tu peux revenir vers la personne, expliquer que ça a réagi plus vite que toi, réparer. Une relation se joue rarement sur un seul message, mais sur ce qu'on fait après.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Quand réagir à chaud devient un schéma
            </h2>
            <p style={pBody}>{`Si tu te retrouves souvent à réparer après coup, si cette réactivité te coûte dans tes liens et te pèse, ce n'est pas une fatalité ni un défaut de caractère. Un psychologue peut t'aider à comprendre ce qui se rejoue dans ces moments.`}</p>
            <p style={pBody}>{`Et si la détresse est forte, tu peux contacter le 3114, le numéro national de prévention du suicide, gratuit, confidentiel, ouvert 24h/24.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              TRACÉA, pour l&apos;instant juste avant de réagir
            </h2>
            <p style={pBody}>{`TRACÉA est un outil de régulation émotionnelle pensé pour ces secondes où ça monte et où tu allais répondre à chaud. Pas pour te faire la morale. Pour te donner quelque chose à faire avec ton corps, tout de suite, le temps de redevenir celle qui choisit.`}</p>
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
