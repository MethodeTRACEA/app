"use client";

import Link from "next/link";

export default function PolitiqueConfidentialite() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="section-label">Protection des données</p>
      <h1 className="section-title">Politique de confidentialité</h1>
      <p className="text-xs text-warm-gray mb-8">
        Dernière mise à jour\u00A0: 25 mars 2026 · Version 1.0
      </p>

      <div className="space-y-8 font-body text-base text-espresso leading-relaxed">
        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            1. Responsable du traitement
          </h2>
          <div className="card-base space-y-2">
            <p>
              <strong>Identité :</strong> [Nom / Raison sociale à compléter]
            </p>
            <p>
              <strong>Adresse :</strong> [Adresse à compléter]
            </p>
            <p>
              <strong>Email DPO / Contact :</strong>{" "}
              [dpo@tracea.fr · à compléter]
            </p>
          </div>
          <p className="text-sm text-warm-gray mt-2 italic">
            Conformément à l&apos;article 13 du RGPD, ces informations seront
            complétées avant la mise en production.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            2. Données collectées et finalités
          </h2>
          <p className="mb-4">
            TRACEA collecte et traite les catégories de données suivantes :
          </p>

          <div className="space-y-3">
            <div className="card-terra">
              <h3 className="font-sans text-xs font-medium tracking-widest uppercase text-terra-dark mb-2">
                Données d&apos;identité (facultatives)
              </h3>
              <p>
                Prénom ou pseudonyme saisi dans le profil utilisateur.
              </p>
              <p className="text-sm text-terra-dark mt-1">
                <strong>Finalité :</strong> Personnalisation de
                l&apos;expérience utilisateur.
              </p>
            </div>

            <div className="card-terra">
              <h3 className="font-sans text-xs font-medium tracking-widest uppercase text-terra-dark mb-2">
                Données de session TRACEA
              </h3>
              <p>
                Contexte de la traversée, intensité émotionnelle avant/après,
                réponses textuelles aux six étapes du protocole, émotion
                primaire identifiée, vérité intérieure formulée, action
                d&apos;alignement.
              </p>
              <p className="text-sm text-terra-dark mt-1">
                <strong>Finalité :</strong> Fonctionnement du protocole,
                génération de l&apos;analyse de session, suivi de progression.
              </p>
            </div>

            <div className="card-terra">
              <h3 className="font-sans text-xs font-medium tracking-widest uppercase text-terra-dark mb-2">
                Données de consentement
              </h3>
              <p>
                Date et version du consentement donné, choix relatifs aux
                cookies.
              </p>
              <p className="text-sm text-terra-dark mt-1">
                <strong>Finalité :</strong> Preuve du consentement
                conformément aux articles 7 et 9 du RGPD.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            3. Données sensibles · Article 9 du RGPD
          </h2>
          <div className="safety-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0" />
              <span className="font-medium text-sm text-terra-dark font-sans">
                Traitement de données sensibles
              </span>
            </div>
            <p>
              Les réponses textuelles saisies lors des sessions TRACEA
              constituent des <strong>données relatives à la santé
              psychologique et émotionnelle</strong> au sens de l&apos;article 9
              du RGPD. Ces données bénéficient d&apos;une protection renforcée.
            </p>
            <p className="mt-3">
              <strong>Base légale :</strong> Le traitement de ces données repose
              sur votre <strong>consentement explicite</strong> (article 9.2.a
              du RGPD), recueilli avant toute utilisation de
              l&apos;application via un formulaire dédié.
            </p>
            <p className="mt-3">
              Ce consentement est :
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                <strong>Libre</strong> : vous pouvez refuser sans conséquence
                sur l&apos;accès aux informations générales de
                l&apos;application
              </li>
              <li>
                <strong>Spécifique</strong> : il porte sur le traitement de
                données émotionnelles dans le cadre du protocole TRACEA
              </li>
              <li>
                <strong>Éclairé</strong> : cette politique vous informe de
                manière transparente sur la nature et la finalité du traitement
              </li>
              <li>
                <strong>Univoque</strong> : il est recueilli par un acte
                positif clair (case à cocher)
              </li>
              <li>
                <strong>Révocable</strong> : vous pouvez le retirer à tout
                moment depuis la page Profil
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            4. Stockage et sécurité des données
          </h2>
          <div className="card-base">
            <h3 className="font-sans text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
              Stockage local (MVP)
            </h3>
            <p>
              Dans la version actuelle (MVP), <strong>toutes les données
              sont stockées exclusivement sur votre appareil</strong> via le
              mécanisme localStorage de votre navigateur web. Aucune donnée
              n&apos;est transmise, hébergée ou traitée sur un serveur distant.
            </p>
            <p className="mt-3">
              <strong>Conséquences :</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                Vos données ne quittent jamais votre appareil
              </li>
              <li>
                La suppression des données du navigateur entraîne la perte
                définitive de vos sessions
              </li>
              <li>
                Aucun tiers (y compris l&apos;éditeur de TRACEA) n&apos;a
                accès à vos données
              </li>
              <li>
                La sécurité des données dépend de la sécurité de votre appareil
                et de votre navigateur
              </li>
            </ul>
          </div>
          <p className="text-sm text-warm-gray mt-2 italic">
            Note : lors de l&apos;évolution vers une version avec
            authentification et stockage serveur, cette section sera mise à jour
            avec les mesures de sécurité techniques et organisationnelles
            applicables (chiffrement, pseudonymisation, contrôle d&apos;accès).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            5. Durée de conservation
          </h2>
          <p>
            Les données sont conservées dans le localStorage de votre navigateur
            tant que vous ne les supprimez pas. Vous pouvez à tout moment :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              Supprimer une session individuelle depuis la page Historique
            </li>
            <li>
              Révoquer votre consentement et supprimer l&apos;ensemble de vos
              données depuis la page Profil
            </li>
            <li>
              Effacer les données via les paramètres de votre navigateur
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            6. Vos droits (articles 15 à 22 du RGPD)
          </h2>
          <p className="mb-3">
            Conformément au RGPD et à la loi Informatique et Libertés, vous
            disposez des droits suivants :
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              {
                title: "Droit d'accès",
                desc: "Obtenir la confirmation que vos données sont traitées et en recevoir une copie (art. 15).",
              },
              {
                title: "Droit de rectification",
                desc: "Corriger des données inexactes ou incomplètes (art. 16).",
              },
              {
                title: "Droit à l'effacement",
                desc: "Obtenir la suppression de vos données (art. 17).",
              },
              {
                title: "Droit à la portabilité",
                desc: "Recevoir vos données dans un format structuré et lisible par machine (art. 20).",
              },
              {
                title: "Droit d'opposition",
                desc: "Vous opposer au traitement de vos données (art. 21).",
              },
              {
                title: "Retrait du consentement",
                desc: "Retirer votre consentement à tout moment, sans affecter la licéité du traitement effectué avant le retrait (art. 7.3).",
              },
            ].map((right) => (
              <div key={right.title} className="card-accent">
                <strong className="font-sans text-sm text-espresso">
                  {right.title}
                </strong>
                <p className="text-sm mt-1">{right.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4">
            Pour exercer vos droits, contactez-nous à :{" "}
            <strong>[dpo@tracea.fr · à compléter]</strong>
          </p>
          <p className="mt-2">
            Vous disposez également du droit d&apos;introduire une réclamation
            auprès de la{" "}
            <strong>
              Commission Nationale de l&apos;Informatique et des Libertés
              (CNIL)
            </strong>{" "}
            sur www.cnil.fr
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            7. Cookies et traceurs
          </h2>
          <p>
            Dans sa version actuelle, TRACEA utilise exclusivement des{" "}
            <strong>cookies strictement nécessaires</strong> au fonctionnement
            de l&apos;application (préférences de consentement). Aucun cookie
            publicitaire, analytique ou de suivi tiers n&apos;est utilisé.
          </p>
          <div className="card-base mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-beige-dark">
                  <th className="text-left py-2 font-sans font-medium text-warm-gray text-xs tracking-wider uppercase">
                    Nom
                  </th>
                  <th className="text-left py-2 font-sans font-medium text-warm-gray text-xs tracking-wider uppercase">
                    Finalité
                  </th>
                  <th className="text-left py-2 font-sans font-medium text-warm-gray text-xs tracking-wider uppercase">
                    Durée
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-beige">
                  <td className="py-2 font-mono text-xs">tracea_consent</td>
                  <td className="py-2">Preuve du consentement utilisateur</td>
                  <td className="py-2">Permanente*</td>
                </tr>
                <tr className="border-b border-beige">
                  <td className="py-2 font-mono text-xs">
                    tracea_cookie_consent
                  </td>
                  <td className="py-2">Choix relatifs aux cookies</td>
                  <td className="py-2">Permanente*</td>
                </tr>
                <tr className="border-b border-beige">
                  <td className="py-2 font-mono text-xs">tracea_sessions</td>
                  <td className="py-2">Stockage des sessions TRACEA</td>
                  <td className="py-2">Permanente*</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-xs">tracea_profile</td>
                  <td className="py-2">Profil utilisateur</td>
                  <td className="py-2">Permanente*</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-warm-gray mt-2 italic">
              * Stockage localStorage\u00A0: les données persistent jusqu&apos;à
              suppression manuelle par l&apos;utilisateur ou nettoyage du
              navigateur.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            8. Transferts de données hors UE
          </h2>
          <p>
            Dans sa version actuelle, TRACEA ne transfère aucune donnée hors de
            votre appareil. Aucun transfert de données vers un pays tiers
            n&apos;est effectué.
          </p>
          <p className="mt-2 text-sm text-warm-gray italic">
            Note : Si une intégration future (ex : API d&apos;analyse IA)
            implique un transfert hors UE, les garanties appropriées seront
            mises en place (clauses contractuelles types, décisions
            d&apos;adéquation) et cette section sera mise à jour.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-espresso mb-3">
            9. Modifications de cette politique
          </h2>
          <p>
            Cette politique de confidentialité peut être mise à jour. En cas de
            modification substantielle, un nouveau consentement vous sera
            demandé. La date de dernière mise à jour est indiquée en haut de
            cette page.
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
          href="/conditions-utilisation"
          className="text-terra hover:text-terra-dark"
        >
          Conditions d&apos;utilisation
        </Link>
      </div>
    </div>
  );
}
