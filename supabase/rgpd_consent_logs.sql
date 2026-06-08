-- ===================================================================
-- TRACÉA — Migration : verrouillage et extension de consent_logs
-- ===================================================================
-- Chantier 33 option 3 — Persistance du consentement RGPD art. 9
-- (3 cases du ConsentGate sur /app/session).
--
-- État avant cette migration :
--   - Table consent_logs existe (créée dans supabase-schema.sql).
--   - 2 policies permissives "Users can view/insert own consent logs"
--     autorisaient les inserts client-side via supabase-js.
--   - logConsent() existait dans le code mais n'était JAMAIS appelée :
--     la table est vide.
--   - GRANTs par défaut anon/authenticated présumés ouverts (régime
--     pré-30-mai-2026, cf. CLAUDE.md §145).
--
-- Objectif de cette migration :
--   1. Ajouter la colonne wording_snapshot text (nullable pour les
--      lignes existantes — il n'y en a pas — et pour les écritures
--      futures qui auraient un wording absent, cas dégradé).
--   2. Aligner la posture de sécurité sur withdrawal_consents :
--      table 100 % serveur, écritures via service_role uniquement
--      depuis la nouvelle route /api/consent.
--   3. Supprimer les policies permissives obsolètes.
--   4. REVOKE anon/authenticated, GRANT service_role, deny_all policy.
--
-- Routes qui consomment la table (toutes en service_role déjà
-- vérifiées avant cette migration) :
--   - /api/export/route.ts  → SELECT * (export RGPD)
--   - /api/account/delete/route.ts  → DELETE (cascade suppression)
--   - /api/consent/route.ts (nouveau) → SELECT + INSERT
--
-- Ce que cette migration NE fait PAS :
--   - aucune mise à jour ni insertion de lignes existantes ;
--   - pas de colonnes ajoutées à profiles (1 source de vérité,
--     consent_logs ; lecture profil continue via localStorage cache
--     synchronisé par ConsentGate).
-- ===================================================================

-- ─── Colonne wording_snapshot ──────────────────────────────────────

ALTER TABLE public.consent_logs
  ADD COLUMN IF NOT EXISTS wording_snapshot text;

-- ─── Suppression des policies permissives obsolètes ────────────────
-- Ces policies autorisaient l'accès client. On bascule en server-only.

DROP POLICY IF EXISTS "Users can view own consent logs"
  ON public.consent_logs;

DROP POLICY IF EXISTS "Users can insert own consent logs"
  ON public.consent_logs;

-- ─── RLS (idempotent, déjà active) ─────────────────────────────────

ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- ─── GRANTs ────────────────────────────────────────────────────────
-- Conformité règle CLAUDE.md §145 + sous-section "Régime
-- pré-30-mai-2026 — REVOKE obligatoire" : on révoque les privilèges
-- par défaut hérités, on n'accorde que ce dont service_role a besoin.

REVOKE ALL ON public.consent_logs FROM anon, authenticated;

GRANT SELECT, INSERT ON public.consent_logs TO service_role;
-- Pas de UPDATE/DELETE : les preuves de consentement sont immuables.
-- (Le DELETE pour suppression de compte passe par service_role qui
-- bypass les GRANTs ; voir /api/account/delete.)

-- ─── Policy DENY ALL pour rôles non-service ───────────────────────
-- service_role bypass RLS donc cette policy ne le concerne pas.
-- Existe pour :
--   (1) matérialiser l'intention "aucun accès client" ;
--   (2) satisfaire la règle "RLS activée → au moins une policy".

DROP POLICY IF EXISTS "deny_all_non_service"
  ON public.consent_logs;

CREATE POLICY "deny_all_non_service"
  ON public.consent_logs
  AS RESTRICTIVE
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- ===================================================================
-- VÉRIFICATIONS POST-MIGRATION (à exécuter à la main)
-- ===================================================================
--
-- 1) Colonne wording_snapshot ajoutée :
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='consent_logs'
-- ORDER BY ordinal_position;
-- → wording_snapshot / text / YES doit apparaître en plus des colonnes
--   existantes (id, user_id, consent_type, granted, version, created_at).
--
-- 2) Policies : les anciennes doivent avoir disparu, deny_all présente :
-- SELECT policyname, permissive, cmd, roles
-- FROM pg_policies
-- WHERE schemaname='public' AND tablename='consent_logs';
-- → Attendu uniquement : deny_all_non_service / RESTRICTIVE / ALL /
--   {authenticated, anon}.
--
-- 3) GRANTs : uniquement postgres + service_role.
-- SELECT grantee, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema='public' AND table_name='consent_logs';
-- → Aucune ligne anon ni authenticated.
-- ===================================================================
