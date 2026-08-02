import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { SafetyResources } from "@/components/SafetyResources";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, articleBreadcrumbJsonLd } from "@/lib/structured-data";

// Page serveur : porte la metadata SEO de l'article.
// Contenu repris au mot près du fichier source
// article_systeme_nerveux_explique_simplement.md (3 corrections doctrine
// TRACÉA appliquées sur un verbe banni du wording).
// Article PILIER du cluster "système nerveux".
export const metadata: Metadata = {
  title: "Ton système nerveux, expliqué simplement (sans jargon) | TRACÉA",
  description:
    "Ton corps réagit avant toi, trop fort, sans prévenir ? Comprendre ton système nerveux en langage de tous les jours, et des appuis quand ça déborde. Pas une thérapie.",
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

export default function ArticleSystemeNerveux() {
  const slug = "systeme-nerveux-explique-simplement";
  const headline = "Ton système nerveux, expliqué simplement";
  const image = "article-systeme-nerveux.jpg";
  const imageAlt =
    "Une petite lampe allumée seule dans une pièce sombre, près d'une fenêtre au crépuscule.";
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
          Ton système nerveux, expliqué simplement
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginTop: 32,
          }}
        >
          <p style={pBody}>{`On te dit peut-être, en ce moment, de « réguler ton système nerveux ». La phrase est partout. Mais on t'explique rarement ce que ça veut dire, vraiment, quand on n'est pas médecin.`}</p>
          <p style={pBody}>{`Alors voilà, en langage de tous les jours. Ce qu'est ton système nerveux, pourquoi ton corps réagit parfois avant toi, et ce que tu peux faire dans les moments où ça déborde. Sans jargon, et sans te promettre que tout ira mieux en deux minutes.`}</p>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Ton système nerveux, c&apos;est quoi
            </h2>
            <p style={pBody}>{`C'est la partie de toi qui surveille, en permanence, si tu es en sécurité ou non. Elle tourne en fond, sans que tu y penses, comme un veilleur qui ne dort jamais. Elle lit ton environnement, les visages, les tons de voix, ce qui se passe dans ton corps, et elle décide, plus vite que ta pensée, comment réagir.`}</p>
            <p style={pBody}>{`Quand tout va bien, tu ne la remarques pas. Quand elle perçoit une menace, même petite, même pas réelle, elle te met en alerte. Le cœur qui accélère, la gorge qui serre, l'envie de partir ou de répondre trop fort. Ce n'est pas toi qui décides ça. C'est plus rapide que toi.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Pourquoi ton corps réagit avant toi
            </h2>
            <p style={pBody}>{`Parce que ce veilleur est fait pour te protéger, pas pour avoir raison. Il préfère se tromper cent fois en te mettant en alerte pour rien, plutôt que de rater une seule vraie menace. C'est ancien, c'est physiologique, et ça ne se raisonne pas dans l'instant.`}</p>
            <p style={pBody}>{`C'est pour ça qu'on peut « savoir » qu'il n'y a pas de danger et sentir quand même son corps s'emballer. Le message ne passe pas dans ce sens. Le corps a déjà réagi avant que la tête ait fini d'analyser. Ce n'est pas de l'exagération, ni un manque de contrôle. C'est ce que ton corps encaisse, à sa manière, quand quelque chose le dépasse.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Ce que ton corps encaisse sans que personne le voie
            </h2>
            <p style={pBody}>{`Une journée normale, c'est déjà beaucoup pour ce veilleur. Un message sec, un imprévu, un bruit de trop, une réunion où il faut tenir. Chaque fois, il se met un peu en tension, puis il retombe, puis il recommence.`}</p>
            <p style={pBody}>
              {`Le problème, ce n'est pas une seule alerte. C'est l'addition. À force, il reste allumé plus longtemps, il retombe moins bien, et il te reste de moins en moins de marge. C'est ce moment où une petite chose suffit à tout faire déborder, alors que vue de l'extérieur, elle n'était vraiment pas grand-chose. Ce que tu vis là, c'est souvent ce qu'on appelle aussi `}
              <Link
                href="/articles/charge-mentale-plus-aucune-marge"
                style={linkInline}
              >
                la charge mentale
              </Link>
              {`, quand il n'y a plus rien en réserve.`}
            </p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Pas un hack, pas un reset
            </h2>
            <p style={pBody}>{`Tu vas croiser beaucoup de vidéos qui promettent de « réinitialiser » ton système nerveux, de le « calmer en 30 secondes », de te vendre le geste miracle. Méfie-toi de ces promesses.`}</p>
            <p style={pBody}>{`Ton système nerveux n'est pas un bug à corriger, ni une machine à redémarrer. C'est une partie vivante de toi, avec une histoire, la tienne. On ne le répare pas d'un clic. Ce qui existe, en revanche, c'est des appuis. Des choses concrètes à poser dans le moment, qui n'effacent rien mais qui font que le pic ne t'emporte pas complètement. C'est plus modeste qu'un miracle. C'est aussi beaucoup plus honnête.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Que faire dans le moment où ça déborde
            </h2>
            <p style={pBody}>{`Quand tu sens que ça monte, tu peux essayer, sans rien forcer.`}</p>
            <p style={pBody}>{`Tu peux revenir à ton corps plutôt qu'à tes pensées. Sentir tes pieds sur le sol, le poids de tes mains, l'air qui entre et qui sort. Ça paraît trop simple, et c'est justement pour ça que ça marche au moment où réfléchir devient impossible. Tu ne demandes pas à ta tête de se calmer. Tu donnes à ton corps un point d'appui.`}</p>
            <p style={pBody}>{`Tu peux ralentir une seconde avant de répondre, de cliquer, de partir. Juste laisser un peu d'espace entre ce que tu ressens et ce que tu fais. C'est souvent dans cet espace minuscule que tu retrouves un choix.`}</p>
            <p style={pBody}>{`Et sois honnête avec toi. Ça ne fait pas disparaître ce que tu traverses. Aucun geste ne le fait. Mais ça t'aide à traverser le pic sans qu'il t'emporte, et dans l'instant, c'est déjà énorme.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Et sur la durée
            </h2>
            <p style={pBody}>{`Ton système nerveux apprend. À force de vivre des moments où tu débordes puis où tu retrouves un appui, il enregistre, tout doucement, qu'il existe un chemin de retour. Ce n'est pas magique et ça ne va pas vite. Ça ressemble plus à un sentier qu'on trace en marchant dessus plusieurs fois qu'à un interrupteur.`}</p>
            <p style={pBody}>{`C'est pour ça qu'un outil comme TRACÉA n'essaie pas de te transformer. Il te propose juste d'être là, à chaque fois que ça déborde, avec le même appui, jusqu'à ce que le chemin devienne un peu plus familier.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Quand c&apos;est trop lourd
            </h2>
            <p style={pBody}>{`Si ton corps reste en alerte tout le temps, si l'alerte ne retombe plus, si l'épuisement s'installe et ne part plus, ce n'est pas une faiblesse. C'est un signal à écouter. Un médecin ou un psychologue peut t'aider à y voir clair.`}</p>
            <p style={pBody}>{`Et si la détresse est forte, tu peux contacter le 3114, le numéro national de prévention du suicide, gratuit, confidentiel, ouvert 24h/24.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              TRACÉA, pour les moments où ça déborde
            </h2>
            <p style={pBody}>{`TRACÉA est un outil de régulation émotionnelle pensé pour ces instants où ton corps réagit avant toi et où tout prend trop de place d'un coup. Pas pour analyser, pas pour te réparer. Pour te donner quelque chose à faire avec ton corps, tout de suite, quand il n'y a plus de marge.`}</p>
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
