# TRACÉA — Chantier Stripe / abonnement Premium / lancement public

_Document de suivi interne — ne pas confondre avec les pages légales publiques._

_Dernière mise à jour : 2026-05-02_

---

## 1. État actuel

- Stripe **non installé** : aucune dépendance dans `package.json`.
- Aucune variable Stripe dans `.env.local` (uniquement Supabase, Anthropic, ElevenLabs).
- `/api/subscribe/route.ts` renvoie encore **HTTP 403 "Paiement non encore activé"**.
- Aucun webhook Stripe (pas de `src/app/api/stripe/webhook/route.ts`).
- Aucun parcours de checkout opérationnel.
- Aucune résiliation en ligne.
- `/app/subscribe` affiche encore **trois fois** _"L'abonnement payant arrive bientôt."_ ([subscribe/page.tsx](../src/app/app/subscribe/page.tsx) lignes 215, 274, 301).
- Les trois documents légaux (`mentions-legales`, `politique-confidentialite`, `conditions-utilisation`) sont déjà en **version cible "Stripe actif"** — déphasage public ↔ produit à résorber avant lancement public.

---

## État réel Supabase — DB/RLS Stripe appliqués le 2026-05-02

Les deux SQL préparés ont été exécutés en production Supabase, dans l'ordre contrôlé :

1. `supabase/add_stripe_subscription_fields.sql` — succès.
2. `supabase/restrict_stripe_subscription_fields_rls.sql` — succès, immédiatement après.

### Vérifications post-exécution

- `stripe_columns_count = 10` — les 10 colonnes Stripe / abonnement sont présentes dans `public.profiles`.
- `restrictive_policies_count = 2` — les deux policies restrictives sont actives sur `public.profiles` :
  - `only_neutral_sensitive_fields_on_insert` (RESTRICTIVE / INSERT / authenticated)
  - `only_service_role_can_set_sensitive_fields` (RESTRICTIVE / UPDATE / authenticated)
- `stripe_indexes_count = 4` — 2 uniques partiels (`stripe_customer_id`, `stripe_subscription_id`) + 2 simples (`stripe_subscription_status`, `subscription_current_period_end`).
- `stripe_constraints_count = 3` — `profiles_subscription_plan_check`, `profiles_stripe_subscription_status_check`, `profiles_subscription_period_consistency_check`.
- 9 profils existants vérifiés : tous neutres côté Stripe (champs Stripe à `NULL`, `subscription_cancel_at_period_end = false`).

### Champs sensibles couverts par les deux policies (18)

Les policies restrictives UPDATE et INSERT couvrent désormais l'ensemble :

- `is_subscribed`, `is_beta_tester`, `is_admin`
- `trial_started_at`, `trial_ends_at`, `trial_used`, `trial_activated_by`, `trial_deep_sessions_used`
- `stripe_customer_id`, `stripe_subscription_id`, `stripe_subscription_status`, `stripe_price_id`
- `subscription_plan`, `subscription_current_period_end`, `subscription_cancel_at_period_end`, `subscription_canceled_at`
- `subscribed_at`, `unsubscribed_at`

### Conséquences immédiates

- Les colonnes Stripe sont **réellement présentes** en production Supabase.
- Les policies RLS UPDATE et INSERT sont **effectivement appliquées** : un client authentifié ne peut plus falsifier ses champs sensibles (Stripe, trial, premium, admin).
- Les profils existants restent neutres côté Stripe ; aucun utilisateur n'est impacté.
- Le **service role** pourra plus tard synchroniser Stripe via webhook (bypass RLS standard sur Supabase).
- Le client ne peut pas falsifier les champs Stripe.

### Ce qui reste inchangé côté produit / UX

- `STRIPE_ENABLED=false` reste la règle.
- Aucun changement UX n'est actif côté testeurs.
- Stripe reste **dormant**.
- Aucun checkout n'existe encore.
- Aucun webhook Stripe n'existe encore.
- Aucun bouton paiement n'est visible.
- Aucun impact testeur attendu — parcours gratuit, trial 7 jours et bêta continuent à l'identique.

---

## 2. Décision de stratégie

- **Préparer Stripe en mode dormant.**
- **Ne pas exposer le paiement aux testeurs** tant que tous les chantiers ne sont pas alignés.
- **Ne pas modifier le gating actuel** (`hasPremiumAccess`, gate `/app/session` 5/5, branches `/app/subscribe`) tant que Stripe n'est pas prêt.
- Introduire un **drapeau d'environnement `STRIPE_ENABLED=false`** comme commutateur unique pour activer/désactiver l'ensemble du parcours payant.

---

## 3. Règle produit — tant que `STRIPE_ENABLED=false`

