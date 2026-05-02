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
| 7a | Ajouter `NEXT_PUBLIC_STRIPE_ENABLED=false` dans `.env.example` + documenter le double drapeau (serveur vs UI) — ✅ FAIT | `.env.example`, `docs/TRACEA_chantier_stripe_lancement_public.md` |
| 7 | UI `/app/subscribe` conditionnelle au drapeau (cartes prix cliquables, états Stripe, suppression des "arrive bientôt") — ⏸️ **différé** (à reprendre quand Stripe Dashboard sera configuré et que PATCH 8b + PATCH 9 sont prêts) | `src/app/app/subscribe/page.tsx` |
| 8a | UI `/app/profil` enrichie : statuts abonnement Stripe en lecture seule (annulation programmée, past_due, formule + date de renouvellement, abonnement terminé) — ✅ FAIT — sans bouton portal, sans appel API, dormant | `src/app/app/profil/page.tsx` |
| 8b | UI `/app/profil` : ajouter les boutons "Gérer mon abonnement" et "Mettre à jour mon paiement" — ⏸️ **différé** (à livrer en bundle avec PATCH 9) | `src/app/app/profil/page.tsx` |
| 9 | Route Stripe Billing Portal `/api/subscribe/portal` + bouton dédié — ⏳ **prochaine étape** | `src/app/api/subscribe/portal/route.ts` (nouveau), `profil/page.tsx` |
| 10 | Sécurisation de la suppression de compte : empêcher si abonnement actif, étendre `deleteAccount` aux 5 tables manquantes (`tracea_events`, `ai_usage_logs`, `rate_limit_logs`, `session_summaries`, `user_memory_profile`), ajouter `auth.admin.deleteUser` | route serveur dédiée, `supabase-store.ts` |
| 11 | Audit final cohérence docs ↔ app avant activation publique : retirer commentaires "TODO Stripe", typecheck, tests manuels en mode test Stripe (`sk_test_*`) | – |

Chaque étape est isolée, testable, commitable indépendamment.

**Prochaine étape : PATCH 9** — route `/api/subscribe/portal` (Stripe Billing Portal) pour permettre la gestion d'abonnement et la résiliation depuis l'app, conformément à l'engagement CGU §9 (résiliation en ligne). Sera livrée en bundle avec **PATCH 8b** (boutons "Gérer mon abonnement" / "Mettre à jour mon paiement" sur `/app/profil`).

**Étape différée : PATCH 7** — UI `/app/subscribe` conditionnelle. À reprendre quand PATCH 8b + PATCH 9 sont prêts et que la fenêtre de test bout-en-bout est ouverte.

Note : le profil est désormais prêt à afficher correctement un abonnement après synchronisation webhook (PATCH 8a). En revanche, **l'utilisateur ne peut pas encore gérer ni résilier son abonnement depuis l'app tant que PATCH 9 n'est pas livré.** Tant que `STRIPE_ENABLED=false`, le webhook ignore les événements (200 + `ignored: true`) sans écrire en DB et aucun utilisateur ne se trouve en état abonné — l'absence des boutons portal reste donc invisible aux testeurs.

---

## Audit `/app/subscribe` Stripe dormant — 2026-05-02

### Décision : PATCH 7 différé

L'audit lecture seule de `/app/subscribe` du 2026-05-02 a conclu que la page **doit rester strictement inchangée** tant que Stripe n'est pas activé.

- La page reste à son état post commit `76bb5ed` (cascade abonné → bêta → trial actif → trial utilisé → free idle).
- Le message *"L'abonnement payant arrive bientôt."* (présent 3 fois) reste cohérent avec la phase testeurs : il dit la vérité opérationnelle.
- Aucun bouton paiement ne doit apparaître tant que `NEXT_PUBLIC_STRIPE_ENABLED=false`.
- Les 8 champs Stripe exposés dans `auth-context` (`stripeSubscriptionStatus`, `subscriptionPlan`, `subscriptionCurrentPeriodEnd`, etc.) **restent inutilisés côté UI** tant que Stripe est dormant — leur consommation aurait des effets nuls (champs DB tous NULL/false) mais introduirait du code mort à valider plus tard.

### Double drapeau

À partir de PATCH 7a :

| Drapeau | Portée | Rôle |
|---|---|---|
| `STRIPE_ENABLED` | serveur (`process.env.*`) | bloque routes Stripe (`/api/subscribe`, `/api/stripe/webhook`) tant qu'il n'est pas à `"true"` |
| `NEXT_PUBLIC_STRIPE_ENABLED` | client (bundlé Next.js) | bloque l'affichage des CTA paiement et la consommation des champs Stripe d'`auth-context` côté UI |

Les deux doivent être basculés à `"true"` ensemble pour rendre Stripe pleinement actif. Aucun secret ne doit jamais être préfixé `NEXT_PUBLIC_*` (cf. note dans `.env.example`).

### Conditions de reprise du PATCH 7

