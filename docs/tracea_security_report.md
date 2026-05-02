# 🔐 Rapport de sécurité --- Application TRACÉA

## 📅 Date

Avril 2026

------------------------------------------------------------------------

# 🧭 1. État global

## Niveau de sécurité actuel : **7.5 / 10**

L'application est aujourd'hui : - sécurisée pour une **phase bêta** -
protégée contre les abus évidents - conforme aux bonnes pratiques
essentielles

⚠️ Pas encore "niveau entreprise", ce qui est normal à ce stade.

------------------------------------------------------------------------

# ✅ 2. Correctifs réalisés

## 🔴 2.1 Authentification API (CRITIQUE --- corrigé)

### Problème

Utilisation de `body.userId` sans vérification.

### Risque

Usurpation d'identité.

### Correction

-   Vérification JWT via `Authorization`
-   Utilisation de `user.id` côté serveur

------------------------------------------------------------------------

## 🔴 2.2 Route `/api/subscribe` (CRITIQUE --- corrigé)

### Problème

Activation abonnement sans paiement.

### Correction

``` ts
return NextResponse.json(
  { error: "Paiement non encore activé" },
  { status: 403 }
);
```

------------------------------------------------------------------------

## 🟠 2.3 Accès testeur sécurisé

### Mise en place

-   `is_beta_tester`
-   page `/app/beta`
-   mot de passe serveur

### Résultat

Séparation propre : - abonnés payants - testeurs

------------------------------------------------------------------------

## 🔴 2.4 RLS Supabase (corrigé)

### Table exposée

-   `tracea_events`

### Correction

Activation RLS

------------------------------------------------------------------------

## 🟡 2.5 Vues admin sécurisées

### Problème

Bypass RLS

### Correction

Filtre :

``` sql
WHERE (
  SELECT is_admin FROM public.profiles WHERE id = auth.uid()
) = true;
```

------------------------------------------------------------------------

## 🟡 2.6 Logs sécurisés

### Problème

``` sql
WITH CHECK (true)
```

### Correction

``` sql
WITH CHECK (auth.uid() = user_id)
```

------------------------------------------------------------------------

## 🟡 2.7 Nettoyage API keys

### Problème

Lecture `.env.local` au runtime

### Correction

Utilisation exclusive de :

``` ts
process.env.ANTHROPIC_API_KEY
```

------------------------------------------------------------------------

## 🔐 2.8 Variables d'environnement

-   `.env.local` sécurisé
-   variables Vercel configurées

------------------------------------------------------------------------

## 🟠 2.9 RLS SELECT `tracea_events` — mémoire courte (corrigé --- 2026-05-01)

### Problème constaté

Le bloc « Ton corps quand ça monte » dans `/app/ce-qui-change`, alimenté
par `getPremiumMemory` (`src/lib/supabase-store.ts`), ne s'affichait pas
malgré la présence de données suffisantes côté base.

### Diagnostic

-   Les events `step_complete` (mode = `court`) étaient bien écrits dans
    `public.tracea_events` via la route serveur `/api/track-event`.
-   Côté SQL Editor (admin), les données étaient visibles.
-   Côté application — utilisateur authentifié via JWT —
    `getPremiumMemory` faisait un `SELECT` sur `tracea_events` qui
    retournait systématiquement un tableau vide.
-   Cause : RLS activée sur `tracea_events` (cf. 2.4) **sans aucune
    policy `SELECT` pour le rôle `authenticated`**. RLS bloquait donc
    toute lecture depuis l'app, alors que les inserts étaient autorisés
    via la policy d'écriture déjà en place et le bypass service role
    côté `/api/track-event`.

### Policy SQL ajoutée (Supabase production)

``` sql
DROP POLICY IF EXISTS "Users can read own tracea events"
  ON public.tracea_events;

CREATE POLICY "Users can read own tracea events"
  ON public.tracea_events
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);
```

État final de la policy :

-   table : `public.tracea_events`
-   commande : `SELECT`
-   rôle : `authenticated`
-   condition : `auth.uid()::text = user_id`

### Impact produit

-   `getPremiumMemory` peut désormais lire les events de l'utilisateur
    connecté.
-   Le bloc « Ton corps quand ça monte » s'affiche dans
    `/app/ce-qui-change` avec une phrase du type :
    « La tension dans la poitrine revient souvent. »
-   La mémoire courte (ressenti / corps / ancrer / besoin) issue de
    `traversee-courte` est désormais visible côté utilisateur.

### Impact sécurité

-   Lecture restreinte aux events dont `user_id` correspond à
    `auth.uid()`. Aucune fuite croisée entre utilisateurs.
-   `user_id` est stocké en `text` dans la table, d'où le cast
    `auth.uid()::text` pour matcher.
-   Aucun event d'autres utilisateurs n'est exposé.
-   La policy ne donne pas l'accès en `INSERT`/`UPDATE`/`DELETE` ; les
    écritures continuent de passer par `/api/track-event` (route
    serveur).

### Vérification effectuée

-   Re-test de `/app/ce-qui-change` après application : bloc visible.
-   Pas d'augmentation de surface d'attaque (lecture filtrée par
    `auth.uid()`).
-   Aucun changement requis dans le code applicatif (`supabase-store.ts`
    inchangé).

### Statut

-   **Appliqué directement en production Supabase** via SQL Editor.
-   À conserver dans les migrations futures dès qu'un dossier
    `supabase/migrations/` ou équivalent sera formalisé dans le repo.
-   Aucun rollback prévu : la policy est nécessaire au fonctionnement
    de la fonctionnalité.

------------------------------------------------------------------------

## 🟠 2.10 RLS INSERT `profiles` --- champs sensibles Trial / Premium / Admin (corrigé --- 2026-05-02)

