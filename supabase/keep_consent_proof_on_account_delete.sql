-- ===================================================================
-- TRACÉA — Migration : conserver les preuves de consentement à la
-- suppression du compte (art. 17.3 RGPD)
-- ===================================================================
-- Chantier 34 — Le bouton de suppression de données du ConsentGate
-- est désormais branché sur /api/account/delete. Sans ce patch, la
-- suppression du profil entraînerait par cascade FK la perte des
-- preuves de consentement, ce qui contredit l'art. 17.3 du RGPD :
--
--   "Le droit à l'effacement ne s'applique pas dans la mesure où le
--    traitement est nécessaire à la constatation, à l'exercice ou à
--    la défense de droits en justice."
--
-- Les preuves de consentement RGPD art. 9 (consent_logs) et de
-- renonciation au droit de rétractation (withdrawal_consents) sont
-- précisément ce traitement-là.
--
-- Cette migration :
--   1. DROP le FK consent_logs.user_id → profiles(id) (était CASCADE).
--   2. DROP le FK withdrawal_consents.user_id → profiles(id) (idem).
--   3. Conserve user_id NOT NULL sur les deux tables.
--
-- Effet :
--   - Les inserts continuent à fonctionner avec un user_id valide.
--   - La suppression du profil ne touche plus aux preuves.
--   - user_id devient "orphan UUID" après suppression du compte :
--     valeur préservée, plus de référence vivante. En cas de litige,
--     la rattachabilité passe par les metadata Stripe (qui conservent
--     user_id) ou les autres indices (ip_hash, user_agent, dates).
--
-- Ce que ce patch NE fait PAS :
--   - aucune modification de RLS, GRANTs ou policies (verrouillées
--     server-only par les chantiers 32 et 33) ;
--   - aucune modification de schéma au-delà des deux DROP CONSTRAINT ;
--   - aucune rétro-action sur les lignes existantes (les preuves
--     déjà en DB le restent inchangées).
-- ===================================================================

-- ─── consent_logs ─────────────────────────────────────────────────

ALTER TABLE public.consent_logs
  DROP CONSTRAINT IF EXISTS consent_logs_user_id_fkey;

-- ─── withdrawal_consents ──────────────────────────────────────────

ALTER TABLE public.withdrawal_consents
  DROP CONSTRAINT IF EXISTS withdrawal_consents_user_id_fkey;

-- ===================================================================
-- VÉRIFICATIONS POST-MIGRATION (à exécuter à la main)
-- ===================================================================
--
-- 1) Aucun FK restant sur les deux tables :
-- SELECT tc.table_name, tc.constraint_name, kcu.column_name
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu
--   ON tc.constraint_name = kcu.constraint_name
--   AND tc.table_schema = kcu.table_schema
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_schema = 'public'
--   AND tc.table_name IN ('consent_logs', 'withdrawal_consents');
-- → Doit retourner 0 ligne.
--
-- 2) user_id reste NOT NULL :
-- SELECT table_name, column_name, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name IN ('consent_logs', 'withdrawal_consents')
--   AND column_name = 'user_id';
-- → Deux lignes, is_nullable = NO.
--
-- 3) RLS + policies inchangées (vérifs des chantiers 32/33) :
-- SELECT tablename, policyname, permissive, cmd FROM pg_policies
-- WHERE schemaname='public'
--   AND tablename IN ('consent_logs','withdrawal_consents')
-- ORDER BY tablename;
-- → Une ligne par table : deny_all_non_service / RESTRICTIVE / ALL.
-- ===================================================================
