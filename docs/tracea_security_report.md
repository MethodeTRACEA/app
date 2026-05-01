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
