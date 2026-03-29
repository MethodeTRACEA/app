-- ===================================================================
-- TRACÉA Phase 2 — Tables mémoire évolutive
-- À exécuter dans le SQL Editor de Supabase
-- ===================================================================

-- 1. Table session_summaries
CREATE TABLE session_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  dominant_emotions TEXT[] DEFAULT '{}',
  trigger_context TEXT DEFAULT '',
  expressed_needs TEXT[] DEFAULT '{}',
  suggested_actions TEXT[] DEFAULT '{}',
  themes TEXT[] DEFAULT '{}',
  avg_tension_level INTEGER DEFAULT 5,
  end_clarity_level INTEGER DEFAULT 5,
  regulation_state TEXT DEFAULT 'stable',
  inner_truth TEXT DEFAULT '',
  narrative_summary TEXT DEFAULT '',
  excluded_from_memory BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_session_summaries_user_id ON session_summaries(user_id);
CREATE INDEX idx_session_summaries_created_at ON session_summaries(created_at DESC);

ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own summaries"
  ON session_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries"
  ON session_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own summaries"
  ON session_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Table user_memory_profile
CREATE TABLE user_memory_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  recurring_patterns TEXT[] DEFAULT '{}',
  common_triggers TEXT[] DEFAULT '{}',
  effective_actions TEXT[] DEFAULT '{}',
  ineffective_patterns TEXT[] DEFAULT '{}',
  progress_trend TEXT DEFAULT 'stable',
  total_sessions INTEGER DEFAULT 0,
  last_session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_memory_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_memory_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_memory_profile FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_memory_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_memory_profile FOR DELETE
  USING (auth.uid() = user_id);