- Aucun bouton de paiement actif.
- Aucun checkout visible côté utilisateur.
- Aucune obligation de s'abonner pour utiliser TRACÉA.
- Les testeurs bêta et les utilisateurs en essai Premium 7 jours **ne sont pas bloqués**.
- `/app/subscribe` peut rester en mode pré-lancement (wording actuel acceptable temporairement).
- `/app/profil` ne doit pas afficher de fausse gestion Stripe (pas de bouton "Gérer mon abonnement" tant que la route portal n'existe pas).
- Les routes `/api/subscribe` et `/api/stripe/webhook`, lorsqu'elles existeront, doivent renvoyer une réponse claire d'inactivation si le drapeau est `false`.

---

## 4. Cible lancement public — quand `STRIPE_ENABLED=true`

- Abonnement mensuel : **9 €/mois**.
- Abonnement annuel : **78 €/an**.
- Renouvellement automatique selon la formule choisie.
- Essai Premium 7 jours sans carte bancaire.
- **Aucun abonnement automatique** après l'essai gratuit.
- Paiement via Stripe.
- Webhooks Stripe actifs et idempotents.
- `/app/profil` affiche le statut d'abonnement réel : formule, date de renouvellement, statut (actif / past_due / cancel_at_period_end / canceled).
- Résiliation en ligne accessible (Stripe Billing Portal en priorité, route interne en complément si décidé).
- Accès Premium **conservé jusqu'à fin de période payée** après résiliation, conformément aux CGU §9.

---

## 5. Champs DB recommandés

À ajouter sur `public.profiles` (nullable, sécurisés en RLS) :

| Champ | Type | Rôle |
|---|---|---|
| `stripe_customer_id` | text, unique, nullable | identifiant client Stripe persistant |
| `stripe_subscription_id` | text, unique, nullable | identifiant abonnement courant |
| `stripe_subscription_status` | text, nullable | active / trialing / past_due / canceled / incomplete / unpaid |
| `stripe_price_id` | text, nullable | identifiant prix Stripe sélectionné |
| `subscription_plan` | text, nullable | "monthly" \| "yearly" — redondant mais utile UI |
| `subscription_current_period_end` | timestamptz, nullable | date de fin de période courante |
| `subscription_cancel_at_period_end` | boolean, nullable | drapeau résiliation programmée |
| `subscription_canceled_at` | timestamptz, nullable | horodatage de la résiliation |
| `subscribed_at` | timestamptz, nullable | première souscription |
| `unsubscribed_at` | timestamptz, nullable | dernière fin réelle d'accès |

Précisions importantes :

- **`is_subscribed` reste un booléen dérivé**, synchronisé par le webhook : `true` tant que `stripe_subscription_status ∈ {active, trialing}` et que `subscription_current_period_end > now()`. Le code applicatif existant qui lit `is_subscribed` reste compatible sans modification immédiate.
- **`hasPremiumAccess = isSubscribed || isBetaTester || isTrialActive`** reste inchangé au départ. Toute évolution de la formule fait l'objet d'un audit séparé.
- Les nouveaux champs doivent être protégés par la policy RLS `only_service_role_can_set_sensitive_fields` (extension de l'existante) : seul le service role (et donc les webhooks signés) peut les écrire.

---

## 6. Ordre recommandé des patchs (1 patch = 1 objectif)

| # | Objectif | Périmètre |
|---|---|---|
| 0 | **Document chantier Stripe** (le présent fichier) — ✅ FAIT | `docs/TRACEA_chantier_stripe_lancement_public.md` |
| 1 | Migration DB : ajouter les 10 champs Stripe en nullable — ✅ FAIT (exécuté Supabase 2026-05-02, vérifié) | `supabase/add_stripe_subscription_fields.sql` |
| 2 | Durcir RLS sur ces champs (policies restrictives UPDATE + INSERT) — ✅ FAIT (exécuté Supabase 2026-05-02, vérifié) | `supabase/restrict_stripe_subscription_fields_rls.sql` |
| 3 | Installer Stripe SDK + créer `.env.example` documentant `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY_ID`, `STRIPE_PRICE_YEARLY_ID`, `STRIPE_ENABLED`, `NEXT_PUBLIC_APP_URL` — ✅ FAIT — Stripe SDK installé + `.env.example` créé — Stripe dormant | `package.json`, `.env.example` |
| 4 | Exposer les nouveaux champs dans `auth-context` (lecture seule, sans changer la logique premium) — ✅ FAIT — auth-context lit les champs Stripe en lecture seule, sans changer `hasPremiumAccess` | `src/lib/auth-context.tsx` |
| 5 | Route checkout `POST /api/subscribe` ; **inactive si `STRIPE_ENABLED=false`** (renvoie 503 ou 403 explicite) — ✅ FAIT — route `/api/subscribe` checkout Stripe préparée, inactive si `STRIPE_ENABLED=false` | `src/app/api/subscribe/route.ts` |
| 6 | Route webhook `POST /api/stripe/webhook` (vérification signature, idempotence) — ✅ FAIT — webhook Stripe créé, signature vérifiée, synchronisation `profiles`, dormant si `STRIPE_ENABLED=false` | `src/app/api/stripe/webhook/route.ts` (nouveau) |
| 7 | UI `/app/subscribe` conditionnelle au drapeau (cartes prix cliquables, états Stripe, suppression des "arrive bientôt") — ⏳ **prochaine étape** | `src/app/app/subscribe/page.tsx` |
| 8 | UI `/app/profil` abonnement (statut, formule, date renouvellement, bouton portal) | `src/app/app/profil/page.tsx` (+ `auth-context` si nouveaux champs manquent) |
| 9 | Route Stripe Billing Portal `/api/subscribe/portal` + bouton dédié | `src/app/api/subscribe/portal/route.ts` (nouveau), `profil/page.tsx` |
| 10 | Sécurisation de la suppression de compte : empêcher si abonnement actif, étendre `deleteAccount` aux 5 tables manquantes (`tracea_events`, `ai_usage_logs`, `rate_limit_logs`, `session_summaries`, `user_memory_profile`), ajouter `auth.admin.deleteUser` | route serveur dédiée, `supabase-store.ts` |
| 11 | Audit final cohérence docs ↔ app avant activation publique : retirer commentaires "TODO Stripe", typecheck, tests manuels en mode test Stripe (`sk_test_*`) | – |

Chaque étape est isolée, testable, commitable indépendamment.

**Prochaine étape : PATCH 7** — UI `/app/subscribe` conditionnelle au drapeau Stripe, sans paiement visible tant que `STRIPE_ENABLED=false`. La règle `STRIPE_ENABLED=false` reste en vigueur ; aucun paiement ne doit être visible, aucun gating testeur ne doit changer, aucun checkout ne doit être actif.

Note : le webhook peut synchroniser `is_subscribed` et les champs `subscription_*` quand Stripe sera activé. Tant que `STRIPE_ENABLED=false`, il ignore les événements (200 + `ignored: true`) sans écrire en DB.

---

## 7. Risques P1 avant lancement public Stripe

- Checkout absent → impossible de souscrire.
- Webhook absent → aucun moyen de propager l'état d'abonnement en DB.
- Résiliation absente → CGU §9 (résiliation en ligne) non honorée.
- Suppression de compte avec abonnement actif → risque de prélèvements continus alors que le profil est supprimé.
- Paiement échoué (`past_due`) → aucune voie de récupération côté UI.
- Désynchronisation Stripe ↔ `profiles` → divergence persistante en cas d'event manqué.
- Documents légaux déjà en version "Stripe actif" mais app pas encore alignée → risque de pratique commerciale trompeuse (art. L. 121-1 Code de la consommation).

---

## 8. Règle de non-régression

Aucun patch Stripe ne doit bloquer les utilisateurs testeurs tant que `STRIPE_ENABLED=false` :

- les routes Stripe doivent renvoyer une réponse explicite et neutre (ni crash, ni redirection inattendue) ;
- les composants UI conditionnels au drapeau doivent rendre l'état actuel inchangé pour les testeurs ;
- la migration DB n'altère pas les colonnes existantes ;
- la RLS étendue ne doit pas casser les écritures profil existantes (display_name, etc.) ;
- l'exposition des nouveaux champs dans `auth-context` est strictement additive, sans changer la valeur de `hasPremiumAccess`.

À chaque patch : vérifier que le parcours testeur (compte gratuit, trial 7 jours, bêta) reste fonctionnel à l'identique.

---

## Backlog sécurité — dépendances npm

Lors de l'exécution de `npm install stripe` (PATCH 3, 2026-05-02), npm a signalé **7 vulnérabilités** dans le graphe de dépendances **préexistant** :

- 3 moderate
- 3 high
- 1 critical

Ces vulnérabilités **ne proviennent pas du paquet Stripe lui-même** : elles existent déjà dans les dépendances transitive de Next.js, ESLint, Tailwind, etc. Elles n'ont pas été corrigées dans le PATCH 3 et restent **hors périmètre** du chantier Stripe.

### Règles à tenir

- **Ne pas lancer `npm audit fix` automatiquement** dans le cadre des chantiers Stripe.
- **Ne pas corriger** ces vulnérabilités en passant, même si elles paraissent triviales.
- Les corriger uniquement après un audit dédié, avec :
  - identification exacte des paquets concernés (`npm audit --json`) ;
  - évaluation de l'impact réel (chemin d'attaque, exploitabilité dans le contexte TRACÉA) ;
  - recensement des risques de breaking changes (notamment Next.js et ESLint) ;
  - décision d'un plan de correction sécurisé (mises à jour ciblées vs. `npm audit fix --force`).

### Chantier séparé proposé

**Audit dépendances npm / vulnérabilités** — à programmer :

- soit après les chantiers Stripe prioritaires (PATCH 4 → PATCH 11), si le risque résiduel est jugé acceptable ;
- soit **avant le lancement public large**, si l'audit révèle une vulnérabilité critique réellement exploitable côté production.

À défaut, traiter au minimum la critique en priorité dès qu'un créneau dédié est ouvert.

---

## Lien utile

- Audit transversal cohérence légale ↔ produit (réalisé le 2026-05-02) : voir l'historique des messages internes du chantier légal et le rapport Stripe.
- Pack légal en vigueur : [mentions-legales](../src/app/mentions-legales/page.tsx), [politique-confidentialite](../src/app/politique-confidentialite/page.tsx), [conditions-utilisation](../src/app/conditions-utilisation/page.tsx).