À déclencher **uniquement quand l'ensemble des conditions est rempli** :
- compte Stripe configuré (produits **TRACÉA Premium Mensuel** et **TRACÉA Premium Annuel** créés à 9 €/mois et 78 €/an) ;
- `STRIPE_PRICE_MONTHLY_ID` et `STRIPE_PRICE_YEARLY_ID` disponibles ;
- URL du webhook configurée dans le Stripe Dashboard et `STRIPE_WEBHOOK_SECRET` obtenu ;
- variables d'environnement posées en production (Vercel) : `STRIPE_ENABLED`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY_ID`, `STRIPE_PRICE_YEARLY_ID`, `NEXT_PUBLIC_STRIPE_ENABLED`, `NEXT_PUBLIC_APP_URL` ;
- fenêtre de test bout-en-bout disponible (Stripe en mode test puis bascule live).

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

## Configuration Stripe Dashboard test — 2026-05-03

Le chantier opérationnel Stripe Dashboard a avancé en environnement **test** uniquement. Aucune bascule en mode live, aucune activation produit côté utilisateur.

### Produit Stripe test

- **Nom** : TRACÉA Premium
- **Environnement** : test
- **Type** : abonnement récurrent

### Tarifs test créés

| Formule | Prix | Identifiant Stripe |
|---|---|---|
| Mensuel | 9 €/mois | `price_1TSlF4Pq9ZggxTJY5HOfr3l4` |
| Annuel | 78 €/an | `price_1TSlF4Pq9ZggxTJYh2l8Docp` |

Ces identifiants seront posés dans les variables d'environnement Vercel uniquement au moment de la fenêtre de test bout-en-bout :

```
STRIPE_PRICE_MONTHLY_ID=price_1TSlF4Pq9ZggxTJY5HOfr3l4
STRIPE_PRICE_YEARLY_ID=price_1TSlF4Pq9ZggxTJYh2l8Docp
```

Les `price_*` ne sont pas des secrets : ils sont publics par nature (référencés côté serveur dans `/api/subscribe` et côté webhook pour le mapping plan ↔ priceId). Ils peuvent figurer dans la documentation du repo.

### Webhook test créé

- **Nom** : TRACÉA webhook test
- **URL** : `https://www.methodetracea.fr/api/stripe/webhook`
- **Environnement** : test
- **Statut** : actif côté Dashboard Stripe (mais inerte côté serveur tant que `STRIPE_ENABLED=false` — voir route `/api/stripe/webhook`)
- **Événements sélectionnés** :
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

Cette liste correspond exactement aux events traités par la route webhook (PATCH 6). Aucun event supplémentaire n'est requis pour la V1.

### Secrets test obtenus

Les secrets suivants ont été copiés localement par Alyson :
- `STRIPE_SECRET_KEY` (préfixe `sk_test_*`)
- `STRIPE_WEBHOOK_SECRET` (préfixe `whsec_*`)

⚠️ **Ces secrets ne doivent JAMAIS** :
- être écrits dans le chat ;
- être committés dans un fichier versionné (incluant `.env.example`) ;
- être collés dans la documentation du repo ;
- être préfixés `NEXT_PUBLIC_*`.

