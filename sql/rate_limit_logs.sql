-- Table de logs des blocages rate-limit
-- À exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID,
  ip_address TEXT,
  reason TEXT NOT NULL,       -- 'user_minute', 'user_5min', 'ip_minute', 'monthly_limit'
  details TEXT                -- infos supplémentaires (compteurs, seuils)
);

-- Index pour requêtes d'analyse
CREATE INDEX idx_ratelimit_user ON rate_limit_logs (user_id);
CREATE INDEX idx_ratelimit_date ON rate_limit_logs (created_at);
CREATE INDEX idx_ratelimit_reason ON rate_limit_logs (reason);

-- RLS
ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- Politique : l'API peut insérer
CREATE POLICY "Service can insert rate limit logs"
  ON rate_limit_logs FOR INSERT
  WITH CHECK (true);

-- Politique : les utilisateurs authentifiés peuvent lire leurs propres logs
CREATE POLICY "Authenticated users can read own rate limit logs"
  ON rate_limit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ===================================================================
-- REQUÊTES UTILES
-- ===================================================================

-- 1) Voir tous les blocages récents
-- SELECT * FROM rate_limit_logs ORDER BY created_at DESC LIMIT 50;

-- 2) Blocages par raison (dernier mois)
-- SELECT reason, COUNT(*) as total
-- FROM rate_limit_logs
-- WHERE created_at > now() - interval '30 days'
-- GROUP BY reason
-- ORDER BY total DESC;

-- 3) Utilisateurs les plus bloqués
-- SELECT user_id, COUNT(*) as blocks,
--   array_agg(DISTINCT reason) as reasons
-- FROM rate_limit_logs
-- WHERE created_at > now() - interval '30 days'
-- GROUP BY user_id
-- ORDER BY blocks DESC
-- LIMIT 20;

-- 4) IPs suspectes (beaucoup de blocages, pas de user_id)
-- SELECT ip_address, COUNT(*) as blocks
-- FROM rate_limit_logs
-- WHERE user_id IS NULL
--   AND created_at > now() - interval '7 days'
-- GROUP BY ip_address
-- ORDER BY blocks DESC
-- LIMIT 20;
