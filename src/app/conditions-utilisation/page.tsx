"use client";

import Link from "next/link";

export default function ConditionsUtilisation() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="section-label">Cadre juridique</p>
      <h1 className="section-title">Conditions générales d&apos;utilisation</h1>
      <p className="text-xs text-warm-gray mb-8">
        Dernière mise à jour\u00A0: 25 mars 2026 · Version 1.0
      </p>

      <div className="space-y-8 font-body text-base text-espresso leading-relaxed">
        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            1. Objet
          </h2>
          <p>
            Les présentes conditions générales d&apos;utilisation (ci-après
            &laquo; CGU &raquo;) ont pour objet de définir les modalités et
            conditions d&apos;utilisation de l&apos;application TRACEA (ci-après
            &laquo; l&apos;Application &raquo;), ainsi que les droits et
            obligations de l&apos;utilisateur.
          </p>
          <p className="mt-2">
            L&apos;utilisation de l&apos;Application implique
            l&apos;acceptation pleine et entière des présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            2. Description de l&apos;Application
          </h2>
          <p>
            TRACEA est une application d&apos;exploration émotionnelle
            structurée et de régulation psycho-émotionnelle. Elle propose un
            protocole guidé en six étapes (Traverser, Reconnaître, Ancrer,
            Conscientiser, Émerger, Aligner) permettant à l&apos;utilisateur de
            traverser, comprendre et intégrer ses expériences émotionnelles.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            3. Avertissement sur la nature de l&apos;Application
          </h2>
          <div className="safety-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0" />
              <span className="font-medium text-sm text-terra-dark font-sans">
                Avertissement fondamental
              </span>
            </div>
            <p>
              TRACEA est un outil de développement personnel et
              d&apos;auto-exploration émotionnelle.{" "}
              <strong>
                Elle ne constitue pas un dispositif médical, une
                psychothérapie, un traitement, un diagnostic, ni un substitut
                à un suivi professionnel de santé mentale.
              </strong>
            </p>
            <p className="mt-3">
              L&apos;utilisateur reconnaît et accepte que :
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                L&apos;Application ne fournit aucun conseil médical ou
                psychologique personnalisé
              </li>
              <li>
                Les analyses générées sont des reformulations structurées, non
                des diagnostics
              </li>
              <li>
                L&apos;Application ne se substitue pas à l&apos;avis d&apos;un
                professionnel de santé
              </li>
              <li>
                En cas de détresse psychologique, l&apos;utilisateur doit
                contacter un professionnel ou le 3114
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            4. Accès et inscription
          </h2>
          <p>
            L&apos;Application est accessible à toute personne physique majeure
            (18 ans ou plus) disposant d&apos;un navigateur web compatible.
          </p>
          <p className="mt-2">
            L&apos;utilisation des fonctionnalités du protocole TRACEA est
            subordonnée à l&apos;acceptation des présentes CGU et au recueil
            du consentement explicite au traitement des données sensibles,
            conformément à l&apos;article 9 du RGPD.
          </p>
          <p className="mt-2">
            <strong>L&apos;Application est strictement réservée aux personnes
            majeures.</strong> L&apos;éditeur se réserve le droit de mettre en
            place des mécanismes de vérification d&apos;âge dans les versions
            futures.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            5. Obligations de l&apos;utilisateur
          </h2>
          <p>L&apos;utilisateur s&apos;engage à :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              Utiliser l&apos;Application conformément à sa finalité
              d&apos;exploration émotionnelle
            </li>
            <li>
              Ne pas utiliser l&apos;Application en remplacement d&apos;un
              suivi médical ou thérapeutique nécessaire
            </li>
            <li>
              Fournir des informations exactes lors du consentement
            </li>
            <li>
              Ne pas tenter d&apos;accéder aux données d&apos;autres
              utilisateurs ou de compromettre la sécurité de
              l&apos;Application
            </li>
            <li>
              Ne pas reproduire, copier ou diffuser le protocole TRACEA sans
              autorisation
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            6. Propriété intellectuelle
          </h2>
          <p>
            Le protocole TRACEA, sa méthode en six étapes, sa dénomination,
            ses fondements conceptuels et l&apos;ensemble des contenus de
            l&apos;Application sont protégés par le droit de la propriété
            intellectuelle et par un dépôt d&apos;enveloppe Soleau auprès de
            l&apos;INPI.
          </p>
          <p className="mt-2">
            L&apos;utilisateur bénéficie d&apos;une licence d&apos;utilisation
            personnelle, non exclusive, non transférable et révocable. Toute
            utilisation commerciale, reproduction ou adaptation du protocole
            est interdite sans autorisation écrite préalable.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            7. Responsabilité
          </h2>
          <p>
            L&apos;éditeur met tout en œuvre pour assurer le bon
            fonctionnement de l&apos;Application. Toutefois :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              L&apos;Application est fournie &laquo; en l&apos;état &raquo;,
              sans garantie d&apos;adéquation à un objectif particulier
            </li>
            <li>
              L&apos;éditeur ne saurait être tenu responsable des dommages
              directs ou indirects liés à l&apos;utilisation de
              l&apos;Application
            </li>
            <li>
              L&apos;utilisateur est seul responsable de l&apos;usage qu&apos;il
              fait du protocole et de ses résultats
            </li>
            <li>
              L&apos;éditeur ne saurait être responsable de la perte de
              données stockées localement
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            8. Protection des données personnelles
          </h2>
          <p>
            Le traitement des données personnelles est régi par notre{" "}
            <Link
              href="/politique-confidentialite"
              className="text-terra hover:text-terra-dark underline"
            >
              Politique de confidentialité
            </Link>
            , qui fait partie intégrante des présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            9. Modification des CGU
          </h2>
          <p>
            L&apos;éditeur se réserve le droit de modifier les présentes CGU
            à tout moment. Les utilisateurs seront informés de toute
            modification substantielle. La poursuite de l&apos;utilisation de
            l&apos;Application après notification vaut acceptation des
            nouvelles CGU.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            10. Résiliation
          </h2>
          <p>
            L&apos;utilisateur peut cesser d&apos;utiliser l&apos;Application
            à tout moment et supprimer l&apos;ensemble de ses données depuis
            la page Profil ou en effaçant les données de son navigateur.
          </p>
          <p className="mt-2">
            L&apos;éditeur se réserve le droit de suspendre ou supprimer
            l&apos;accès à l&apos;Application en cas de violation des présentes
            CGU.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            11. Droit applicable et litiges
          </h2>
          <p>
            Les présentes CGU sont soumises au droit français. En cas de litige,
            les parties s&apos;engagent à rechercher une solution amiable avant
            toute action judiciaire. À défaut, les tribunaux français seront
            seuls compétents.
          </p>
          <p className="mt-2">
            Conformément aux articles L. 611-1 et suivants du Code de la
            consommation, l&apos;utilisateur peut recourir à un médiateur de
            la consommation en cas de litige non résolu.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-beige-dark flex flex-wrap gap-4 text-sm">
        <Link
          href="/mentions-legales"
          className="text-terra hover:text-terra-dark"
        >
          Mentions légales
        </Link>
        <Link
          href="/politique-confidentialite"
          className="text-terra hover:text-terra-dark"
        >
          Politique de confidentialité
        </Link>
      </div>
    </div>
  );
}
