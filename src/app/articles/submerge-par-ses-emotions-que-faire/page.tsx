import type { Metadata } from "next";
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

export default function ArticleSubmergeParSesEmotions() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="section-title">
        Quand une émotion te submerge : que faire dans le moment
      </h1>

      <div className="space-y-8 font-body text-base text-espresso leading-relaxed mt-6">
        <p>{`Il y a des moments où une émotion prend toute la place. La colère qui monte d'un coup. L'angoisse qui serre. Le trop-plein qui déborde sans prévenir. Le corps s'emballe, les pensées tournent en boucle, et réfléchir ne suffit plus.`}</p>
        <p>{`Si tu cherches quoi faire dans ces moments-là, la réponse tient en une idée simple. Ne commence pas par la tête. Commence par le corps, par un geste concret, là, maintenant. Le reste peut attendre que ce soit un peu retombé.`}</p>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Être submergé, ça ressemble à quoi
          </h2>
          <p>{`Tu connais sûrement la sensation. La poitrine qui se serre. Le souffle qui se coupe. Cette impression de pouvoir exploser, ou au contraire de t'éteindre. Les mots des autres qui deviennent trop. Une envie de répondre tout de suite, fort, quitte à le regretter juste après.`}</p>
          <p>{`Ce n'est pas un défaut de caractère, et ce n'est pas un manque de volonté. Quand une émotion déborde, le système nerveux passe en alerte. C'est mécanique. Le corps réagit avant même que tu aies eu le temps de décider quoi que ce soit.`}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Pourquoi réfléchir ne suffit pas quand ça déborde
          </h2>
          <p>{`Dans ces moments, se raisonner glisse. Se dire "calme-toi" ne marche pas, et c'est normal. Quand l'activation est haute, la partie du cerveau qui réfléchit posément devient difficile à joindre. C'est pour ça que les conseils du genre "prends du recul" tombent à plat, pile au moment où tu en aurais besoin.`}</p>
          <p>{`D'où l'intérêt de changer de porte d'entrée. Pas la pensée. Le corps. C'est souvent par là que quelque chose redevient possible.`}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Que faire, là, maintenant
          </h2>
          <p>{`Quelques appuis simples, à essayer sans rien forcer.`}</p>
          <p>{`Tu peux revenir à un point de contact physique. Sentir tes pieds sur le sol. La chaise sous toi. Une surface dure sous ta main. C'est concret, c'est là, ça ne demande pas de réfléchir.`}</p>
          <p>{`Tu peux ralentir un peu ton souffle, si c'est possible, en laissant l'air entrer comme il veut. Sans technique compliquée. Juste un peu moins vite.`}</p>
          <p>{`Et tu peux poser un mot sur ce qui se passe. "Je suis en colère." "J'ai peur." "Je suis saturée." Nommer, ça ne fait pas disparaître l'émotion, mais ça remet un tout petit peu de distance entre elle et toi.`}</p>
          <p>{`L'idée n'est pas de faire taire ce que tu ressens. C'est d'avoir quelque chose à faire pendant que c'est là, pour ne pas être complètement emportée.`}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Et après, quand c'est un peu retombé
          </h2>
          <p>{`Quand l'intensité baisse, tu peux regarder, doucement, ce qui s'est joué. Pas pour t'analyser pendant des heures. Juste voir ce qui a déclenché, et ce dont tu avais besoin sur le moment. De souffler un peu ? D'être entendue ? De poser une limite ?`}</p>
          <p>{`Et tu n'es pas obligée de rester seule avec. En parler à une personne de confiance, c'est déjà déposer une partie du poids.`}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Quand ce n'est pas qu'un moment
          </h2>
          <p>{`Si ces débordements reviennent souvent, s'ils prennent trop de place, ou si tu te sens vraiment en détresse, ce n'est pas une faiblesse, et tu n'as pas à gérer ça seule. Un médecin ou un psychologue est la bonne ressource pour t'accompagner sur la durée.`}</p>
          <p>{`Et si la détresse est forte, tu peux contacter le 3114, le numéro national de prévention du suicide, gratuit, confidentiel, ouvert 24h/24.`}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            TRACÉA, pour ces moments précis
          </h2>
          <p>{`TRACÉA est un outil de régulation émotionnelle né exactement pour ça. Pas pour t'expliquer pourquoi tu ressens ce que tu ressens. Pour te donner quelque chose à faire avec ton corps, tout de suite, même quand tu n'arrives plus à réfléchir.`}</p>
          <p>{`C'est gratuit, sans compte pour commencer, en deux minutes.`}</p>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/start" className="btn-primary text-center">
            Commencer maintenant
          </Link>
          <Link href="/comment-ca-marche" className="btn-secondary text-center">
            Voir comment ça marche
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <SafetyResources />
      </div>
    </div>
  );
}
