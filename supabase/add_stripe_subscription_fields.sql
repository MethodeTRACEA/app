-- ===================================================================
-- TRACÉA — Migration : ajouter les champs Stripe à public.profiles
-- ===================================================================
-- Patch 1 du chantier Stripe (cf. docs/TRACEA_chantier_stripe_lancement_public.md).
--
-- Objectif :
--   Préparer en mode dormant les colonnes nécessaires à l'intégration
--   Stripe (abonnement Premium 9 €/mois et 78 €/an), sans exposer le
--   paiement aux testeurs et sans modifier le gating actuel
--   (`hasPremiumAccess`, gate /app/session 5/5, etc.).
--
-- IMPORTANT : ne pas exécuter cette migration seule en production sans
-- appliquer immédiatement la migration RLS Stripe correspondante. Ces
-- champs sont sensibles et doivent être protégés contre toute
-- modification client.
--
-- Contenu :
--   - 10 colonnes ajoutées à public.profiles, toutes nullable sauf
--     subscription_cancel_at_period_end (default false).
--   - 3 contraintes CHECK pour valider les valeurs de plan, statut et
--     la cohérence temporelle.
--   - 4 index : 2 uniques partiels + 2 simples.
--
-- Ce que cette migration NE fait PAS :
--   - aucune insertion ni mise à jour des profils existants ;
--   - aucun trigger, aucune fonction, aucun webhook ;
--   - aucune table d'événements Stripe ;
--   - aucune modification des policies RLS (cf. patch 2 dédié).
-- ===================================================================

-- ─── Colonnes ───────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_status text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS subscription_plan text,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;

-- ─── Contraintes CHECK (idempotentes) ──────────────────────────────

DO $$
BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_subscription_plan_check
    CHECK (
      subscription_plan IS NULL
      OR subscription_plan IN ('monthly', 'yearly')
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_stripe_subscription_status_check
    CHECK (
      stripe_subscription_status IS NULL
      OR stripe_subscription_status IN (
        'active',
        'trialing',
        'past_due',
        'canceled',
        'incomplete',
        'incomplete_expired',
        'unpaid',
        'paused'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_subscription_period_consistency_check
    CHECK (
      subscription_current_period_end IS NULL
      OR subscribed_at IS NULL
      OR subscription_current_period_end >= subscribed_at
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── Index ─────────────────────────────────────────────────────────

-- Unicité partielle : un même customer Stripe ne peut être lié qu'à
-- un seul profil. On laisse NULL libre (plusieurs profils peuvent
-- ne pas avoir de customer Stripe avant souscription).
CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_customer_id_unique
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Unicité partielle : une subscription Stripe ne peut référencer qu'un
-- seul profil.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_subscription_id_unique
  ON public.profiles (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Index de filtrage côté webhook / admin (statut courant).
CREATE INDEX IF NOT EXISTS profiles_stripe_subscription_status_idx
  ON public.profiles (stripe_subscription_status);

-- Index pour les jobs périodiques (renouvellements, expirations).
CREATE INDEX IF NOT EXISTS profiles_subscription_current_period_end_idx
  ON public.profiles (subscription_current_period_end);

-- ===================================================================
-- VÉRIFICATIONS POST-MIGRATION (à exécuter à la main)
-- ===================================================================
--
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'profiles'
--   AND column_name LIKE 'stripe_%'
--      OR column_name LIKE 'subscription_%'
--      OR column_name IN ('subscribed_at', 'unsubscribed_at')
-- ORDER BY column_name;
--
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.profiles'::regclass
--   AND conname LIKE '%subscription%';
--
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename = 'profiles'
--   AND (indexname LIKE 'profiles_stripe_%' OR indexname LIKE 'profiles_subscription_%');
-- ===================================================================
