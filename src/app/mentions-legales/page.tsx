"use client";

import Link from "next/link";

export default function MentionsLegales() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="section-label">Informations légales</p>
      <h1 className="section-title">Mentions légales</h1>
      <p className="text-xs text-warm-gray mb-8">
        Dernière mise à jour : 25 mars 2026
      </p>

      <div className="space-y-8 font-body text-base text-espresso leading-relaxed">
        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            1. Éditeur de l&apos;application
          </h2>
          <div className="card-base space-y-2">
            <p>
              <strong>Nom du projet :</strong> TRACEA
            </p>
            <p>
              <strong>Statut :</strong> Application en cours de développement
              (prototype / MVP)
            </p>
            <p>
              <strong>Responsable de la publication :</strong>{" "}
              [Nom du responsable à compléter]
            </p>
            <p>
              <strong>Adresse :</strong> [Adresse à compléter]
            </p>
            <p>
              <strong>Email de contact :</strong>{" "}
              [contact@tracea.fr · à compléter]
            </p>
            <p>
              <strong>SIRET :</strong> [À compléter lors de
              l&apos;immatriculation]
            </p>
          </div>
          <p className="text-sm text-warm-gray mt-2 italic">
            Note : Ces informations devront être complétées avant toute mise en
            ligne publique, conformément à l&apos;article 6 de la loi n°
            2004-575 du 21 juin 2004 (LCEN).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            2. Hébergement
          </h2>
          <div className="card-base space-y-2">
            <p>
              <strong>Hébergeur :</strong> [À compléter, ex : Vercel Inc., OVH,
              Scaleway]
            </p>
            <p>
              <strong>Adresse :</strong> [Adresse de l&apos;hébergeur]
            </p>
            <p>
              <strong>Localisation des données :</strong> Les données des
              utilisateurs sont conservées dans une base de données PostgreSQL
              sécurisée, hébergée à Francfort (Allemagne, UE) via la plateforme
              Supabase. L&apos;analyse IA des sessions est réalisée par
              l&apos;API Claude d&apos;Anthropic (serveurs aux États-Unis),
              dans le cadre de clauses contractuelles types (SCC).
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            3. Propriété intellectuelle
          </h2>
          <p>
            La méthode TRACEA, son protocole en six étapes (Traverser,
            Reconnaître, Ancrer, Conscientiser, Émerger, Aligner), ses
            fondements conceptuels, ses outils et supports écrits sont protégés
            par un dépôt d&apos;enveloppe Soleau auprès de l&apos;Institut
            National de la Propriété Industrielle (INPI).
          </p>
          <p className="mt-2">
            L&apos;ensemble des contenus de cette application (textes,
            illustrations, charte graphique, code source) sont la propriété
            exclusive de l&apos;éditeur. Toute reproduction, représentation,
            modification ou exploitation, totale ou partielle, est interdite
            sans autorisation préalable écrite.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            4. Nature de l&apos;application
          </h2>
          <div className="safety-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0" />
              <span className="font-medium text-sm text-terra-dark font-sans">
                Avertissement important
              </span>
            </div>
            <p>
              TRACEA est un outil d&apos;exploration émotionnelle structurée et
              de régulation psycho-émotionnelle. Elle ne constitue en aucun cas :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>une psychothérapie ou un acte médical,</li>
              <li>un dispositif médical au sens du règlement (UE) 2017/745,</li>
              <li>
                un traitement ou un diagnostic de troubles psychologiques ou
                psychiatriques,
              </li>
              <li>un substitut à un suivi professionnel de santé mentale.</li>
            </ul>
            <p className="mt-2">
              En cas de détresse psychologique sévère, contactez le{" "}
              <strong>3114</strong> (numéro national de prévention du suicide)
              ou consultez un professionnel de santé.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            5. Protection des données personnelles
          </h2>
          <p>
            L&apos;application TRACEA traite des données personnelles et des
            données sensibles (données relatives à la santé psychologique et
            émotionnelle) au sens de l&apos;article 9 du Règlement Général sur
            la Protection des Données (RGPD, Règlement (UE) 2016/679).
          </p>
          <p className="mt-2">
            Pour en savoir plus sur la collecte, le traitement et la protection
            de vos données, consultez notre{" "}
            <Link
              href="/politique-confidentialite"
              className="text-terra hover:text-terra-dark underline"
            >
              Politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            6. Droit applicable et juridiction
          </h2>
          <p>
            Les présentes mentions légales sont soumises au droit français.
            Tout litige relatif à l&apos;utilisation de l&apos;application
            TRACEA sera soumis à la compétence exclusive des tribunaux français.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-beige-dark flex flex-wrap gap-4 text-sm">
        <Link
          href="/politique-confidentialite"
          className="text-terra hover:text-terra-dark"
        >
          Politique de confidentialité
        </Link>
        <Link
          href="/conditions-utilisation"
          className="text-terra hover:text-terra-dark"
        >
          Conditions d&apos;utilisation
        </Link>
      </div>
    </div>
  );
}
