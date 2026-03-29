-- ===================================================================
-- TRACÉA Phase 3 — Colonnes score de progression
-- À exécuter dans le SQL Editor de Supabase
-- ===================================================================

ALTER TABLE user_memory_profile
ADD COLUMN IF NOT EXISTS emotional_awareness_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS regulation_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS action_alignment_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS overall_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_history JSONB DEFAULT '[]';
