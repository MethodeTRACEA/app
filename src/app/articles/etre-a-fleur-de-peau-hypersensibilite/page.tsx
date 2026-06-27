import type { Metadata } from "next";
import Link from "next/link";
import { SafetyResources } from "@/components/SafetyResources";

// Page serveur : porte la metadata SEO de l'article.
// Contenu repris au mot près du fichier source
// Articles/article_etre_a_fleur_de_peau.md
export const metadata: Metadata = {
  title: "Être à fleur de peau : vivre avec l'hypersensibilité | TRACÉA",
  description:
    "Tu ressens tout plus fort, le moindre imprévu te submerge ? Comprendre l'hypersensibilité au quotidien et des appuis concrets quand ça monte. Pas une thérapie.",
};

export default function ArticleEtreAFleurDePeau() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="section-title">
        Être à fleur de peau : comprendre l&apos;hypersensibilité au quotidien
      </h1>

      <div className="space-y-8 font-body text-base text-espresso leading-relaxed mt-6">
        <p>{`Un bruit de trop. Une remarque anodine. Une journée déjà trop pleine. Et d'un coup, c'est trop. Tu te sens à fleur de peau, à vif, prête à craquer pour quelque chose qui paraît minuscule vu de l'extérieur.`}</p>
        <p>{`Si tu ressens les choses plus fort que la plupart des gens autour de toi, tu n'es pas en train d'exagérer, et tu n'es pas seule. Voici ce qui se passe, et ce que tu peux faire quand ça déborde.`}</p>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Être à fleur de peau, c&apos;est quoi
          </h2>
          <p>{`C'est quand ton seuil est vite atteint. Les émotions montent vite et fort. Les sons, les lumières, les tensions des autres, tout entre sans filtre et prend beaucoup de place. Une contrariété que d'autres balaieraient d'un haussement d'épaules peut, chez toi, occuper toute la pièce.`}</p>
          <p>{`On appelle souvent ça l'hypersensibilité, ou la grande sensibilité. Ce n'est pas une faiblesse, ni un caprice. C'est une manière de fonctionner, avec laquelle beaucoup de personnes vivent.`}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Pourquoi tu ressens tout plus fort
          </h2>
          <p>{`Chez les personnes très sensibles, le système nerveux capte énormément d'informations en même temps, et les trie moins. Là où certains filtrent le bruit de fond sans y penser, toi tu reçois tout, en pleine intensité. Les émotions des autres, les détails, les ambiances.`}</p>
          <p>{`Ce n'est ni une maladie, ni quelque chose que tu fais exprès. C'est un trait qui concerne une part importante de la population. Le souci n'est pas de ressentir beaucoup. C'est de ne pas savoir quoi faire quand ça déborde.`}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Ces moments où ça déborde d&apos;un coup
          </h2>
          <p>{`Tu les connais. La notification de trop. Le bruit qui devient insupportable. Quelqu'un qui parle alors que tu n'as plus de place mentale. L'imprévu qui s'ajoute à une journée déjà saturée.`}</p>
          <p>
            {`Souvent, ce n'est pas un gros événement qui fait craquer. C'est la petite chose en plus, posée sur tout ce que tu portais déjà sans le dire. C'est exactement ce genre de moment où `}
            <Link
              href="/articles/submerge-par-ses-emotions-que-faire"
              className="text-terra underline"
            >
              une émotion te submerge
            </Link>
            {` sans prévenir.`}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Que faire quand tu sens que tu vas craquer
          </h2>
          <p>{`Quelques appuis, à essayer sans rien forcer.`}</p>
          <p>{`Si c'est possible, baisse un peu le volume autour de toi. Sortir deux minutes. T'éloigner du bruit. Fermer une porte. Réduire ce qui entre, même un tout petit peu, change déjà quelque chose.`}</p>
          <p>{`Tu peux revenir à ton corps. Sentir tes pieds sur le sol, le contact d'une surface sous ta main. Ralentir ton souffle si tu peux, sans technique compliquée, juste un peu moins vite.`}</p>
          <p>{`Et tu peux mettre un mot sur ce qui se passe. "Je suis saturée." "C'est trop, là." Le dire, même seulement dans ta tête, remet une petite distance.`}</p>
          <p>{`Rien de tout ça ne supprime ta sensibilité, et ce n'est pas le but. L'idée, c'est d'avoir quelque chose à faire pendant le pic, pour le traverser sans tout faire exploser.`}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Vivre avec, sans se reprocher d&apos;être comme ça
          </h2>
          <p>{`Ta sensibilité n'a pas que des moments difficiles. C'est aussi elle qui te fait percevoir ce que les autres ne voient pas, ressentir profondément, être présente aux gens. Le problème n'est pas toi.`}</p>
          <p>{`Ce qui aide, sur la durée, c'est d'apprendre à protéger tes limites. Doser les stimulations quand tu peux. T'autoriser des pauses sans culpabiliser. Ne pas passer tes journées à te sur-adapter à un rythme qui n'est pas le tien.`}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            Quand c&apos;est trop lourd à porter
          </h2>
          <p>{`Si cette sensibilité te fait souffrir au quotidien, si tu te sens débordée presque tout le temps, ou si tu traverses une vraie détresse, ce n'est pas une faiblesse, et tu n'as pas à gérer ça seule. Un médecin ou un psychologue peut t'aider à y voir clair et à t'accompagner.`}</p>
          <p>{`Et si la détresse est forte, tu peux contacter le 3114, le numéro national de prévention du suicide, gratuit, confidentiel, ouvert 24h/24.`}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-espresso">
            TRACÉA, pour les moments où ça déborde
          </h2>
          <p>{`TRACÉA est un outil de régulation émotionnelle pensé pour ces instants précis. Pas pour t'expliquer pourquoi tu es comme ça. Pour te donner quelque chose à faire avec ton corps, tout de suite, quand la sensibilité passe en trop-plein.`}</p>
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