Ils ne vivent que dans `.env.local` (ignoré par git) et, au moment voulu, dans le tableau de bord Vercel (variables d'environnement projet).

### Variables Vercel Stripe test — mode dormant

Les variables Stripe test ont été posées dans Vercel pour le projet TRACÉA, en environnement **Production and Preview**, **sans redéploiement déclenché** à ce stade.

| Variable | Valeur posée | Sensitive ? |
|---|---|---|
| `STRIPE_ENABLED` | `false` | non |
| `NEXT_PUBLIC_STRIPE_ENABLED` | `false` | non |
| `STRIPE_PRICE_MONTHLY_ID` | `price_1TSlF4Pq9ZggxTJY5HOfr3l4` | non (identifiant public) |
| `STRIPE_PRICE_YEARLY_ID` | `price_1TSlF4Pq9ZggxTJYh2l8Docp` | non (identifiant public) |
| `STRIPE_SECRET_KEY` | `sk_test_*` | **Sensitive** |
| `STRIPE_WEBHOOK_SECRET` | `whsec_*` | **Sensitive** |
| `NEXT_PUBLIC_APP_URL` | `https://www.methodetracea.fr` | non |

- Les deux drapeaux à `false` empêchent **toute** activation Stripe : `/api/subscribe` retourne 403, `/api/stripe/webhook` retourne 200 + `ignored: true`, et l'UI ne montre rien tant que `NEXT_PUBLIC_STRIPE_ENABLED=false`.
- `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` sont marquées **Sensitive** dans Vercel : leur valeur ne se réaffiche plus en clair dans le dashboard après écriture.
- Un **redeploy Vercel sera nécessaire** pour que les nouvelles variables soient effectivement chargées par les fonctions serverless. **Ne pas cliquer sur Redeploy par réflexe** : le faire seulement quand une fenêtre de test bout-en-bout est ouverte (cf. "Prochaine étape" ci-dessous).
- Tant qu'aucun redeploy n'est déclenché, les fonctions serverless tournent toujours avec l'ancien environnement (sans variables Stripe). Stripe reste donc doublement dormant : pas de variables effectives **et** drapeaux à `false`.

#### Note de sécurité

- `sk_test_*` et `whsec_*` **ne doivent jamais** être écrites dans le chat, le repo, `.env.example`, ni dans une variable `NEXT_PUBLIC_*`. Elles vivent uniquement dans `.env.local` (dev) et dans Vercel (prod), Sensitive.
- `NEXT_PUBLIC_APP_URL` et les `price_*` ne sont **pas** des secrets : ils figurent dans le bundle client par construction (`NEXT_PUBLIC_*`) ou dans la config publique. Pas de risque à les documenter ici.

#### Redeploy dormant Vercel — 2026-05-03

- **Statut** : Ready / Latest.
- **Environnement** : Production.
- **Branche** : `main`.
- **Variables effectives** : les variables Stripe test sont désormais **chargées par le déploiement** (les fonctions serverless les voient).
- **Drapeaux** : `STRIPE_ENABLED=false` et `NEXT_PUBLIC_STRIPE_ENABLED=false` — Stripe reste **dormant**.
- **Vérification post-déploiement** : l'application a été testée et fonctionne normalement. Aucun paiement visible, aucun checkout actif, aucun impact pour les testeurs.

L'effet net du redeploy est purement préparatoire : les fonctions serverless sont prêtes à utiliser les variables Stripe **dès que les drapeaux passeront à `true`**, sans nécessiter un redéploiement supplémentaire à ce moment-là.

#### Warnings de build Vercel — observés au redeploy 2026-05-03

Les logs Vercel affichent au déploiement des avertissements orange :

- plusieurs `npm WARN deprecated` sur des dépendances transitive ;
- un avertissement de sécurité ciblant **`next@14.2.21`**.

**Ce ne sont pas des échecs de déploiement** : le build a réussi (statut Ready). Les warnings sont informatifs.

À tenir :
- **Ne pas lancer `npm audit fix` automatiquement** dans le cadre de ce chantier Stripe.
- Conserver le sujet dans le backlog séparé existant : *"Audit dépendances npm / vulnérabilités Next"* (cf. section "Backlog sécurité — dépendances npm" plus bas dans ce document). L'avertissement sur `next@14.2.21` y est désormais explicitement listé comme cible prioritaire d'audit.

### État dormant confirmé

Malgré la configuration Dashboard test :
- `STRIPE_ENABLED` reste `false`.
- `NEXT_PUBLIC_STRIPE_ENABLED` reste `false`.
- Aucun paiement n'est visible côté utilisateur.
- Aucun checkout n'est actif côté UI.
- Aucune route Stripe ne s'initialise côté serveur.
- Aucun event webhook ne donne lieu à une écriture DB (la route renvoie 200 + `ignored: true`).
- Aucun impact pour les testeurs : trial 7 jours, accès bêta et parcours gratuit fonctionnent à l'identique.

### Prochaine étape

1. Variables Stripe test **déjà posées** dans Vercel (Production and Preview), drapeaux à `false`. Aucun redeploy déclenché : décider quand le faire.
2. **Décision à prendre** : redeploy Vercel "dormant de sécurité" (pour que les variables soient chargées par les fonctions, sans changer le comportement puisque les drapeaux sont à `false`) **OU** attendre PATCH 7 et déclencher le redeploy en bundle avec la livraison UI.
3. **Ne pas** activer `STRIPE_ENABLED=true` ni `NEXT_PUBLIC_STRIPE_ENABLED=true` avant la livraison de :
   - PATCH 7 — UI `/app/subscribe` conditionnelle ;
   - PATCH 8 — UI `/app/profil` abonnement (statut, formule, date renouvellement, bouton portal) ;
   - PATCH 9 — route Stripe Billing Portal `/api/subscribe/portal` + bouton de résiliation ;
   - test bout-en-bout en mode Stripe test (`sk_test_*`), validation complète du parcours souscription + webhook + résiliation, puis bascule live.

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

### Cibles connues à inclure

- les 7 vulnérabilités initiales détectées au PATCH 3 (3 moderate, 3 high, 1 critical) ;
- l'**avertissement de sécurité sur `next@14.2.21`** observé lors du redeploy Vercel du 2026-05-03 (cf. section "Warnings de build Vercel" ci-dessus). Toute mise à niveau de Next.js doit être faite avec précaution : changement potentiel de comportement runtime (App Router, Edge runtime, middlewares).

---

## Lien utile

- Audit transversal cohérence légale ↔ produit (réalisé le 2026-05-02) : voir l'historique des messages internes du chantier légal et le rapport Stripe.
- Pack légal en vigueur : [mentions-legales](../src/app/mentions-legales/page.tsx), [politique-confidentialite](../src/app/politique-confidentialite/page.tsx), [conditions-utilisation](../src/app/conditions-utilisation/page.tsx).
