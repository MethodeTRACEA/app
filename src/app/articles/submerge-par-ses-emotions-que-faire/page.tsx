import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { SafetyResources } from "@/components/SafetyResources";

// Page serveur : porte la metadata SEO de l'article.
// Contenu repris au mot près du fichier source
// Articles/article_submerge_par_ses_emotions.md
export const metadata: Metadata = {
  title: "Submergé par ses émotions : que faire dans le moment | TRACÉA",
  description:
    "Quand une émotion déborde et que réfléchir ne suffit plus : comprendre ce qui se passe et un geste concret à poser, tout de suite. Pas une thérapie.",
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

export default function ArticleSubmergeParSesEmotions() {
  return (
    <div style={pageStyle}>
      <div style={haloStyle} aria-hidden="true" />

      <article style={containerStyle}>
        <h1 className="font-serif" style={h1Style}>
          Quand une émotion te submerge : que faire dans le moment
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginTop: 32,
          }}
        >
          <p style={pBody}>{`Il y a des moments où une émotion prend toute la place. La colère qui monte d'un coup. L'angoisse qui serre. Le trop-plein qui déborde sans prévenir. Le corps s'emballe, les pensées tournent en boucle, et réfléchir ne suffit plus.`}</p>
          <p style={pBody}>{`Si tu cherches quoi faire dans ces moments-là, la réponse tient en une idée simple. Ne commence pas par la tête. Commence par le corps, par un geste concret, là, maintenant. Le reste peut attendre que ce soit un peu retombé.`}</p>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Être submergé, ça ressemble à quoi
            </h2>
            <p style={pBody}>{`Tu connais sûrement la sensation. La poitrine qui se serre. Le souffle qui se coupe. Cette impression de pouvoir exploser, ou au contraire de t'éteindre. Les mots des autres qui deviennent trop. Une envie de répondre tout de suite, fort, quitte à le regretter juste après.`}</p>
            <p style={pBody}>{`Ce n'est pas un défaut de caractère, et ce n'est pas un manque de volonté. Quand une émotion déborde, le système nerveux passe en alerte. C'est mécanique. Le corps réagit avant même que tu aies eu le temps de décider quoi que ce soit.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Pourquoi réfléchir ne suffit pas quand ça déborde
            </h2>
            <p style={pBody}>{`Dans ces moments, se raisonner glisse. Se dire "calme-toi" ne marche pas, et c'est normal. Quand l'activation est haute, la partie du cerveau qui réfléchit posément devient difficile à joindre. C'est pour ça que les conseils du genre "prends du recul" tombent à plat, pile au moment où tu en aurais besoin.`}</p>
            <p style={pBody}>{`D'où l'intérêt de changer de porte d'entrée. Pas la pensée. Le corps. C'est souvent par là que quelque chose redevient possible.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Que faire, là, maintenant
            </h2>
            <p style={pBody}>{`Quelques appuis simples, à essayer sans rien forcer.`}</p>
            <p style={pBody}>{`Tu peux revenir à un point de contact physique. Sentir tes pieds sur le sol. La chaise sous toi. Une surface dure sous ta main. C'est concret, c'est là, ça ne demande pas de réfléchir.`}</p>
            <p style={pBody}>{`Tu peux ralentir un peu ton souffle, si c'est possible, en laissant l'air entrer comme il veut. Sans technique compliquée. Juste un peu moins vite.`}</p>
            <p style={pBody}>{`Et tu peux poser un mot sur ce qui se passe. "Je suis en colère." "J'ai peur." "Je suis saturée." Nommer, ça ne fait pas disparaître l'émotion, mais ça remet un tout petit peu de distance entre elle et toi.`}</p>
            <p style={pBody}>{`L'idée n'est pas de faire taire ce que tu ressens. C'est d'avoir quelque chose à faire pendant que c'est là, pour ne pas être complètement emportée.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Et après, quand c&apos;est un peu retombé
            </h2>
            <p style={pBody}>{`Quand l'intensité baisse, tu peux regarder, doucement, ce qui s'est joué. Pas pour t'analyser pendant des heures. Juste voir ce qui a déclenché, et ce dont tu avais besoin sur le moment. De souffler un peu ? D'être entendue ? De poser une limite ?`}</p>
            <p style={pBody}>{`Et tu n'es pas obligée de rester seule avec. En parler à une personne de confiance, c'est déjà déposer une partie du poids.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              Quand ce n&apos;est pas qu&apos;un moment
            </h2>
            <p style={pBody}>{`Si ces débordements reviennent souvent, s'ils prennent trop de place, ou si tu te sens vraiment en détresse, ce n'est pas une faiblesse, et tu n'as pas à gérer ça seule. Un médecin ou un psychologue est la bonne ressource pour t'accompagner sur la durée.`}</p>
            <p style={pBody}>{`Et si la détresse est forte, tu peux contacter le 3114, le numéro national de prévention du suicide, gratuit, confidentiel, ouvert 24h/24.`}</p>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}
          >
            <h2 className="font-serif" style={h2Style}>
              TRACÉA, pour ces moments précis
            </h2>
            <p style={pBody}>{`TRACÉA est un outil de régulation émotionnelle né exactement pour ça. Pas pour t'expliquer pourquoi tu ressens ce que tu ressens. Pour te donner quelque chose à faire avec ton corps, tout de suite, même quand tu n'arrives plus à réfléchir.`}</p>
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
