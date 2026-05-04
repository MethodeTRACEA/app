"use client";

import Link from "next/link";

export default function ConditionsUtilisation() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="section-label">Cadre juridique</p>
      <h1 className="section-title">
        Conditions d&apos;utilisation et d&apos;abonnement — TRACÉA
      </h1>
      <p className="font-body text-base text-espresso leading-relaxed mt-2">
        Version cible lancement public avec paiement Stripe actif
      </p>
      <div className="text-xs text-warm-gray mt-4 mb-8 space-y-1">
        <p>
          <strong>Dernière mise à jour :</strong> 2 mai 2026
        </p>
        <p>
          <strong>Site :</strong> www.methodetracea.fr
        </p>
        <p>
          <strong>Application :</strong> www.methodetracea.fr/app
        </p>
      </div>

      <div className="space-y-8 font-body text-base text-espresso leading-relaxed">
        <section className="space-y-3">
          <p>
            Les présentes Conditions d&apos;utilisation et d&apos;abonnement
            définissent les règles d&apos;accès et d&apos;utilisation du site
            www.methodetracea.fr et de l&apos;application TRACÉA accessible à
            l&apos;adresse www.methodetracea.fr/app.
          </p>
          <p>
            Elles encadrent également l&apos;essai Premium gratuit,
            l&apos;abonnement Premium, les modalités de paiement, de
            renouvellement, d&apos;annulation et de résiliation.
          </p>
          <p>
            En créant un compte, en utilisant TRACÉA, en activant un essai
            Premium ou en souscrivant un abonnement, l&apos;utilisateur
            reconnaît avoir pris connaissance des présentes Conditions et les
            accepter.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            1. Éditeur du service
          </h2>
          <p>TRACÉA est édité par :</p>
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
            2. Objet de TRACÉA
          </h2>
          <p>
            TRACÉA est une application de régulation émotionnelle, de retour
            au corps et de suivi personnel des traversées émotionnelles.
          </p>
          <p className="mt-3">L&apos;application propose notamment :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>des traversées courtes ;</li>
            <li>des traversées approfondies ;</li>
            <li>des exercices d&apos;urgence émotionnelle ;</li>
            <li>un historique de traces ;</li>
            <li>
              des synthèses ou miroirs générés avec l&apos;aide de
              l&apos;intelligence artificielle ;
            </li>
            <li>
              des repères personnels permettant d&apos;observer ce qui revient
              dans le temps.
            </li>
          </ul>
          <p className="mt-3">
            TRACÉA aide l&apos;utilisateur à poser des mots, revenir au corps,
            retrouver un appui simple et conserver des traces de son
            cheminement.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            3. Ce que TRACÉA n&apos;est pas
          </h2>
          <p>TRACÉA n&apos;est pas :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>une thérapie ;</li>
            <li>un dispositif médical ;</li>
            <li>un service de diagnostic ;</li>
            <li>un acte de soin ;</li>
            <li>
              une prise en charge psychologique, psychiatrique ou médicale ;
            </li>
            <li>un service d&apos;urgence ;</li>
            <li>un substitut à un professionnel de santé.</li>
          </ul>
          <p className="mt-3">
            Les contenus, exercices, synthèses ou propositions affichés dans
            l&apos;application ont une finalité d&apos;accompagnement
            personnel, de structuration et de soutien à la régulation
            émotionnelle. Ils ne doivent pas être interprétés comme un avis
            médical, un diagnostic ou une prescription.
          </p>
          <div className="safety-card mt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0" />
              <span className="font-medium text-sm text-terra-dark font-sans">
                Urgence et situations de détresse
              </span>
            </div>
            <p>
              En cas de danger immédiat, de détresse aiguë, de risque
              suicidaire, de violences, de crise grave ou de besoin médical
              urgent, l&apos;utilisateur doit contacter les services
              d&apos;urgence ou un professionnel compétent.
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
            4. Utilisateurs concernés
          </h2>
          <p>
            TRACÉA est destiné, dans sa version actuelle, aux personnes
            majeures, âgées de <strong>18 ans et plus</strong>.
          </p>
          <p className="mt-3">
            L&apos;utilisateur s&apos;engage à utiliser TRACÉA pour son usage
            personnel, dans le respect des présentes Conditions.
          </p>
          <p className="mt-3">
            TRACÉA n&apos;est pas destiné aux mineurs dans cette version. Les
            personnes mineures ne doivent pas créer de compte ni utiliser
            l&apos;application sans accord préalable et accompagnement
            d&apos;un représentant légal.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            5. Création de compte et accès
          </h2>
          <p>
            Certaines fonctionnalités de TRACÉA nécessitent la création
            d&apos;un compte utilisateur.
          </p>
          <p className="mt-3">
            Pour créer un compte, l&apos;utilisateur peut être amené à fournir
            une adresse email et à choisir un mot de passe. L&apos;authentification
            est gérée via Supabase Auth.
          </p>
          <p className="mt-3">L&apos;utilisateur est responsable :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>de l&apos;exactitude des informations fournies ;</li>
            <li>de la confidentialité de ses identifiants ;</li>
            <li>de l&apos;usage fait depuis son compte ;</li>
            <li>de la sécurité de son adresse email et de son mot de passe.</li>
          </ul>
          <p className="mt-3">
            L&apos;utilisateur s&apos;engage à ne pas partager son compte avec
            un tiers et à informer TRACÉA en cas d&apos;usage non autorisé
            suspecté.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            6. Fonctionnalités principales
          </h2>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            6.1 Traversée courte
          </h3>
          <p>
            La traversée courte est un parcours rapide destiné aux moments où
            l&apos;utilisateur ressent une activation émotionnelle importante
            ou une faible disponibilité mentale.
          </p>
          <p className="mt-3">
            Elle vise à aider l&apos;utilisateur à revenir au corps,
            identifier un ressenti proche, choisir un appui simple et terminer
            avec un geste faisable.
          </p>
          <p className="mt-3">
            La traversée courte est gratuite dans la version actuelle de
            TRACÉA.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            6.2 Exercices d&apos;urgence
          </h3>
          <p>
            TRACÉA propose des exercices d&apos;urgence émotionnelle et de
            retour au corps.
          </p>
          <p className="mt-3">Ces exercices sont gratuits dans la version actuelle.</p>
          <p className="mt-3">
            Ils ne constituent pas un service d&apos;urgence médicale,
            psychologique ou psychiatrique. En situation de danger, de crise
            grave ou de détresse aiguë, l&apos;utilisateur doit contacter les
            services compétents.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            6.3 Traversée approfondie
          </h3>
          <p>
            La traversée approfondie permet de suivre un parcours plus
            structuré autour des étapes TRACÉA :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Traverser ;</li>
            <li>Reconnaître ;</li>
            <li>Ancrer ;</li>
            <li>Conscientiser ;</li>
            <li>Émerger ;</li>
            <li>Aligner.</li>
          </ul>
          <p className="mt-3">
            Elle peut inclure une synthèse ou un miroir généré avec l&apos;aide
            de l&apos;intelligence artificielle.
          </p>
          <p className="mt-3">
            Une première traversée approfondie peut être accessible
            gratuitement selon les règles d&apos;accès en vigueur dans
            l&apos;application.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            6.4 Historique et traces
          </h3>
          <p>
            TRACÉA permet à l&apos;utilisateur de conserver certaines traces
            de ses traversées, notamment dans son historique.
          </p>
          <p className="mt-3">
            L&apos;historique a pour objectif de permettre à
            l&apos;utilisateur de relire ce qu&apos;il a traversé, sans
            transformer l&apos;application en diagnostic ou en interprétation
            psychologique.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            6.5 Repères dans le temps
          </h3>
          <p>
            Certaines fonctionnalités peuvent permettre d&apos;observer ce qui
            revient dans le temps : situations, ressentis, appuis, besoins ou
            gestes choisis.
          </p>
          <p className="mt-3">
            Ces repères restent descriptifs. TRACÉA ne pose pas de diagnostic
            et ne déduit pas une vérité psychologique sur l&apos;utilisateur.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            7. Intelligence artificielle
          </h2>
          <p>
            TRACÉA utilise l&apos;intelligence artificielle pour générer
            certaines synthèses, reformulations ou traces à partir des
            informations renseignées par l&apos;utilisateur.
          </p>
          <p className="mt-3">
            TRACÉA peut faire appel à un prestataire d&apos;intelligence
            artificielle, <strong>Anthropic</strong>, pour générer
            certains contenus d&apos;accompagnement, notamment le miroir
            de fin de traversée et les synthèses ou traces de session.
            Ces contenus ne constituent pas un diagnostic, un avis
            médical, une thérapie ou une décision automatisée produisant
            des effets juridiques au sens de la réglementation
            applicable. L&apos;utilisateur reste libre de ne pas suivre
            les propositions ou formulations générées.
          </p>
          <p className="mt-3">L&apos;IA peut notamment traiter :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>la situation décrite ;</li>
            <li>l&apos;émotion ou le ressenti sélectionné ;</li>
            <li>le besoin choisi ;</li>
            <li>l&apos;action ou le geste sélectionné ;</li>
            <li>certaines réponses libres saisies pendant la traversée.</li>
          </ul>
          <p className="mt-3">
            Les réponses générées par l&apos;IA peuvent être imparfaites,
            incomplètes ou ne pas correspondre entièrement au vécu de
            l&apos;utilisateur.
          </p>
          <p className="mt-3">
            L&apos;utilisateur reste libre de lire, ignorer, interpréter avec
            recul ou supprimer les éléments générés.
          </p>
          <p className="mt-3">
            L&apos;IA ne doit pas être considérée comme un professionnel de
            santé, un thérapeute, un conseiller juridique, un service
            d&apos;urgence ou une autorité de décision.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            8. Accès gratuit, essai Premium, bêta et abonnement
          </h2>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.1 Accès gratuit
          </h3>
          <p>
            TRACÉA propose certaines fonctionnalités gratuites, notamment la
            traversée courte, les exercices d&apos;urgence et, selon les
            règles en vigueur, une première traversée approfondie.
          </p>
          <p className="mt-3">
            Les fonctionnalités gratuites peuvent évoluer dans le temps, sous
            réserve d&apos;en informer les utilisateurs lorsque cela est
            nécessaire.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.2 Essai Premium 7 jours
          </h3>
          <p>
            TRACÉA propose un essai Premium gratuit de <strong>7 jours</strong>.
          </p>
          <p className="mt-3">Cet essai est :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>activé volontairement par l&apos;utilisateur ;</li>
            <li>sans carte bancaire ;</li>
            <li>sans prélèvement automatique ;</li>
            <li>limité à un seul essai par compte ;</li>
            <li>
              limité actuellement à <strong>5 traversées approfondies</strong>{" "}
              pendant la période d&apos;essai.
            </li>
          </ul>
          <p className="mt-3">
            À la fin de l&apos;essai, l&apos;accès Premium temporaire
            s&apos;arrête automatiquement. Aucun paiement n&apos;est prélevé à
            la fin de l&apos;essai.
          </p>
          <p className="mt-3">
            Après l&apos;essai gratuit, l&apos;utilisateur doit volontairement
            souscrire un abonnement Premium s&apos;il souhaite continuer à
            bénéficier des fonctionnalités Premium payantes. Aucun abonnement
            ne démarre automatiquement après l&apos;essai gratuit.
          </p>
          <p className="mt-3">
            Les traversées courtes et les exercices d&apos;urgence restent
            accessibles gratuitement selon les règles en vigueur.
          </p>
          <p className="mt-3">
            L&apos;utilisateur ne doit pas tenter de contourner la limite
            d&apos;un essai par compte, notamment par la création de comptes
            multiples, l&apos;usurpation d&apos;identité ou tout autre procédé
            abusif.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.3 Accès bêta
          </h3>
          <p>
            TRACÉA peut proposer un accès bêta à certains utilisateurs,
            notamment au moyen d&apos;un code ou d&apos;un accès spécifique.
          </p>
          <p className="mt-3">
            L&apos;accès bêta est temporaire, révocable et destiné à tester ou
            améliorer le service avant une ouverture plus large.
          </p>
          <p className="mt-3">
            TRACÉA peut modifier, suspendre ou retirer un accès bêta en cas
            d&apos;abus, de comportement contraire aux présentes Conditions ou
            de fin de phase de test.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.4 Abonnement Premium
          </h3>
          <p>
            TRACÉA propose un abonnement Premium payant donnant accès aux
            fonctionnalités Premium disponibles dans l&apos;application.
          </p>
          <p className="mt-3">Deux formules sont proposées :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>abonnement mensuel : 9 € par mois</strong> ;
            </li>
            <li>
              <strong>abonnement annuel : 78 € par an</strong>.
            </li>
          </ul>
          <p className="mt-3">
            Les prix sont indiqués en euros. La TVA est non applicable, art.
            293 B du Code général des impôts.
          </p>
          <p className="mt-3">
            L&apos;abonnement est souscrit volontairement par
            l&apos;utilisateur. Le paiement est traité par Stripe.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.5 Renouvellement automatique
          </h3>
          <p>
            L&apos;abonnement mensuel est renouvelé automatiquement chaque
            mois, sauf résiliation avant la date de renouvellement.
          </p>
          <p className="mt-3">
            L&apos;abonnement annuel est renouvelé automatiquement chaque
            année, sauf résiliation avant la date de renouvellement.
          </p>
          <p className="mt-3">
            Le renouvellement permet de maintenir l&apos;accès Premium sans
            interruption.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.6 Paiement
          </h3>
          <p>Le paiement de l&apos;abonnement Premium est réalisé via Stripe.</p>
          <p className="mt-3">
            TRACÉA ne stocke pas directement les numéros complets de carte
            bancaire.
          </p>
          <p className="mt-3">
            L&apos;utilisateur garantit qu&apos;il est autorisé à utiliser le
            moyen de paiement renseigné.
          </p>
          <p className="mt-3">
            En cas d&apos;échec de paiement, l&apos;accès Premium peut être
            suspendu, limité ou interrompu jusqu&apos;à régularisation.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.7 Factures et reçus
          </h3>
          <p>
            Les reçus, factures ou justificatifs de paiement peuvent être
            émis ou mis à disposition via Stripe ou par tout moyen adapté.
          </p>
          <p className="mt-3">
            L&apos;utilisateur est invité à conserver les justificatifs
            relatifs à son abonnement.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            9. Résiliation de l&apos;abonnement
          </h2>
          <p>
            L&apos;utilisateur peut résilier son abonnement Premium depuis
            l&apos;espace prévu à cet effet dans l&apos;application ou sur le
            site.
          </p>
          <p className="mt-3">
            La résiliation en ligne doit pouvoir être effectuée gratuitement,
            par voie électronique.
          </p>
          <p className="mt-3">
            Après résiliation, l&apos;utilisateur conserve l&apos;accès
            Premium jusqu&apos;à la fin de la période déjà payée, sauf
            disposition contraire impérative ou cas particulier explicitement
            indiqué.
          </p>
          <p className="mt-3">
            La résiliation met fin au renouvellement automatique. Elle
            n&apos;entraîne pas nécessairement le remboursement de la période
            déjà commencée.
          </p>
          <p className="mt-3">
            Après la fin de la période payée, l&apos;accès Premium est
            désactivé. L&apos;utilisateur conserve l&apos;accès aux
            fonctionnalités gratuites selon les règles en vigueur.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            10. Droit de rétractation
          </h2>
          <p>
            Conformément aux règles applicables aux contrats conclus à
            distance, l&apos;utilisateur consommateur dispose en principe
            d&apos;un délai légal de rétractation de{" "}
            <strong>quatorze jours</strong>.
          </p>
          <p className="mt-3">
            Toutefois, lorsque l&apos;accès au service numérique commence
            avant l&apos;expiration de ce délai, certaines exceptions
            peuvent s&apos;appliquer, notamment si l&apos;utilisateur a
            donné son accord préalable exprès et reconnu la perte de son
            droit de rétractation dans les conditions prévues par la
            réglementation applicable.
          </p>
          <p className="mt-3">
            Lorsque l&apos;utilisateur souscrit un abonnement Premium, les
            informations relatives au droit de rétractation, à son exercice,
            à ses éventuelles exceptions et aux conséquences de
            l&apos;utilisation immédiate du service sont présentées avant la
            validation du paiement.
          </p>
          <p className="mt-3">
            Lorsque la loi le permet et si l&apos;utilisateur demande un accès
            immédiat au service numérique avant la fin du délai de
            rétractation, il peut lui être demandé de reconnaître expressément
            les conséquences de cette demande sur son droit de rétractation.
          </p>
          <p className="mt-3">
            Pour toute question relative à la rétractation, l&apos;utilisateur
            peut écrire à :
          </p>
          <p className="mt-2">
            <strong>contact@methodetracea.fr</strong>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            11. Remboursement
          </h2>
          <p>
            Sauf obligation légale contraire, la résiliation d&apos;un
            abonnement en cours de période n&apos;entraîne pas de
            remboursement automatique au prorata.
          </p>
          <p className="mt-3">
            L&apos;utilisateur conserve l&apos;accès Premium jusqu&apos;à la
            fin de la période déjà payée.
          </p>
          <p className="mt-3">
            TRACÉA peut examiner certaines demandes particulières au cas par
            cas, sans que cela crée un droit automatique au remboursement.
          </p>
          <p className="mt-3">
            Cette clause ne prive pas l&apos;utilisateur des droits dont il
            bénéficie en vertu des dispositions légales applicables.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            12. Règles d&apos;usage
          </h2>
          <p>
            L&apos;utilisateur s&apos;engage à utiliser TRACÉA de manière
            personnelle, loyale et conforme à sa finalité.
          </p>
          <p className="mt-3">Il est interdit notamment de :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>utiliser TRACÉA pour porter atteinte à autrui ;</li>
            <li>détourner l&apos;application de sa finalité ;</li>
            <li>tenter d&apos;accéder aux données d&apos;un autre utilisateur ;</li>
            <li>contourner les limites d&apos;accès, d&apos;essai ou d&apos;usage ;</li>
            <li>
              créer plusieurs comptes dans le but d&apos;obtenir plusieurs
              essais gratuits ;
            </li>
            <li>perturber le fonctionnement technique du service ;</li>
            <li>
              tenter d&apos;extraire, copier, aspirer ou réutiliser massivement
              les contenus ;
            </li>
            <li>
              utiliser TRACÉA pour produire ou diffuser des contenus illicites,
              menaçants, diffamatoires, violents ou portant atteinte aux droits
              de tiers ;
            </li>
            <li>revendre l&apos;accès au service sans autorisation.</li>
          </ul>
          <p className="mt-3">
            En cas d&apos;usage abusif ou contraire aux présentes Conditions,
            TRACÉA peut suspendre ou limiter l&apos;accès au service.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            13. Données personnelles
          </h2>
          <p>
            L&apos;utilisation de TRACÉA implique le traitement de données
            personnelles.
          </p>
          <p className="mt-3">
            Ces traitements sont décrits dans la{" "}
            <Link
              href="/politique-confidentialite"
              className="text-terra hover:text-terra-dark underline"
            >
              Politique de confidentialité
            </Link>{" "}
            accessible sur le site et dans l&apos;application.
          </p>
          <p className="mt-3">
            L&apos;utilisateur peut contacter TRACÉA pour toute demande
            relative aux données personnelles à l&apos;adresse suivante :
          </p>
          <p className="mt-2">
            <strong>confidentialite@methodetracea.fr</strong>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            14. Contenus saisis par l&apos;utilisateur
          </h2>
          <p>
            L&apos;utilisateur reste titulaire des droits sur les contenus
            personnels qu&apos;il saisit dans TRACÉA.
          </p>
          <p className="mt-3">
            Il autorise TRACÉA à traiter ces contenus uniquement dans la
            mesure nécessaire au fonctionnement du service, notamment pour :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>enregistrer une traversée ;</li>
            <li>générer une synthèse ;</li>
            <li>conserver une trace ;</li>
            <li>afficher l&apos;historique ;</li>
            <li>produire des repères personnels ;</li>
            <li>assurer la sécurité du service.</li>
          </ul>
          <p className="mt-3">
            L&apos;utilisateur s&apos;engage à ne pas saisir de contenus
            portant atteinte aux droits de tiers ou contenant des informations
            qu&apos;il n&apos;est pas autorisé à communiquer.
          </p>
          <p className="mt-3">
            TRACÉA n&apos;a pas vocation à recevoir des informations
            concernant des tiers identifiables. L&apos;utilisateur est invité
            à éviter d&apos;inscrire des noms, coordonnées ou informations
            personnelles concernant d&apos;autres personnes.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            15. Propriété intellectuelle
          </h2>
          <p>
            TRACÉA, son nom, sa méthode, ses parcours, ses contenus, ses
            textes, son architecture éditoriale, ses interfaces, ses éléments
            visuels et ses ressources sont protégés par le droit de la
            propriété intellectuelle.
          </p>
          <p className="mt-3">
            Sauf autorisation écrite préalable, il est interdit de reproduire,
            copier, adapter, modifier, distribuer, vendre, louer, exploiter
            ou réutiliser tout ou partie des contenus ou éléments de TRACÉA.
          </p>
          <p className="mt-3">
            L&apos;utilisateur bénéficie uniquement d&apos;un droit personnel,
            non exclusif, non cessible et révocable d&apos;utiliser TRACÉA
            dans les conditions prévues par les présentes Conditions.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            16. Disponibilité du service
          </h2>
          <p>
            TRACÉA est fourni dans le cadre d&apos;une application en
            évolution.
          </p>
          <p className="mt-3">
            L&apos;éditrice s&apos;efforce d&apos;assurer l&apos;accessibilité
            et le bon fonctionnement du service, mais ne garantit pas une
            disponibilité permanente, continue ou sans erreur.
          </p>
          <p className="mt-3">
            Le service peut être interrompu, limité ou modifié, notamment
            pour maintenance, correction, évolution technique, sécurité,
            indisponibilité d&apos;un prestataire ou cas de force majeure.
          </p>
          <p className="mt-3">
            Certaines fonctionnalités, notamment les synthèses IA, peuvent
            être temporairement indisponibles ou limitées.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            17. Responsabilité
          </h2>
          <p>
            TRACÉA est un outil d&apos;accompagnement personnel et de
            régulation émotionnelle. L&apos;utilisateur reste responsable de
            l&apos;usage qu&apos;il fait du service, des décisions qu&apos;il
            prend et des actions qu&apos;il choisit de poser.
          </p>
          <p className="mt-3">
            TRACÉA ne peut pas garantir un résultat émotionnel, relationnel,
            médical, psychologique, professionnel ou personnel.
          </p>
          <p className="mt-3">TRACÉA ne peut être tenu responsable :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>d&apos;une mauvaise interprétation des contenus ;</li>
            <li>
              d&apos;une utilisation dans un contexte d&apos;urgence médicale
              ou psychiatrique ;
            </li>
            <li>
              d&apos;une décision prise par l&apos;utilisateur sur la seule
              base de l&apos;application ;
            </li>
            <li>d&apos;une indisponibilité temporaire du service ;</li>
            <li>d&apos;un dysfonctionnement lié à un prestataire technique ;</li>
            <li>d&apos;un usage contraire aux présentes Conditions.</li>
          </ul>
          <p className="mt-3">
            Cette limitation ne prive pas l&apos;utilisateur des droits dont
            il bénéficie en vertu des dispositions légales applicables.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            18. Suppression du compte et fin d&apos;accès
          </h2>
          <p>
            L&apos;utilisateur peut demander la suppression de son compte ou
            utiliser les fonctionnalités prévues à cet effet lorsqu&apos;elles
            sont disponibles dans l&apos;application.
          </p>
          <p className="mt-3">
            La suppression du compte peut entraîner la suppression ou
            l&apos;anonymisation des données associées, dans les conditions
            prévues par la Politique de confidentialité.
          </p>
          <p className="mt-3">
            Si un abonnement Premium est actif, l&apos;utilisateur doit
            d&apos;abord résilier cet abonnement via l&apos;espace prévu
            à cet effet (Billing Portal) avant de demander la suppression
            définitive de son compte. La demande de suppression du compte
            ne peut pas être utilisée comme moyen de résiliation
            implicite d&apos;un abonnement actif.
          </p>
          <p className="mt-3">
            Après résiliation, l&apos;accès Premium peut rester
            disponible jusqu&apos;à la fin de la période payée, dans les
            conditions de l&apos;abonnement.
          </p>
          <p className="mt-3">
            Certaines données de facturation peuvent rester conservées
            par Stripe ou par TRACÉA, dans les limites strictement
            nécessaires au respect des obligations légales, comptables
            ou de preuve applicables.
          </p>
          <p className="mt-3">
            TRACÉA peut suspendre ou fermer un accès utilisateur en cas :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>de violation des présentes Conditions ;</li>
            <li>d&apos;usage abusif ;</li>
            <li>de tentative de contournement des limites ;</li>
            <li>d&apos;atteinte à la sécurité du service ;</li>
            <li>d&apos;usage frauduleux ou illicite.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            19. Médiation de la consommation
          </h2>
          <p>
            En cas de litige non résolu avec TRACÉA, l&apos;utilisateur
            consommateur peut recourir gratuitement à un médiateur de la
            consommation, après avoir adressé une réclamation écrite préalable
            à TRACÉA.
          </p>
          <p className="mt-3">Réclamation préalable :</p>
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
            20. Modification des Conditions
          </h2>
          <p>
            TRACÉA peut modifier les présentes Conditions afin de tenir
            compte de l&apos;évolution du service, de ses fonctionnalités, de
            son modèle économique, de ses prestataires ou de la réglementation
            applicable.
          </p>
          <p className="mt-3">
            En cas de modification importante, TRACÉA pourra informer les
            utilisateurs par un moyen adapté, notamment dans l&apos;application
            ou par email.
          </p>
          <p className="mt-3">
            La date de dernière mise à jour figure en haut du présent
            document.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            21. Droit applicable
          </h2>
          <p>Les présentes Conditions sont soumises au droit français.</p>
          <p className="mt-3">
            En cas de litige, les règles de compétence applicables sont celles
            prévues par le droit français.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            22. Contact
          </h2>
          <p>
            Pour toute question relative aux présentes Conditions ou au
            fonctionnement de TRACÉA :
          </p>
          <p className="mt-2">
            <strong>contact@methodetracea.fr</strong>
          </p>
          <p className="mt-3">Pour toute question relative aux données personnelles :</p>
          <p className="mt-2">
            <strong>confidentialite@methodetracea.fr</strong>
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
