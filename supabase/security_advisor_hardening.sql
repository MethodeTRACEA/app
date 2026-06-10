-- ===================================================================
-- TRACÉA — Migration : durcissement Security Advisor (chantier 38)
-- ===================================================================
-- Réponse aux signalements Supabase Security Advisor :
--
-- ERREURS — admin_stats / admin_weekly_stats :
--   Vues SECURITY DEFINER (par défaut Postgres) avec GRANT hérité à
--   anon/authenticated → bypass RLS underlying. Le filet WHERE
--   `is_admin = true` via auth.uid() est INCOMPATIBLE avec une
--   lecture via service_role (où auth.uid() retourne NULL).
--
--   Cette migration :
--     1. RECRÉE les deux vues avec WITH (security_invoker = on) →
--        clear les 2 ERRORs du Security Advisor (la propriété
--        SECURITY DEFINER disparaît).
--     2. RETIRE la clause WHERE is_admin (incompatible service_role).
--        La garde admin est désormais 100 % côté route serveur
--        /api/admin/stats (vérif explicite is_admin via service_role).
--     3. REVOKE strict des GRANTs anon/authenticated.
--     4. GRANT SELECT explicite à service_role (CLAUDE.md §145).
--
-- WARNINGS — public.handle_new_user :
--   - search_path mutable → fixé à '' (strict).
--     La fonction utilise déjà `public.profiles` qualifié → OK.
--   - EXECUTE à PUBLIC/anon/authenticated → REVOKE. Le trigger
--     on_auth_user_created continue à fonctionner (SECURITY DEFINER,
--     ownership postgres, pas besoin de GRANT à l'appelant).
--
-- Conformité CLAUDE.md §145 (régime pré-30-mai-2026) :
--   - REVOKE explicite anon/authenticated.
--   - GRANT explicite service_role.
--
-- Ce que cette migration NE fait PAS :
--   - aucune modification du corps de handle_new_user au-delà de
--     SET search_path ;
--   - aucune table créée ni modifiée ;
--   - aucune RLS ajoutée.
-- ===================================================================

-- ─── handle_new_user : search_path strict + REVOKE EXECUTE ────────

ALTER FUNCTION public.handle_new_user()
  SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
-- service_role conserve EXECUTE (par défaut, non révoqué).

-- ─── admin_stats : security_invoker + colonnes VERBATIM ──────────
-- Liste de colonnes recopiée à l'identique depuis supabase-schema.sql
-- (mêmes noms/ordre/types). Seule modif : pas de WHERE is_admin.

CREATE OR REPLACE VIEW public.admin_stats
WITH (security_invoker = on) AS
SELECT
  count(DISTINCT s.user_id) AS total_users,
  count(s.id) AS total_sessions,
  count(s.id) FILTER (WHERE s.completed = true) AS completed_sessions,
  round(avg(s.intensity_before)::numeric, 1) AS avg_intensity_before,
  round(avg(s.intensity_after)::numeric, 1) AS avg_intensity_after,
  round(avg(s.intensity_before - s.intensity_after)::numeric, 1) AS avg_recovery,
  count(s.id) FILTER (WHERE s.context = 'relationnel') AS ctx_relationnel,
  count(s.id) FILTER (WHERE s.context = 'professionnel') AS ctx_professionnel,
  count(s.id) FILTER (WHERE s.context = 'existentiel') AS ctx_existentiel,
  count(s.id) FILTER (WHERE s.context = 'autre') AS ctx_autre,
  count(s.id) FILTER (WHERE s.date > now() - interval '7 days') AS sessions_last_7d,
  count(s.id) FILTER (WHERE s.date > now() - interval '30 days') AS sessions_last_30d,
  count(DISTINCT s.user_id) FILTER (WHERE s.date > now() - interval '7 days') AS active_users_7d
FROM public.sessions s;

REVOKE ALL ON public.admin_stats FROM PUBLIC;
REVOKE ALL ON public.admin_stats FROM anon, authenticated;
GRANT SELECT ON public.admin_stats TO service_role;

-- ─── admin_weekly_stats : security_invoker + colonnes VERBATIM ───

CREATE OR REPLACE VIEW public.admin_weekly_stats
WITH (security_invoker = on) AS
SELECT
  date_trunc('week', s.date)::date AS week,
  count(s.id) AS sessions_count,
  count(DISTINCT s.user_id) AS unique_users,
  round(avg(s.intensity_before - s.intensity_after)::numeric, 1) AS avg_recovery,
  count(s.id) FILTER (WHERE s.completed = true) AS completed
FROM public.sessions s
WHERE s.date > now() - interval '12 weeks'
GROUP BY date_trunc('week', s.date)
ORDER BY week DESC;

REVOKE ALL ON public.admin_weekly_stats FROM PUBLIC;
REVOKE ALL ON public.admin_weekly_stats FROM anon, authenticated;
GRANT SELECT ON public.admin_weekly_stats TO service_role;

-- ===================================================================
-- VÉRIFICATIONS POST-MIGRATION (optionnel — le test
-- scripts/test-admin-stats.mjs couvre tout end-to-end)
-- ===================================================================
--
-- 1) search_path fixé :
-- SELECT proname, proconfig FROM pg_proc
-- WHERE pronamespace = 'public'::regnamespace AND proname = 'handle_new_user';
-- → proconfig doit contenir 'search_path='.
--
-- 2) Vues sans clause is_admin :
-- SELECT viewname FROM pg_views
-- WHERE schemaname='public' AND viewname LIKE 'admin_%'
--   AND definition LIKE '%is_admin%';
-- → 0 ligne.
--
-- 3) security_invoker actif :
-- SELECT relname, reloptions FROM pg_class
-- WHERE relname IN ('admin_stats','admin_weekly_stats');
-- → reloptions doit contenir '{security_invoker=on}'.
--
-- 4) GRANTs nettoyés + service_role présent :
-- SELECT grantee, table_name, privilege_type FROM information_schema.role_table_grants
-- WHERE table_schema='public' AND table_name IN ('admin_stats','admin_weekly_stats');
-- → Aucune ligne anon/authenticated, présence de service_role/SELECT.
-- ===================================================================
