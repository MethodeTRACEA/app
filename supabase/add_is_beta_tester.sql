-- Migration: add is_beta_tester to profiles
-- Run in Supabase Dashboard > SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_beta_tester boolean NOT NULL DEFAULT false;

-- Grant beta testers the same access as subscribers.
-- To mark a tester: UPDATE profiles SET is_beta_tester = true WHERE id = '<user_uuid>';
