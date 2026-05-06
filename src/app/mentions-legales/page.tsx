"use client";

import Link from "next/link";

export default function MentionsLegales() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="section-label">Informations légales</p>
      <h1 className="section-title">Mentions légales — TRACÉA</h1>
      <div className="text-xs text-warm-gray mt-4 mb-8 space-y-1">
        <p>
          <strong>Dernière mise à jour :</strong> 6 mai 2026
        </p>
        <p>
          <strong>Site :</strong> www.methodetracea.fr
        </p>
        <p>
          <strong>Application :</strong> www.methodetracea.fr/app
        </p>
      </div>

      <div className="space-y-8 font-body text-base text-espresso leading-relaxed">
        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            1. Éditeur du site et de l&apos;application
          </h2>
          <p>
            Le site www.methodetracea.fr et l&apos;application
            www.methodetracea.fr/app sont édités par :
          </p>
          <div className="card-base space-y-1 mt-3">
            <p>
              <strong>SIRE Alyson Jeanne Louise</strong>
            </p>
            <p>Entrepreneur individuel</p>
            <p>
              Nom commercial : <strong>TRACEA</strong>
            </p>
            <p>
              SIREN : <strong>512 468 174</strong>
            </p>
            <p>
              SIRET : <strong>51246817400036</strong>
            </p>
            <p>
              Code APE : <strong>5811Z — Édition de livres</strong>
            </p>
            <p>
              Adresse :{" "}
              <strong>
                57 chemin des Marronniers, 81630 Salvagnac, France
              </strong>
            </p>
          </div>
          <p className="mt-3">
            TVA non applicable, art. 293 B du Code général des impôts.
          </p>
          <p className="mt-3">
            Email de contact :{" "}
            <strong>contact@methodetracea.fr</strong>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            2. Responsable de la publication
          </h2>
          <p>La responsable de la publication est :</p>
          <p className="mt-2">
            <strong>Alyson Sire</strong>
          </p>
          <p className="mt-2">
            Contact : <strong>contact@methodetracea.fr</strong>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            3. Hébergement
          </h2>
          <p>Le site et l&apos;application TRACÉA sont hébergés par :</p>
          <div className="card-base space-y-1 mt-3">
            <p>
              <strong>Vercel Inc.</strong>
            </p>
            <p>440 N Barranca Ave #4133</p>
            <p>Covina, CA 91723</p>
            <p>États-Unis</p>
          </div>
          <p className="mt-3">Site : www.vercel.com</p>
          <p className="mt-3">
            La base de données et l&apos;authentification sont gérées via
            Supabase, en région{" "}
            <strong>West EU — Ireland — eu-west-1</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            4. Contact
          </h2>
          <p>Pour toute question générale concernant TRACÉA :</p>
          <p className="mt-2">
            <strong>contact@methodetracea.fr</strong>
          </p>
          <p className="mt-3">
            Pour toute demande relative aux données personnelles :
          </p>
          <p className="mt-2">
            <strong>confidentialite@methodetracea.fr</strong>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            5. Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble des éléments présents sur le site et
            l&apos;application TRACÉA, notamment les textes, méthodes, noms,
            parcours, interfaces, contenus, ressources, éléments visuels,
            architecture éditoriale et éléments de marque, sont protégés par
            le droit de la propriété intellectuelle.
          </p>
          <p className="mt-3">
            Le nom TRACÉA, la méthode, les contenus associés et les éléments
            originaux de l&apos;application sont la propriété de leur
            éditrice, sauf mention contraire.
          </p>
          <p className="mt-3">
            Toute reproduction, représentation, modification, adaptation,
            diffusion, extraction ou réutilisation, totale ou partielle, des
            contenus de TRACÉA sans autorisation écrite préalable est
            interdite.
          </p>
          <p className="mt-3">
            L&apos;utilisateur conserve naturellement ses droits sur les
            contenus personnels qu&apos;il saisit dans l&apos;application.
            Ces contenus sont traités uniquement dans les conditions prévues
            par la Politique de confidentialité.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            6. Nature du service
          </h2>
          <p>
            TRACÉA est une application de régulation émotionnelle, de retour
            au corps et de suivi personnel des traversées émotionnelles.
          </p>
          <p className="mt-3">
            TRACÉA n&apos;est pas une thérapie, un dispositif médical, un
            service de diagnostic, un acte de soin, un service d&apos;urgence
            ou un substitut à un accompagnement médical, psychologique ou
            psychiatrique.
          </p>
          <p className="mt-3">
            Les contenus proposés dans TRACÉA ont une finalité
            d&apos;accompagnement, de structuration personnelle et de soutien
            à la régulation émotionnelle. Ils ne remplacent pas l&apos;avis
            d&apos;un professionnel de santé ou d&apos;un service
            d&apos;urgence compétent.
          </p>
          <div className="safety-card mt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0" />
              <span className="font-medium text-sm text-terra-dark font-sans">
                Urgence et situations de détresse
              </span>
            </div>
            <p>
              En cas de danger immédiat, de crise grave, de détresse aiguë,
              de risque suicidaire ou de besoin médical urgent,
              l&apos;utilisateur doit contacter les services d&apos;urgence
              ou un professionnel compétent.
            </p>
            <p className="mt-3">
              En France, en cas d&apos;idées suicidaires ou de détresse
              suicidaire, l&apos;utilisateur peut contacter le{" "}
              <strong>3114</strong>, numéro national de prévention du suicide.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            7. Données personnelles
          </h2>
          <p>
            Les traitements de données personnelles réalisés dans le cadre de
            TRACÉA sont décrits dans la{" "}
            <Link
              href="/politique-confidentialite"
              className="text-terra hover:text-terra-dark underline"
            >
              Politique de confidentialité
            </Link>{" "}
            accessible sur le site et dans l&apos;application.
          </p>
          <p className="mt-3">
            Pour toute demande relative aux données personnelles,
            l&apos;utilisateur peut écrire à :
          </p>
          <p className="mt-2">
            <strong>confidentialite@methodetracea.fr</strong>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            8. Conditions d&apos;utilisation et abonnement
          </h2>
          <p>
            L&apos;utilisation de TRACÉA est encadrée par les{" "}
            <Link
              href="/conditions-utilisation"
              className="text-terra hover:text-terra-dark underline"
            >
              Conditions d&apos;utilisation
            </Link>{" "}
            accessibles sur le site et dans l&apos;application.
          </p>
          <p className="mt-3">
            Les conditions applicables à l&apos;abonnement Premium, à
            l&apos;essai gratuit, au paiement, à la résiliation et à
            l&apos;accès au service sont précisées dans les Conditions
            d&apos;utilisation.
          </p>
          <p className="mt-3">
            L&apos;utilisateur est invité à les consulter avant
            d&apos;utiliser le service ou de souscrire un abonnement.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            9. Médiation de la consommation
          </h2>
          <p>
            Conformément aux dispositions du Code de la consommation relatives
            au règlement amiable des litiges, l&apos;utilisateur consommateur
            peut recourir gratuitement à un médiateur de la consommation en
            cas de litige non résolu avec TRACÉA.
          </p>
          <p className="mt-3">
            Avant toute saisine du médiateur, l&apos;utilisateur doit
            d&apos;abord adresser une réclamation écrite à TRACÉA à
            l&apos;adresse suivante :
          </p>
          <p className="mt-2">
            <strong>contact@methodetracea.fr</strong>
          </p>
          <p className="mt-3">Médiateur de la consommation compétent :</p>
          <div className="card-base space-y-1 mt-3">
            <p>
              <strong>CM2C</strong>
            </p>
            <p>49 rue de Ponthieu</p>
            <p>75008 Paris</p>
            <p>France</p>
            <p>
              Site : <strong>www.cm2c.net</strong>
            </p>
            <p>
              Téléphone : <strong>01 89 47 00 14</strong>
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            10. Droit applicable
          </h2>
          <p>
            Les présentes mentions légales sont soumises au droit français.
          </p>
          <p className="mt-3">
            En cas de litige, les règles de compétence applicables sont
            celles prévues par le droit français.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            11. Signalement
          </h2>
          <p>
            Pour signaler une erreur, un contenu problématique, un
            dysfonctionnement ou une question relative au site ou à
            l&apos;application :
          </p>
          <p className="mt-2">
            <strong>contact@methodetracea.fr</strong>
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
