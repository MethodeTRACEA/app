-- ===================================================================
-- TRACÉA — Chantier 57 « Ancrage contextuel » — Brique 57-5 (repli in-app)
-- À exécuter à la main dans le SQL Editor de Supabase.
-- ===================================================================
-- Une seule colonne ajoutée à public.reminders (table déjà créée et
-- verrouillée en 57-1) : marqueur "nudge déjà montré aujourd'hui",
-- même patron que last_sent_at (57-4).
--
-- Pourquoi une colonne DB plutôt qu'un marqueur localStorage/session :
-- c'est exactement ce que 57-5 corrige (chantier 19 stockait ce genre de
-- marqueur en localStorage, invisible du serveur, hors effacement RGPD).
-- nudge_shown_at vit sur la même ligne que le rappel, comparé par date
-- locale (isSameLocalDay, reminder-schedule.ts) — pas par device.
--
-- RGPD : aucun câblage neuf. `reminders` est déjà couverte par les deux
-- chemins d'effacement (57-1) ; une colonne ajoutée à une table déjà
-- couverte hérite de l'effacement au DELETE de ligne, comme geste_* (B-1)
-- et last_sent_at (57-4). Colonne écrite côté CLIENT (RLS owner, grant
-- update déjà en place depuis 57-1) au moment où le nudge est réellement
-- affiché — jamais lue/affichée comme "dernier rappel manqué" (P0 doctrine).
-- ===================================================================

ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS nudge_shown_at timestamptz DEFAULT NULL;
