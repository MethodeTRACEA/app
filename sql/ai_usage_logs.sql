-- Table de suivi des coûts IA par appel
-- À exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL,
  session_date DATE DEFAULT CURRENT_DATE,
  call_type TEXT NOT NULL,        -- 'step-mirror' ou 'final-analysis'
  step_id TEXT,                    -- étape concernée (traverser, reconnaitre, etc.)
  model TEXT NOT NULL,             -- claude-sonnet-4-20250514
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  estimated_cost_usd NUMERIC(10,6) NOT NULL,
  is_retry BOOLEAN DEFAULT false
);

-- Index pour les requêtes d'agrégation
CREATE INDEX idx_ai_usage_user ON ai_usage_logs (user_id);
CREATE INDEX idx_ai_usage_date ON ai_usage_logs (session_date);

-- Activer RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Politique : seul le service (anon key via API route) peut insérer
CREATE POLICY "Service can insert usage logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (true);

-- Politique : les admins peuvent tout lire (via Supabase dashboard)
CREATE POLICY "Authenticated users can read own logs"
  ON ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ===================================================================
-- REQUÊTES UTILES (à copier-coller dans le SQL Editor)
-- ===================================================================

-- 1) Coût moyen par session (par jour + user)
-- SELECT
--   user_id,
--   session_date,
--   COUNT(*) as api_calls,
--   SUM(input_tokens) as total_input_tokens,
--   SUM(output_tokens) as total_output_tokens,
--   SUM(estimated_cost_usd) as session_cost_usd
-- FROM ai_usage_logs
-- GROUP BY user_id, session_date
-- ORDER BY session_date DESC;

-- 2) Coût moyen par session (global)
-- SELECT
--   ROUND(AVG(session_cost), 6) as avg_cost_per_session,
--   ROUND(AVG(api_calls), 1) as avg_calls_per_session
-- FROM (
--   SELECT
--     user_id,
--     session_date,
--     COUNT(*) as api_calls,
--     SUM(estimated_cost_usd) as session_cost
--   FROM ai_usage_logs
--   GROUP BY user_id, session_date
-- ) sessions;

-- 3) Coût moyen par utilisateur (total)
-- SELECT
--   user_id,
--   COUNT(*) as total_calls,
--   SUM(estimated_cost_usd) as total_cost_usd,
--   COUNT(DISTINCT session_date) as nb_sessions,
--   ROUND(SUM(estimated_cost_usd) / COUNT(DISTINCT session_date), 6) as avg_cost_per_session
-- FROM ai_usage_logs
-- GROUP BY user_id
-- ORDER BY total_cost_usd DESC;

-- 4) Coût total ce mois
-- SELECT
--   COUNT(*) as total_calls,
--   SUM(input_tokens) as total_input,
--   SUM(output_tokens) as total_output,
--   SUM(estimated_cost_usd) as total_cost_usd
-- FROM ai_usage_logs
-- WHERE session_date >= DATE_TRUNC('month', CURRENT_DATE);
