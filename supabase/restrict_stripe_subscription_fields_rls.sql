-- ===================================================================
-- TRACÉA — Migration RLS : protéger les champs Stripe de public.profiles
-- ===================================================================
-- Patch 2 du chantier Stripe (cf. docs/TRACEA_chantier_stripe_lancement_public.md).
--
-- DÉPENDANCE OBLIGATOIRE :
--   Ce fichier doit être exécuté APRÈS supabase/add_stripe_subscription_fields.sql.
--   Il référence les colonnes Stripe créées dans le patch 1. Si vous
--   exécutez ce fichier avant que les colonnes existent, les policies
--   échoueront à la création.
--
-- IMPORTANT :
--   Si vous appliquez le patch 1 en production, appliquez immédiatement
--   ce patch 2 dans la même séquence contrôlée. Sans cette migration RLS,
--   un utilisateur authentifié pourrait potentiellement falsifier ses
--   champs Stripe (statut d'abonnement, customer_id, etc.) via le client
--   Supabase anon.
--
-- Objectif :
--   Étendre la protection RLS existante (déjà appliquée en production
--   pour is_admin / is_beta_tester / is_subscribed / trial_*) aux 10
--   nouveaux champs Stripe, en :
--     1. Recréant la policy restrictive UPDATE
--        `only_service_role_can_set_sensitive_fields`
--     2. Recréant la policy restrictive INSERT
--        `only_neutral_sensitive_fields_on_insert`
--   Les policies permissives existantes (Users can view/update/insert
--   own profile) ne sont PAS supprimées : elles continuent de gérer les
--   accès normaux au profil. Les policies restrictives ajoutent une
--   couche de filtrage WITH CHECK qui empêche la modification des
--   colonnes sensibles, sans bloquer les autres champs (display_name,
--   etc.).
--
-- Notes produit :
--   - is_subscribed reste un booléen dérivé qui sera synchronisé plus
--     tard par les webhooks Stripe (via le service role qui bypass RLS).
--   - Le client ne doit jamais pouvoir modifier les champs Stripe :
--     toute écriture passe par les routes serveur Stripe (checkout,
--     webhook, portal).
--   - Tant que Stripe n'est pas actif (STRIPE_ENABLED=false), ces
--     champs doivent rester neutres pour tous les profils existants
--     et nouvellement créés.
--
-- Ce que ce patch NE fait PAS :
--   - aucune création de colonne (déjà faite par le patch 1) ;
--   - aucun trigger, aucune fonction, aucune table Stripe events ;
--   - aucune insertion ni mise à jour des profils existants ;
--   - aucune modification des policies permissives "Users can view /
--     update / insert own profile" ;
--   - aucun changement sur is_subscribed lui-même au-delà de la
--     protection RLS.
-- ===================================================================

-- ─── Sécurité de base ──────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ─── Policy RESTRICTIVE UPDATE — sensitive fields ─────────────────
--
-- Pattern utilisé pour chaque champ sensible :
--   NOT (col IS DISTINCT FROM (SELECT p.col FROM public.profiles p
--                              WHERE p.id = auth.uid()))
-- équivaut à "la nouvelle valeur égale strictement la valeur existante,
-- y compris dans la gestion des NULL". Cela bloque toute modification
-- côté client (rôle authenticated) tout en restant transparent pour
-- les écritures faites via le service role (qui bypass RLS).

DROP POLICY IF EXISTS "only_service_role_can_set_sensitive_fields"
  ON public.profiles;

CREATE POLICY "only_service_role_can_set_sensitive_fields"
  ON public.profiles
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    -- Champs sensibles existants
    NOT (is_subscribed IS DISTINCT FROM (
      SELECT p.is_subscribed FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (is_beta_tester IS DISTINCT FROM (
      SELECT p.is_beta_tester FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (is_admin IS DISTINCT FROM (
      SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (trial_started_at IS DISTINCT FROM (
      SELECT p.trial_started_at FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (trial_ends_at IS DISTINCT FROM (
      SELECT p.trial_ends_at FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (trial_used IS DISTINCT FROM (
      SELECT p.trial_used FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (trial_activated_by IS DISTINCT FROM (
      SELECT p.trial_activated_by FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (trial_deep_sessions_used IS DISTINCT FROM (
      SELECT p.trial_deep_sessions_used FROM public.profiles p WHERE p.id = auth.uid()
    ))
    -- Champs Stripe (patch 1)
    AND NOT (stripe_customer_id IS DISTINCT FROM (
      SELECT p.stripe_customer_id FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (stripe_subscription_id IS DISTINCT FROM (
      SELECT p.stripe_subscription_id FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (stripe_subscription_status IS DISTINCT FROM (
      SELECT p.stripe_subscription_status FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (stripe_price_id IS DISTINCT FROM (
      SELECT p.stripe_price_id FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (subscription_plan IS DISTINCT FROM (
      SELECT p.subscription_plan FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (subscription_current_period_end IS DISTINCT FROM (
      SELECT p.subscription_current_period_end FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (subscription_cancel_at_period_end IS DISTINCT FROM (
      SELECT p.subscription_cancel_at_period_end FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (subscription_canceled_at IS DISTINCT FROM (
      SELECT p.subscription_canceled_at FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (subscribed_at IS DISTINCT FROM (
      SELECT p.subscribed_at FROM public.profiles p WHERE p.id = auth.uid()
    ))
    AND NOT (unsubscribed_at IS DISTINCT FROM (
      SELECT p.unsubscribed_at FROM public.profiles p WHERE p.id = auth.uid()
    ))
  );

-- ─── Policy RESTRICTIVE INSERT — neutral sensitive fields ─────────
--
-- À la création d'un nouveau profil (typiquement via le trigger
-- handle_new_user déclenché par auth.users), tous les champs sensibles
-- doivent valoir leur valeur neutre. Cela ferme la voie à un INSERT
-- direct depuis le client anon avec des valeurs falsifiées.

DROP POLICY IF EXISTS "only_neutral_sensitive_fields_on_insert"
  ON public.profiles;

CREATE POLICY "only_neutral_sensitive_fields_on_insert"
  ON public.profiles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Champs sensibles existants
    is_subscribed = false
    AND is_beta_tester = false
    AND is_admin = false
    AND trial_started_at IS NULL
    AND trial_ends_at IS NULL
    AND trial_used = false
    AND trial_activated_by IS NULL
    AND trial_deep_sessions_used = 0
    -- Champs Stripe (patch 1)
    AND stripe_customer_id IS NULL
    AND stripe_subscription_id IS NULL
    AND stripe_subscription_status IS NULL
    AND stripe_price_id IS NULL
    AND subscription_plan IS NULL
    AND subscription_current_period_end IS NULL
    AND subscription_cancel_at_period_end = false
    AND subscription_canceled_at IS NULL
    AND subscribed_at IS NULL
    AND unsubscribed_at IS NULL
  );

-- ===================================================================
-- VÉRIFICATIONS POST-MIGRATION (à exécuter à la main)
-- ===================================================================
--
-- 1) Lister les policies sur profiles :
--
-- SELECT policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'profiles'
-- ORDER BY cmd, permissive, policyname;
--
-- Attendu :
--   - "Users can view own profile"        — PERMISSIVE / SELECT
--   - "Users can insert own profile"      — PERMISSIVE / INSERT
--   - "Users can update own profile"      — PERMISSIVE / UPDATE
--   - "only_neutral_sensitive_fields_on_insert"        — RESTRICTIVE / INSERT
--   - "only_service_role_can_set_sensitive_fields"     — RESTRICTIVE / UPDATE
--
-- 2) Vérifier que les policies restrictives référencent bien tous les
--    champs sensibles (recherche par expression) :
--
-- SELECT policyname, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename = 'profiles'
--   AND policyname LIKE 'only_%';
--
-- 3) Test fonctionnel manuel (en mode anon, utilisateur authentifié) :
--    - UPDATE profiles SET stripe_customer_id = 'cus_FAKE' WHERE id = auth.uid();
--      → doit échouer (RLS).
--    - INSERT INTO profiles (id, is_subscribed) VALUES (auth.uid(), true);
--      → doit échouer (RLS).
--    - UPDATE profiles SET display_name = 'Nouveau' WHERE id = auth.uid();
--      → doit réussir (champ non sensible).
-- ===================================================================
