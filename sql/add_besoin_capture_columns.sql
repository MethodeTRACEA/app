-- ===================================================================
-- TRACÉA — A-2-0a — Capture de la source du besoin (session_summaries)
-- À exécuter dans le SQL Editor de Supabase
-- ===================================================================
-- Colonnes ajoutées sur table existante : héritent des grants de table
-- et de la RLS niveau ligne déjà active (auth.uid() = user_id).
-- Aucun bloc REVOKE/GRANT (la règle CLAUDE.md vise les nouvelles TABLES).

ALTER TABLE session_summaries
ADD COLUMN IF NOT EXISTS besoin_raw text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS besoin_source text DEFAULT NULL;
