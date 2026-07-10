-- ===================================================================
-- TRACÉA — Chantier 57 (suite) — Brique 57-7 (schéma calendrier/heure libre)
-- À exécuter à la main dans le SQL Editor de Supabase.
-- ===================================================================
-- Trois colonnes ajoutées à public.reminders (table déjà créée et
-- verrouillée en 57-1) : `date`/`heure`/`recurrent` remplaceront à terme
-- `creneau`/`jours`, mais COEXISTENT pour l'instant.
--
-- Pourquoi ne rien migrer : au 2026-07-11, `reminders` ne contient que
-- 3 lignes réelles, toutes créées le 08/07 pendant les tests de l'écran
-- d'armement (2 comptes, tous "1 seul jour coché", aucune vraie
-- utilisatrice tierce). Volume négligeable, décision actée avec Alyson :
-- pas de migration automatique. Ces 3 lignes restent nullable sur les
-- nouvelles colonnes et continuent de fonctionner via creneau/jours
-- (isReminderDueNow détecte le schéma présent, voir reminder-schedule.ts).
--
-- `heure` en type `time` (heure murale libre, sans fuseau — interprétée
-- dans le fuseau déjà stocké de la personne, jamais en UTC) : remplace
-- l'ancien créneau fixe matin/midi/soir. `date` en type `date` (jour
-- calendaire pur). `recurrent` : true = se répète chaque semaine au jour
-- de semaine de `date` ; false = ponctuel, dû une seule fois à `date`.
--
-- L'écran actuel (/app/rappels) n'écrit PAS ces colonnes tant que 57-8 ne
-- l'a pas remplacé — elles restent NULL pour tout rappel créé d'ici là,
-- aucune régression (comportement identique via creneau/jours).
--
-- Ne retire PAS creneau/jours (encore utilisés par l'écran actuel) — un
-- nettoyage ultérieur (57-9 ou une brique dédiée) les retirera une fois
-- 57-8 livré.
--
-- ⚠️ Point structurel additionnel (au-delà des 3 nouvelles colonnes) :
-- creneau/jours portent des contraintes NOT NULL posées en 57-1. En l'état,
-- un futur rappel créé UNIQUEMENT via date/heure/recurrent (57-8) serait
-- rejeté par Postgres à l'insertion. On relâche donc ces deux NOT NULL ici
-- — les CHECK existantes restent actives et continuent de valider les
-- valeurs quand elles sont renseignées (une contrainte CHECK est toujours
-- satisfaite pour une valeur NULL, aucun comportement cassé pour l'écran
-- actuel, qui continue de toujours peupler creneau/jours comme avant).
--
-- RGPD : aucun câblage neuf. Colonnes sur une table déjà couverte par les
-- deux chemins d'effacement (57-1) — héritage automatique au DELETE de
-- ligne, comme geste_* (B-1), last_sent_at et nudge_shown_at (57-4/57-5).
-- ===================================================================

ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS heure time DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recurrent boolean DEFAULT NULL;

ALTER TABLE public.reminders
  ALTER COLUMN creneau DROP NOT NULL,
  ALTER COLUMN jours DROP NOT NULL;
