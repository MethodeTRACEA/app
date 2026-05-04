"use client";

import Link from "next/link";

export default function PolitiqueConfidentialite() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="section-label">Protection des données</p>
      <h1 className="section-title">Politique de confidentialité — TRACÉA</h1>
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
            La présente politique de confidentialité explique comment TRACÉA
            collecte, utilise, protège et conserve les données personnelles des
            utilisateurs.
          </p>
          <p>
            TRACÉA est une application de régulation émotionnelle et de retour
            au corps. Elle permet notamment de réaliser des traversées courtes,
            des traversées approfondies, d&apos;utiliser des exercices
            d&apos;urgence, de conserver des traces et de consulter certains
            repères dans le temps.
          </p>
          <p>
            TRACÉA n&apos;est pas un dispositif médical, ne fournit pas de
            diagnostic, ne remplace pas un professionnel de santé et ne
            constitue pas une prise en charge thérapeutique.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            1. Responsable du traitement
          </h2>
          <p>Le responsable du traitement des données personnelles est :</p>
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
            <p>
              Email de contact :{" "}
              <strong>contact@methodetracea.fr</strong>
            </p>
            <p>
              Email dédié aux données personnelles :{" "}
              <strong>confidentialite@methodetracea.fr</strong>
            </p>
          </div>
          <p className="mt-3">
            Toute demande relative aux données personnelles peut être envoyée
            à :{" "}
            <strong>confidentialite@methodetracea.fr</strong>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            2. Utilisateurs concernés
          </h2>
          <p>
            TRACÉA est destiné, dans sa version actuelle, aux personnes
            majeures, âgées de <strong>18 ans et plus</strong>.
          </p>
          <p className="mt-2">
            TRACÉA n&apos;est pas destiné aux mineurs dans cette version. Les
            personnes mineures ne doivent pas créer de compte ni utiliser
            l&apos;application sans accord préalable et accompagnement
            d&apos;un représentant légal.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            3. Données collectées
          </h2>
          <p>
            TRACÉA collecte uniquement les données nécessaires au
            fonctionnement du service, à la sécurité de l&apos;application, à
            la gestion de l&apos;abonnement, à la conservation des traces
            choisies par l&apos;utilisateur et à l&apos;amélioration de
            l&apos;expérience.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            3.1 Données de compte
          </h3>
          <p>
            Lorsque l&apos;utilisateur crée un compte, TRACÉA traite notamment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>adresse email ;</li>
            <li>
              mot de passe, stocké de manière sécurisée et non lisible par
              TRACÉA ;
            </li>
            <li>identifiant utilisateur technique ;</li>
            <li>date de création du compte ;</li>
            <li>
              données de connexion nécessaires à l&apos;authentification.
            </li>
          </ul>
          <p className="mt-2">
            L&apos;authentification est gérée par Supabase Auth. TRACÉA peut
            utiliser une connexion par email et mot de passe, ainsi que
            certains mécanismes d&apos;authentification ou de réinitialisation
            gérés par Supabase.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            3.2 Données de profil
          </h3>
          <p>TRACÉA peut traiter :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>prénom, pseudonyme ou nom d&apos;affichage ;</li>
            <li>
              statut d&apos;accès : gratuit, bêta, essai Premium ou abonnement
              Premium ;
            </li>
            <li>informations techniques liées au compte.</li>
          </ul>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            3.3 Données issues des traversées
          </h3>
          <p>
            Lorsque l&apos;utilisateur utilise une traversée courte ou une
            traversée approfondie, TRACÉA peut traiter les informations
            qu&apos;il choisit de renseigner ou de sélectionner, notamment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>situation ou contexte décrit ;</li>
            <li>émotion ou ressenti sélectionné ;</li>
            <li>zone corporelle ressentie ;</li>
            <li>besoin identifié ;</li>
            <li>action ou geste choisi ;</li>
            <li>réponses libres saisies dans l&apos;application ;</li>
            <li>intensité ressentie avant ou après une traversée ;</li>
            <li>date et historique des traversées ;</li>
            <li>traces conservées dans l&apos;espace utilisateur.</li>
          </ul>
          <p className="mt-2">
            Ces données peuvent être personnelles et sensibles par leur
            contenu, car elles concernent le vécu émotionnel de
            l&apos;utilisateur. Elles sont traitées avec une attention
            particulière et ne sont pas utilisées pour établir un diagnostic
            médical ou psychologique.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            3.4 Données liées aux synthèses, traces et mémoire
          </h3>
          <p>
            TRACÉA peut générer et conserver des éléments de synthèse liés aux
            traversées, notamment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>miroir ou synthèse de fin de traversée ;</li>
            <li>trace à retenir ;</li>
            <li>résumé narratif d&apos;une traversée ;</li>
            <li>repères issus de l&apos;historique ;</li>
            <li>
              mémoire évolutive permettant d&apos;afficher ce qui revient, ce
              qui aide déjà ou ce qui change dans le temps.
            </li>
          </ul>
          <p className="mt-2">
            Ces éléments sont destinés à permettre à l&apos;utilisateur de
            relire son propre cheminement. Ils ne constituent pas une
            interprétation clinique, un diagnostic ou une évaluation médicale.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            3.5 Données liées à l&apos;essai Premium
          </h3>
          <p>
            TRACÉA propose un essai Premium de 7 jours, sans carte bancaire et
            sans prélèvement automatique.
          </p>
          <p className="mt-2">Pour gérer cet essai, TRACÉA traite notamment :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>activation ou non de l&apos;essai ;</li>
            <li>date de début de l&apos;essai ;</li>
            <li>date de fin de l&apos;essai ;</li>
            <li>source d&apos;activation de l&apos;essai ;</li>
            <li>
              nombre de traversées approfondies utilisées pendant
              l&apos;essai ;
            </li>
            <li>
              information indiquant si l&apos;essai a déjà été utilisé.
            </li>
          </ul>
          <p className="mt-2">
            L&apos;essai Premium est limité à un seul essai par compte et
            inclut actuellement jusqu&apos;à <strong>5 traversées
            approfondies</strong> pendant la période d&apos;essai.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            3.6 Données liées à l&apos;abonnement Premium
          </h3>
          <p>
            Lorsque l&apos;utilisateur souscrit un abonnement Premium, TRACÉA
            peut traiter les informations nécessaires à la gestion de
            l&apos;accès Premium, notamment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>statut d&apos;abonnement ;</li>
            <li>formule choisie : mensuelle ou annuelle ;</li>
            <li>date de début d&apos;abonnement ;</li>
            <li>date de renouvellement ;</li>
            <li>date d&apos;annulation ou de résiliation ;</li>
            <li>statut de paiement transmis par Stripe ;</li>
            <li>
              identifiants techniques Stripe nécessaires à la gestion de
              l&apos;abonnement ;
            </li>
            <li>
              informations nécessaires à l&apos;activation ou à la
              désactivation de l&apos;accès Premium.
            </li>
          </ul>
          <p className="mt-2">
            TRACÉA ne stocke pas directement les numéros de carte bancaire
            complets. Les données de paiement sont traitées par Stripe,
            prestataire de paiement.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            3.7 Données liées à l&apos;accès bêta
          </h3>
          <p>
            TRACÉA peut traiter des informations indiquant si un compte
            dispose d&apos;un accès bêta. L&apos;accès bêta peut être accordé
            à certains utilisateurs dans le cadre de tests, d&apos;invitations
            ou de phases de pré-lancement.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            3.8 Données techniques et de sécurité
          </h3>
          <p>
            TRACÉA peut traiter des données techniques nécessaires au bon
            fonctionnement, à la sécurité et à la limitation des abus,
            notamment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>événements d&apos;usage internes ;</li>
            <li>démarrage et fin de session ;</li>
            <li>étapes complétées ;</li>
            <li>informations liées aux limites d&apos;usage ;</li>
            <li>journaux techniques de limitation de fréquence ;</li>
            <li>journaux d&apos;usage de l&apos;IA ;</li>
            <li>modèle IA utilisé ;</li>
            <li>nombre de tokens utilisés ;</li>
            <li>estimation du coût technique des appels IA ;</li>
            <li>erreurs techniques éventuelles.</li>
          </ul>
          <p className="mt-2">
            Ces données servent à sécuriser le service, prévenir les abus,
            suivre le fonctionnement technique de l&apos;application et
            maîtriser les coûts liés à l&apos;IA.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            3.9 Données de consentement
          </h3>
          <p>
            TRACÉA conserve des éléments permettant de tracer les
            consentements ou choix exprimés par l&apos;utilisateur, notamment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>acceptation des conditions d&apos;utilisation ;</li>
            <li>
              consentement relatif au traitement de données sensibles ;
            </li>
            <li>choix relatifs aux cookies ou au stockage local ;</li>
            <li>date et version du consentement lorsque disponible.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            4. Données stockées localement dans le navigateur
          </h2>
          <p>
            TRACÉA utilise certains stockages locaux du navigateur afin
            d&apos;assurer le fonctionnement de l&apos;application, conserver
            des préférences ou éviter de redemander plusieurs fois certaines
            informations.
          </p>
          <p className="mt-2">
            Les données locales peuvent inclure notamment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <code className="font-mono text-xs">tracea_consent</code> :
              information liée au consentement ;
            </li>
            <li>
              <code className="font-mono text-xs">tracea_cookie_consent</code>{" "}
              : choix relatifs au bandeau cookies ou stockage local ;
            </li>
            <li>
              <code className="font-mono text-xs">tracea_anonymous_id</code> :
              identifiant anonyme local ;
            </li>
            <li>
              <code className="font-mono text-xs">tracea_grounding_voice</code>{" "}
              : préférence liée à la voix des exercices ;
            </li>
            <li>
              <code className="font-mono text-xs">tracea_night_mode</code> :
              préférence liée au mode nuit ;
            </li>
            <li>
              <code className="font-mono text-xs">tracea_audio_level</code> :
              préférence de niveau audio ;
            </li>
            <li>
              <code className="font-mono text-xs">tracea_onboarding_done</code>{" "}
              : information indiquant que l&apos;onboarding a été vu ;
            </li>
            <li>
              <code className="font-mono text-xs">tracea_onboarding_seen</code>{" "}
              : information liée à certains écrans d&apos;introduction ;
            </li>
            <li>
              <code className="font-mono text-xs">tracea_post_session_seen</code>{" "}
              : information liée à l&apos;affichage post-session ;
            </li>
            <li>
              <code className="font-mono text-xs">tracea_free_short_sessions</code>{" "}
              : compteur local lié aux traversées courtes gratuites ;
            </li>
            <li>
              données locales anciennes éventuelles, telles que{" "}
              <code className="font-mono text-xs">tracea_sessions</code> ou{" "}
              <code className="font-mono text-xs">tracea_profile</code>,
              pouvant subsister dans certains navigateurs si l&apos;utilisateur
              a utilisé une ancienne version.
            </li>
          </ul>
          <p className="mt-3">TRACÉA peut aussi utiliser :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              un stockage de session temporaire pour gérer
              l&apos;authentification pendant l&apos;utilisation de
              l&apos;application ;
            </li>
            <li>
              un cookie technique{" "}
              <code className="font-mono text-xs">maintenance_access</code>,
              utilisé uniquement pour l&apos;accès à une éventuelle page de
              maintenance.
            </li>
          </ul>
          <p className="mt-3">
            TRACÉA n&apos;utilise pas ces éléments pour de la publicité ciblée.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            5. Finalités des traitements
          </h2>
          <p>Les données sont traitées pour les finalités suivantes :</p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            5.1 Fournir le service TRACÉA
          </h3>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>créer et gérer le compte utilisateur ;</li>
            <li>permettre l&apos;accès à l&apos;application ;</li>
            <li>enregistrer les traversées ;</li>
            <li>afficher l&apos;historique et les traces ;</li>
            <li>proposer les exercices et parcours disponibles ;</li>
            <li>
              permettre l&apos;accès aux fonctionnalités gratuites, bêta,
              essai Premium ou Premium.
            </li>
          </ul>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            5.2 Générer les synthèses et repères personnels
          </h3>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>générer un miroir ou une synthèse de fin de traversée ;</li>
            <li>créer une trace à retenir ;</li>
            <li>alimenter la mémoire évolutive ;</li>
            <li>
              afficher certains repères personnels dans l&apos;historique ou
              les espaces de suivi.
            </li>
          </ul>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            5.3 Gérer l&apos;essai Premium et les accès
          </h3>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>activer l&apos;essai Premium ;</li>
            <li>empêcher plusieurs essais sur un même compte ;</li>
            <li>
              appliquer la limite de 5 traversées approfondies pendant
              l&apos;essai ;
            </li>
            <li>afficher l&apos;état d&apos;accès dans le profil ;</li>
            <li>
              distinguer les statuts gratuit, bêta, essai Premium et Premium.
            </li>
          </ul>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            5.4 Gérer l&apos;abonnement Premium
          </h3>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              permettre la souscription à une formule mensuelle ou annuelle ;
            </li>
            <li>
              activer l&apos;accès Premium après confirmation du paiement ;
            </li>
            <li>gérer le renouvellement automatique de l&apos;abonnement ;</li>
            <li>gérer la résiliation ou l&apos;annulation ;</li>
            <li>traiter les événements de paiement transmis par Stripe ;</li>
            <li>maintenir à jour le statut d&apos;accès Premium.</li>
          </ul>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            5.5 Assurer la sécurité et prévenir les abus
          </h3>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>limiter les appels excessifs aux services IA ;</li>
            <li>prévenir les contournements d&apos;accès ;</li>
            <li>protéger les données des utilisateurs ;</li>
            <li>détecter les erreurs techniques ;</li>
            <li>maintenir le service disponible et stable.</li>
          </ul>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            5.6 Respecter les obligations légales
          </h3>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>gérer les demandes d&apos;exercice de droits ;</li>
            <li>
              conserver les preuves de consentement lorsque nécessaire ;
            </li>
            <li>répondre aux obligations légales applicables ;</li>
            <li>gérer les éventuelles réclamations.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            6. Bases légales des traitements
          </h2>
          <p>
            Selon les traitements concernés, TRACÉA s&apos;appuie sur les
            bases légales suivantes :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>
                Exécution du contrat ou de mesures précontractuelles
              </strong>{" "}
              : création de compte, accès au service, gestion des
              fonctionnalités, essai Premium, abonnement Premium, historique
              et traces ;
            </li>
            <li>
              <strong>Consentement explicite</strong> : traitement des données
              relatives au vécu émotionnel, aux traversées et aux éléments
              pouvant révéler des informations sensibles ;
            </li>
            <li>
              <strong>Intérêt légitime</strong> : sécurité de
              l&apos;application, prévention des abus, mesure technique de
              l&apos;usage, amélioration de la stabilité du service ;
            </li>
            <li>
              <strong>Obligation légale</strong> : gestion des demandes
              relatives aux droits des personnes, conservation de certains
              éléments nécessaires à la preuve ou à la conformité.
            </li>
          </ul>
          <p className="mt-3">
            L&apos;utilisateur peut retirer son consentement lorsque le
            traitement repose sur celui-ci. Le retrait du consentement peut
            limiter ou empêcher l&apos;utilisation de certaines fonctionnalités
            de TRACÉA qui nécessitent le traitement de données personnelles ou
            émotionnelles.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            7. Utilisation de l&apos;intelligence artificielle
          </h2>
          <p>
            TRACÉA utilise l&apos;intelligence artificielle pour générer
            certaines synthèses ou reformulations à partir des informations
            renseignées pendant une traversée approfondie.
          </p>
          <p className="mt-2">
            Les traitements IA peuvent notamment concerner :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>la situation décrite ;</li>
            <li>l&apos;émotion ou le besoin sélectionné ;</li>
            <li>l&apos;action choisie ;</li>
            <li>les réponses libres saisies par l&apos;utilisateur ;</li>
            <li>l&apos;historique de la traversée concernée.</li>
          </ul>
          <p className="mt-3">
            L&apos;IA est utilisée pour produire un miroir, une synthèse ou
            une trace. Elle ne sert pas à établir un diagnostic, à prendre
            une décision juridique ou médicale, ni à évaluer la valeur, la
            santé ou la personnalité de l&apos;utilisateur.
          </p>
          <p className="mt-2">
            Les résultats générés par l&apos;IA peuvent être imparfaits.
            L&apos;utilisateur reste libre de les lire, de les ignorer, de
            les supprimer ou de demander la suppression de ses données selon
            les modalités prévues dans la présente politique.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            8. Destinataires et sous-traitants
          </h2>
          <p>Les données personnelles ne sont pas vendues à des tiers.</p>
          <p className="mt-2">
            TRACÉA peut faire appel à des prestataires techniques nécessaires
            au fonctionnement du service.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.1 Supabase
          </h3>
          <p>Supabase est utilisé pour :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>l&apos;authentification ;</li>
            <li>la base de données ;</li>
            <li>la gestion des profils ;</li>
            <li>
              la conservation des sessions, traces, événements, consentements
              et informations liées aux accès.
            </li>
          </ul>
          <p className="mt-3">
            La base de données principale du projet TRACÉA est située en
            région <strong>West EU — Ireland — eu-west-1</strong>.
          </p>
          <p className="mt-2">
            Les emails d&apos;authentification, de confirmation ou de
            réinitialisation peuvent être gérés via Supabase Auth.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.2 Vercel
          </h3>
          <p>Vercel est utilisé pour l&apos;hébergement applicatif de TRACÉA.</p>
          <p className="mt-2">Hébergeur applicatif :</p>
          <div className="card-base space-y-1 mt-2">
            <p>
              <strong>Vercel Inc.</strong>
            </p>
            <p>440 N Barranca Ave #4133</p>
            <p>Covina, CA 91723</p>
            <p>États-Unis</p>
          </div>
          <p className="mt-3">
            TRACÉA a désactivé l&apos;option permettant à Vercel
            d&apos;utiliser les données du projet pour améliorer des modèles.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.3 Anthropic
          </h3>
          <p>
            Anthropic est utilisé pour les fonctionnalités d&apos;intelligence
            artificielle de TRACÉA.
          </p>
          <p className="mt-2">Le modèle utilisé actuellement est :</p>
          <p className="mt-2">
            <strong>claude-sonnet-4-6</strong>
          </p>
          <p className="mt-2">
            Certaines informations saisies pendant une traversée approfondie
            peuvent être transmises à Anthropic afin de générer une synthèse
            ou un résumé. Ces données ne sont transmises que lorsque cela est
            nécessaire au fonctionnement des fonctionnalités IA.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.4 Stripe
          </h3>
          <p>
            Stripe est utilisé comme prestataire de paiement pour les
            abonnements Premium.
          </p>
          <p className="mt-2">Stripe peut traiter notamment :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>données nécessaires au paiement ;</li>
            <li>moyen de paiement ;</li>
            <li>statut de paiement ;</li>
            <li>historique de facturation ;</li>
            <li>identifiants techniques client et abonnement ;</li>
            <li>
              reçus, factures ou informations liées aux transactions.
            </li>
          </ul>
          <p className="mt-3">
            TRACÉA ne stocke pas directement les numéros complets de carte
            bancaire.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            8.5 IONOS
          </h3>
          <p>
            IONOS est utilisé pour la gestion des adresses email
            professionnelles de TRACÉA, notamment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>contact@methodetracea.fr ;</li>
            <li>confidentialite@methodetracea.fr.</li>
          </ul>
          <p className="mt-3">
            Les messages envoyés à ces adresses peuvent donc être traités via
            les services email d&apos;IONOS.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            9. Transferts hors Union européenne
          </h2>
          <p>
            Certains prestataires utilisés par TRACÉA peuvent être établis ou
            traiter certaines données en dehors de l&apos;Union européenne,
            notamment aux États-Unis.
          </p>
          <p className="mt-2">
            Lorsque des transferts hors Union européenne sont nécessaires au
            fonctionnement du service, TRACÉA s&apos;appuie sur les garanties
            prévues par la réglementation applicable, notamment des
            engagements contractuels de protection des données et des clauses
            contractuelles types lorsque nécessaire.
          </p>
          <p className="mt-2">
            Les prestataires concernés peuvent notamment être :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Vercel ;</li>
            <li>Anthropic ;</li>
            <li>Supabase selon les traitements et services utilisés ;</li>
            <li>Stripe ;</li>
            <li>IONOS selon les services utilisés.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            10. Durées de conservation
          </h2>
          <p>
            Les données sont conservées pendant la durée nécessaire aux
            finalités pour lesquelles elles sont traitées.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            10.1 Données de compte et de profil
          </h3>
          <p>
            Les données de compte et de profil sont conservées tant que le
            compte utilisateur existe, sauf demande de suppression ou
            obligation contraire.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            10.2 Données de traversée, historique, traces et mémoire
          </h3>
          <p>
            Les données de traversée, l&apos;historique, les traces, les
            synthèses et les éléments de mémoire sont conservés tant que le
            compte existe, afin de permettre à l&apos;utilisateur de
            retrouver son historique et les repères construits dans le temps.
          </p>
          <p className="mt-2">
            L&apos;utilisateur peut demander la suppression de son compte ou
            l&apos;effacement de sa mémoire TRACÉA.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            10.3 Données liées à l&apos;essai Premium
          </h3>
          <p>
            Les données liées à l&apos;essai Premium sont conservées tant que
            le compte existe, notamment afin de garantir qu&apos;un seul
            essai est activé par compte et de prévenir les abus.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            10.4 Données liées à l&apos;abonnement et au paiement
          </h3>
          <p>
            Les données liées à l&apos;abonnement sont conservées pendant la
            durée de l&apos;abonnement, puis pendant la durée nécessaire au
            respect des obligations légales, comptables, fiscales,
            contractuelles ou à la défense des droits de TRACÉA.
          </p>
          <p className="mt-2">
            Les données de paiement détaillées sont traitées principalement
            par Stripe.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            10.5 Données techniques et journaux
          </h3>
          <p>
            Les journaux techniques, les journaux d&apos;usage de l&apos;IA,
            les événements internes et les données de limitation d&apos;usage
            sont conservés pendant une durée nécessaire à la sécurité, à la
            prévention des abus, au suivi technique et à la maîtrise des
            coûts.
          </p>
          <p className="mt-2">
            Ils peuvent être supprimés, anonymisés ou agrégés lorsque leur
            conservation sous forme directement rattachée au compte n&apos;est
            plus nécessaire.
          </p>

          <h3 className="font-serif text-lg text-espresso mt-6 mb-2">
            10.6 Données de consentement
          </h3>
          <p>
            Les données de consentement peuvent être conservées pendant la
            durée nécessaire à la preuve du consentement et au respect des
            obligations légales.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            11. Sécurité des données
          </h2>
          <p>
            TRACÉA met en œuvre des mesures techniques et organisationnelles
            destinées à protéger les données personnelles, notamment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>authentification utilisateur ;</li>
            <li>règles de sécurité au niveau de la base de données ;</li>
            <li>séparation des accès entre utilisateurs ;</li>
            <li>utilisation de clés serveur pour les opérations sensibles ;</li>
            <li>limitation des appels excessifs ;</li>
            <li>journalisation technique ;</li>
            <li>hébergement auprès de prestataires spécialisés ;</li>
            <li>chiffrement des échanges via HTTPS.</li>
          </ul>
          <p className="mt-3">
            Aucun système n&apos;est totalement exempt de risque.
            L&apos;utilisateur doit veiller à utiliser un mot de passe
            suffisamment robuste, à ne pas le partager et à protéger
            l&apos;accès à sa boîte email.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            12. Accès, export et suppression des données
          </h2>
          <p>
            TRACÉA propose des fonctionnalités permettant à l&apos;utilisateur
            de consulter certaines données liées à son compte, notamment dans
            son espace Profil.
          </p>
          <p className="mt-2">
            Selon les fonctionnalités disponibles, l&apos;utilisateur peut :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>consulter son historique ;</li>
            <li>exporter certaines données ;</li>
            <li>effacer sa mémoire TRACÉA ;</li>
            <li>demander la suppression de son compte ;</li>
            <li>gérer son abonnement Premium ;</li>
            <li>contacter TRACÉA pour toute demande complémentaire.</li>
          </ul>
          <p className="mt-3">
            L&apos;export des données personnelles liées au compte et à
            l&apos;usage de TRACÉA est disponible depuis l&apos;espace
            Profil, via le bouton{" "}
            <strong>« Exporter mes données (portabilité) »</strong>.
            L&apos;export est fourni au format JSON.
          </p>
          <p className="mt-2">
            Lorsque ces données existent, l&apos;export peut contenir
            notamment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>les informations de compte minimales ;</li>
            <li>le profil utilisateur ;</li>
            <li>
              l&apos;état d&apos;abonnement lisible, sans identifiants
              techniques Stripe ;
            </li>
            <li>les informations relatives à l&apos;essai ;</li>
            <li>les sessions et traversées ;</li>
            <li>les synthèses de sessions ;</li>
            <li>le profil mémoire utilisateur ;</li>
            <li>les événements d&apos;usage liés au compte ;</li>
            <li>les logs d&apos;usage IA ;</li>
            <li>
              les logs de limitation d&apos;usage, sans adresse IP brute ;
            </li>
            <li>les journaux de consentement.</li>
          </ul>
          <p className="mt-3">
            Certaines données techniques ou sensibles ne sont pas
            incluses dans l&apos;export, notamment les mots de passe,
            tokens, secrets techniques, identifiants Stripe internes,
            droits administrateur, adresses IP brutes et données
            relatives à d&apos;autres utilisateurs.
          </p>
          <p className="mt-3">
            Les demandes relatives aux droits sur les données
            personnelles sont traitées dans un délai maximal d&apos;un
            mois à compter de leur réception, pouvant être prolongé dans
            les cas prévus par la réglementation applicable.
          </p>
          <p className="mt-3">
            Pour toute demande relative à ses données personnelles,
            l&apos;utilisateur peut écrire à :{" "}
            <strong>confidentialite@methodetracea.fr</strong>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            13. Droits des utilisateurs
          </h2>
          <p>
            Conformément à la réglementation applicable, l&apos;utilisateur
            dispose des droits suivants sur ses données personnelles :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>droit d&apos;accès ;</li>
            <li>droit de rectification ;</li>
            <li>droit d&apos;effacement ;</li>
            <li>droit à la limitation du traitement ;</li>
            <li>droit d&apos;opposition ;</li>
            <li>droit à la portabilité ;</li>
            <li>
              droit de retirer son consentement lorsque le traitement repose
              sur le consentement ;
            </li>
            <li>droit d&apos;introduire une réclamation auprès de la CNIL.</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits, l&apos;utilisateur peut écrire à :{" "}
            <strong>confidentialite@methodetracea.fr</strong>
          </p>
          <p className="mt-2">
            TRACÉA pourra demander des informations complémentaires si cela
            est nécessaire pour confirmer l&apos;identité du demandeur ou
            traiter la demande.
          </p>
          <p className="mt-3">L&apos;utilisateur peut également contacter la CNIL :</p>
          <div className="card-base space-y-1 mt-2">
            <p>
              <strong>
                Commission Nationale de l&apos;Informatique et des Libertés
              </strong>
            </p>
            <p>3 Place de Fontenoy</p>
            <p>TSA 80715</p>
            <p>75334 Paris Cedex 07</p>
            <p>www.cnil.fr</p>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            14. Données de paiement
          </h2>
          <p>
            Les paiements des abonnements Premium sont traités par Stripe.
          </p>
          <p className="mt-2">
            TRACÉA ne stocke pas directement les numéros complets de carte
            bancaire.
          </p>
          <p className="mt-3">Les formules Premium proposées sont :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>9 € par mois</strong> ;
            </li>
            <li>
              <strong>78 € par an</strong>.
            </li>
          </ul>
          <p className="mt-3">
            L&apos;abonnement est renouvelé automatiquement selon la formule
            choisie, sauf résiliation avant la date de renouvellement.
          </p>
          <p className="mt-2">
            L&apos;utilisateur peut gérer ou résilier son abonnement selon
            les modalités prévues dans les Conditions d&apos;utilisation et
            dans l&apos;espace prévu à cet effet.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            15. Essai Premium gratuit
          </h2>
          <p>
            L&apos;essai Premium TRACÉA permet de découvrir certaines
            fonctionnalités Premium pendant 7 jours.
          </p>
          <p className="mt-2">Caractéristiques de l&apos;essai :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>durée : 7 jours ;</li>
            <li>sans carte bancaire ;</li>
            <li>sans prélèvement automatique ;</li>
            <li>un seul essai par compte ;</li>
            <li>accès temporaire aux fonctionnalités Premium ;</li>
            <li>limite actuelle : 5 traversées approfondies pendant l&apos;essai ;</li>
            <li>urgence et traversée courte restent accessibles gratuitement.</li>
          </ul>
          <p className="mt-3">
            Les données nécessaires à la gestion de l&apos;essai sont traitées
            afin d&apos;activer l&apos;accès, d&apos;empêcher les activations
            multiples et d&apos;appliquer les limites d&apos;usage prévues.
          </p>
          <p className="mt-2">
            À la fin de l&apos;essai gratuit, aucun abonnement ne démarre
            automatiquement. L&apos;utilisateur doit choisir volontairement de
            s&apos;abonner pour bénéficier de l&apos;accès Premium payant.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            16. Urgence et situations de détresse
          </h2>
          <div className="safety-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0" />
              <span className="font-medium text-sm text-terra-dark font-sans">
                Urgence et situations de détresse
              </span>
            </div>
            <p>
              TRACÉA propose des exercices d&apos;urgence émotionnelle et de
              retour au corps. Ces fonctionnalités ne constituent pas un
              service d&apos;urgence médicale ou psychologique.
            </p>
            <p className="mt-3">
              En cas de danger immédiat, de risque suicidaire, de violences,
              de crise grave ou de détresse aiguë, l&apos;utilisateur doit
              contacter les services d&apos;urgence ou un professionnel
              compétent.
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
            17. Modifications de la politique de confidentialité
          </h2>
          <p>
            TRACÉA peut modifier la présente politique de confidentialité
            afin de tenir compte de l&apos;évolution de l&apos;application,
            de ses fonctionnalités, de ses prestataires ou de la
            réglementation applicable.
          </p>
          <p className="mt-2">
            En cas de modification importante, TRACÉA pourra informer les
            utilisateurs par un moyen adapté, notamment dans l&apos;application
            ou par email.
          </p>
          <p className="mt-2">
            La date de dernière mise à jour figure en haut du présent document.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            18. Contact
          </h2>
          <p>
            Pour toute question relative à la présente politique ou au
            traitement des données personnelles :
          </p>
          <div className="card-base space-y-1 mt-3">
            <p>
              <strong>TRACÉA — Données personnelles</strong>
            </p>
            <p>
              Email : <strong>confidentialite@methodetracea.fr</strong>
            </p>
          </div>
          <p className="mt-3">Pour toute autre question :</p>
          <div className="card-base space-y-1 mt-2">
            <p>
              <strong>contact@methodetracea.fr</strong>
            </p>
          </div>
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
          href="/conditions-utilisation"
          className="text-terra hover:text-terra-dark"
        >
          Conditions d&apos;utilisation
        </Link>
      </div>
    </div>
  );
}
