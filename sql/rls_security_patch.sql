-- ===================================================================
-- TRACÉA — Patch sécurité RLS
-- Date : 2026-04-08
-- Objectif : Verrouiller les INSERT permissifs sur ai_usage_logs
--            et rate_limit_logs après migration vers service role
-- ===================================================================
--
-- PRÉREQUIS :
--   Les inserts dans ai_usage_logs et rate_limit_logs passent désormais
--   par le service role key (bypass RLS). Les policies INSERT (true)
--   ne sont donc plus nécessaires et représentent un risque.
--
-- CE SCRIPT :
--   1. Supprime les policies INSERT trop permissives (WITH CHECK true)
--   2. Les remplace par des policies restrictives (auth.uid() = user_id)
--      comme filet de sécurité défensif
--   3. Ne touche à aucune autre table (profiles, sessions, consent_logs,
--      session_summaries, user_memory_profile sont déjà sécurisées)
--
-- IMPACT :
--   - Aucun impact si SUPABASE_SERVICE_ROLE_KEY est bien configurée
--     (le service role bypass RLS, donc les policies n'interviennent pas)
--   - Si la clé service role venait à manquer (fallback anon),
--     les inserts échoueraient silencieusement (logs uniquement,
--     aucun impact utilisateur)
--
-- ROLLBACK SI PROBLÈME :
--   DROP POLICY IF EXISTS "Service role insert usage logs" ON ai_usage_logs;
--   CREATE POLICY "Service can insert usage logs"
--     ON ai_usage_logs FOR INSERT WITH CHECK (true);
--
--   DROP POLICY IF EXISTS "Service role insert rate limit logs" ON rate_limit_logs;
--   CREATE POLICY "Service can insert rate limit logs"
--     ON rate_limit_logs FOR INSERT WITH CHECK (true);
-- ===================================================================

-- ─── ai_usage_logs ──────────────────────────────────────────────────

-- Supprimer la policy INSERT permissive existante
DROP POLICY IF EXISTS "Service can insert usage logs" ON ai_usage_logs;

-- Nouvelle policy INSERT restrictive (filet défensif)
-- En pratique, le service role bypass RLS, mais si un client anon
-- tentait un insert, seul son propre user_id serait autorisé.
CREATE POLICY "Service role insert usage logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Vérifier : la policy SELECT existante est déjà correcte
-- "Authenticated users can read own logs" → USING (auth.uid() = user_id)

-- ─── rate_limit_logs ────────────────────────────────────────────────

-- Supprimer la policy INSERT permissive existante
DROP POLICY IF EXISTS "Service can insert rate limit logs" ON rate_limit_logs;

-- Nouvelle policy INSERT restrictive (filet défensif)
CREATE POLICY "Service role insert rate limit logs"
  ON rate_limit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Vérifier : la policy SELECT existante est déjà correcte
-- "Authenticated users can read own rate limit logs" → USING (auth.uid() = user_id)

-- ===================================================================
-- VÉRIFICATION POST-PATCH
-- Exécuter ces requêtes pour confirmer l'état RLS :
-- ===================================================================

-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public';
--
-- SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;
