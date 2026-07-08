-- ===================================================================
-- TRACÉA — Chantier 57 « Ancrage contextuel » — Brique 57-4 (envoi)
-- À exécuter à la main dans le SQL Editor de Supabase.
-- ===================================================================
-- Une seule colonne ajoutée à public.reminders (table déjà créée et
-- verrouillée en 57-1) : garde-fou anti-doublon pour le cron d'envoi.
--
-- Pourquoi : le cron Vercel tourne une fois par heure (24 entrées dans
-- vercel.json, chacune "une fois par jour" au sens de la limite Vercel —
-- voir commentaire dans vercel.json). Deux passages consécutifs peuvent,
-- par imprécision de déclenchement, retomber tous les deux dans la
-- fenêtre de tolérance du même rappel le même jour. `last_sent_at` permet
-- de savoir si ce rappel a déjà été traité aujourd'hui (comparaison de
-- date locale dans le fuseau du rappel, pas un simple delta horaire).
--
-- RGPD : aucun câblage neuf. `reminders` est une table déjà couverte par
-- les deux chemins d'effacement (57-1) ; une colonne ajoutée à une table
-- déjà couverte hérite de l'effacement au DELETE de ligne, exactement
-- comme les colonnes geste_* ajoutées à `sessions` en B-1. Colonne écrite
-- UNIQUEMENT par le cron (service_role, bypass RLS) — jamais par le
-- client, jamais affichée (aucun "dernier envoi" visible, P0 doctrine).
-- ===================================================================

ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS last_sent_at timestamptz DEFAULT NULL;