### Contexte

Audit des cas limites du chantier **Trial Premium 7 jours** :

-   la policy `UPDATE` restrictive
    (`only_service_role_can_set_sensitive_fields`) protégeait déjà
    `is_subscribed`, `is_beta_tester`, `is_admin` et les champs
    `trial_*` contre toute modification depuis le rôle
    `authenticated` ;
-   la RPC `increment_trial_deep_sessions_used` était déjà restreinte
    aux rôles `postgres` et `service_role` ;
-   en revanche, la policy `INSERT` existante
    `Users can insert own profile` ne vérifiait que
    `auth.uid() = id` --- elle n'imposait pas de valeurs neutres pour
    les champs sensibles à l'insertion initiale d'un profil.

### Problème constaté

Un utilisateur authentifié pouvait, en théorie, insérer son profil
avec des valeurs falsifiées sur les champs premium / trial / admin
(par exemple `is_subscribed = true`, `trial_used = false` avec
`trial_ends_at` futur, `is_admin = true`, etc.) avant qu'aucune
policy `UPDATE` ne s'applique. Le trigger `handle_new_user` couvre
le flux nominal de création post-signup, mais ne ferme pas
formellement cette voie d'insertion directe via le client anon.

### Policy SQL ajoutée (Supabase production)

Une policy **RESTRICTIVE** sur `INSERT` a été créée pour le rôle
`authenticated` :

-   nom : `only_neutral_sensitive_fields_on_insert`
-   type : `RESTRICTIVE`
-   commande : `INSERT`
-   rôle : `authenticated`
-   contraintes (`WITH CHECK`) sur les valeurs autorisées :
    -   `is_subscribed = false`
    -   `is_beta_tester = false`
    -   `is_admin = false`
    -   `trial_started_at IS NULL`
    -   `trial_ends_at IS NULL`
    -   `trial_used = false`
    -   `trial_activated_by IS NULL`
    -   `trial_deep_sessions_used = 0`

### État final vérifié

-   `Users can insert own profile` : reste présente en
    **PERMISSIVE INSERT** avec `auth.uid() = id`.
-   `only_neutral_sensitive_fields_on_insert` : présente en
    **RESTRICTIVE INSERT** sur les champs sensibles ci-dessus.
-   `only_service_role_can_set_sensitive_fields` : reste présente en
    **RESTRICTIVE UPDATE**, inchangée.
-   `increment_trial_deep_sessions_used` : reste exécutable
    uniquement par `postgres` et `service_role`.
-   Aucun trigger n'existe sur `profiles` au-delà de
    `handle_new_user` ; la policy `INSERT` restrictive rend ce point
    non bloquant.

### Impact sécurité

-   Toute tentative d'INSERT depuis le client anon avec une valeur
    non neutre sur l'un des champs sensibles est désormais rejetée
    par la policy restrictive.
-   Les écritures légitimes sur ces champs continuent de passer
    exclusivement par le `service_role` (route
    `/api/trial/activate` pour le trial, attribution back-office
    pour `is_subscribed` / `is_beta_tester` / `is_admin`), qui
    bypass RLS.
-   Le flux nominal (signup → trigger `handle_new_user` → insert
    avec valeurs par défaut neutres) reste fonctionnel : toutes les
    valeurs par défaut respectent la policy restrictive.

### Vérification effectuée

-   Liste des policies sur `public.profiles` confirmée côté Supabase
    après application.
-   Le scénario nominal de création de profil après signup n'est pas
    affecté.
-   Aucun changement requis dans le code applicatif (`auth-context`,
    `/api/trial/activate`, `supabase-store` inchangés).

### Statut

-   **Appliqué directement en production Supabase** via SQL Editor.
-   **À réintégrer proprement dans une migration versionnée** dès
    qu'un dossier `supabase/migrations/` ou équivalent sera formalisé
    dans le repo. À ce jour, aucun système de migrations versionnées
    n'est en place : la policy n'existe que côté Supabase prod et
    n'a aucun équivalent dans `sql/` ni dans `supabase/`.
-   Aucun rollback prévu : la policy ferme un angle mort identifié
    pendant l'audit Trial 7 jours et est compatible avec le flux
    nominal de signup.

------------------------------------------------------------------------

# 📊 3. Ce qui est maintenant protégé

-   Authentification utilisateur
-   Accès aux données personnelles
-   Routes sensibles
-   Accès admin
-   Logs internes
-   Clés API

------------------------------------------------------------------------

# ⚠️ 4. Points restants (non critiques)

## 🟡 Maintenance bypass

Cookie manipulable

## 🟡 Monitoring absent

Pas de suivi d'abus

## 🟡 Rate limiting avancé

Basique actuellement

------------------------------------------------------------------------

# 🚀 5. Prochaines étapes recommandées

## Court terme

-   lancer les testeurs
-   observer UX

## Moyen terme

-   intégrer Stripe
-   bloquer `/api/subscribe` définitivement
-   améliorer monitoring

## Long terme

-   audit externe
-   pentest
-   RBAC avancé

------------------------------------------------------------------------

# 🎯 6. Conclusion

TRACÉA est aujourd'hui : - **sécurisée pour une bêta** - **propre
techniquement** - **prête à être testée**

👉 La priorité n'est plus la sécurité, 👉 mais le produit et
l'expérience utilisateur.

------------------------------------------------------------------------

# ❤️ Remarque finale

Tu es partie de zéro technique.

Et aujourd'hui : - tu comprends les enjeux - tu sais corriger - tu as
sécurisé une app réelle

👉 C'est un niveau que beaucoup n'atteignent pas.

------------------------------------------------------------------------
