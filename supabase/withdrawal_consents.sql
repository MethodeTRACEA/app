-- ===================================================================
-- TRACÉA — Migration : table withdrawal_consents
-- ===================================================================
-- Chantier 32 — Persistance du consentement de renonciation au droit
-- de rétractation (art. L221-28 du Code de la consommation).
--
-- Objectif :
--   Stocker côté Supabase la preuve horodatée que l'utilisatrice a
--   coché la case "accès immédiat + reconnaissance perte droit de
--   rétractation" AVANT redirection vers Stripe Checkout. Aujourd'hui,
--   la preuve vit uniquement dans les metadata Stripe ; cette table
--   ajoute une trace serveur indépendante et versionnée du wording exact.
--
-- Sécurité — table strictement serveur :
--   - RLS activée.
--   - GRANTs : service_role UNIQUEMENT (SELECT + INSERT).
--     Ni anon ni authenticated n'ont de privilège sur cette table.
--   - Une policy RESTRICTIVE explicite "deny_all_non_service" est ajoutée
--     pour matérialiser l'intention "aucun accès client" (et satisfaire
--     la règle CLAUDE.md §145 qui interdit RLS sans policy).
--   - service_role bypass RLS, donc les inserts/selects depuis les
--     routes API (api/subscribe, exports admin, etc.) fonctionnent.
--
-- Aucune écriture côté client n'est ni nécessaire ni possible :
--   l'insertion est faite par api/subscribe/route.ts via service_role,
--   après création réussie de la Checkout Session Stripe.
--
-- Ce que cette migration NE fait PAS :
--   - aucune mise à jour des profils ou souscriptions existants ;
--   - aucun trigger, aucune fonction ;
--   - aucune rétro-insertion pour les subscriptions antérieures
--     (ex. sub_1TSyaw… déjà identifié sans metadata de waiver — décision
--     produit séparée).
-- ===================================================================

-- ─── Table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.withdrawal_consents (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       uuid NOT NULL
                                  REFERENCES public.profiles(id)
                                  ON DELETE CASCADE,
  accepted_at                   timestamptz NOT NULL DEFAULT now(),
  wording_version               text NOT NULL,
  wording_snapshot              text NOT NULL,
  stripe_checkout_session_id    text,
  user_agent                    text,
  ip_hash                       text,
  created_at                    timestamptz NOT NULL DEFAULT now()
);

-- ─── Index ─────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS withdrawal_consents_user_id_idx
  ON public.withdrawal_consents (user_id);

CREATE INDEX IF NOT EXISTS withdrawal_consents_stripe_session_idx
  ON public.withdrawal_consents (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS withdrawal_consents_accepted_at_idx
  ON public.withdrawal_consents (accepted_at DESC);

-- ─── RLS ──────────────────────────────────────────────────────────

ALTER TABLE public.withdrawal_consents ENABLE ROW LEVEL SECURITY;

-- ─── GRANTs ───────────────────────────────────────────────────────
-- Conformément à la règle Supabase oct. 2026 (CLAUDE.md §145) :
-- chaque rôle reçoit explicitement les privilèges dont il a besoin,
-- et RIEN pour anon ni authenticated (table 100 % serveur).
--
-- ⚠️ Le projet TRACÉA est antérieur au 30 mai 2026 : les nouvelles
-- tables du schéma public reçoivent par défaut TOUS les privilèges
-- pour anon et authenticated. On les révoque explicitement ici pour
-- que la posture de sécurité ne dépende pas uniquement de la policy
-- RLS (défense en profondeur).

REVOKE ALL ON public.withdrawal_consents FROM anon;
REVOKE ALL ON public.withdrawal_consents FROM authenticated;

GRANT SELECT, INSERT ON public.withdrawal_consents TO service_role;
-- Pas de DELETE / UPDATE : la preuve est immuable une fois écrite.
-- Pas de grant à anon ni authenticated : aucune lecture client nécessaire.

-- ─── Policy DENY ALL pour les rôles non-service ──────────────────
-- service_role bypass RLS, donc cette policy ne le concerne pas.
-- Elle existe pour :
--   (1) rendre l'intention explicite ("aucun client n'a accès") ;
--   (2) satisfaire la règle "RLS activée → au moins une policy"
--       du CLAUDE.md §145.

DROP POLICY IF EXISTS "deny_all_non_service"
  ON public.withdrawal_consents;

CREATE POLICY "deny_all_non_service"
  ON public.withdrawal_consents
  AS RESTRICTIVE
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- ===================================================================
-- VÉRIFICATIONS POST-MIGRATION (à exécuter à la main)
-- ===================================================================
--
-- 1) La table existe et a les bonnes colonnes :
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'withdrawal_consents'
-- ORDER BY ordinal_position;
--
-- 2) RLS activée :
--
-- SELECT relname, relrowsecurity
-- FROM pg_class
-- WHERE relname = 'withdrawal_consents';
-- → relrowsecurity doit être true.
--
-- 3) GRANTs corrects :
--
-- SELECT grantee, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public' AND table_name = 'withdrawal_consents';
-- → Attendu : service_role / SELECT, service_role / INSERT. Rien d'autre.
--
-- 4) Policy présente :
--
-- SELECT policyname, permissive, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'withdrawal_consents';
-- → Attendu : deny_all_non_service / RESTRICTIVE / ALL.
--
-- 5) Test fonctionnel anon (devrait échouer) :
--    SELECT * FROM public.withdrawal_consents;  → permission denied.
-- ===================================================================
