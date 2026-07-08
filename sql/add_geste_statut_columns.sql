-- ===================================================================
-- TRACÉA — Chantier 35-B « Le retour du geste » — Brique B-1 (stockage)
-- À exécuter dans le SQL Editor de Supabase
-- ===================================================================
-- Statut déclaratif rattaché au geste choisi à l'étape Aligner.
-- Le libellé du geste vit déjà dans sessions.action_alignee : ces colonnes
-- ne font qu'y RATTACHER un statut, sur la même ligne (relation 1:1 naturelle).
--
--   geste_statut      : 'fait' | 'pas_encore' | 'autre_forme' | 'passe'
--                       NULL tant que la carte (B-2) n'a pas été touchée
--                       (création paresseuse : la colonne reste vide, pas de
--                       ligne dédiée à créer).
--   geste_statut_at   : horodatage de la dernière interaction avec la carte.
--   geste_pass_count  : compteur de passes consécutives (règle des 2 passes, B-2).
--
-- Colonnes ajoutées sur table existante : héritent des grants de table et de la
-- RLS niveau ligne déjà active sur `sessions` (auth.uid() = user_id, CRUD complet,
-- supabase-schema.sql:62-76). Aucun bloc REVOKE/GRANT : la règle CLAUDE.md vise
-- les nouvelles TABLES, pas l'ajout de colonnes à une table déjà en place.
--
-- RGPD / effacement : `sessions` est déjà couverte INTÉGRALEMENT par les deux
-- chemins d'effacement, par DELETE de ligne complète :
--   - « Effacer ma mémoire »  → src/lib/memory.ts (deleteMemoryData), table "sessions"
--   - Suppression de compte    → src/app/api/account/delete/route.ts (CHILD_TABLES)
-- Un DELETE de ligne emporte toutes ses colonnes : ces nouvelles colonnes sont
-- effaçables sans câblage neuf. Aucune donnée du journal privé n'entre ici :
-- seuls circulent réf. session + statut + compteur + horodatage.

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS geste_statut text
    CHECK (geste_statut IN ('fait', 'pas_encore', 'autre_forme', 'passe')),
  ADD COLUMN IF NOT EXISTS geste_statut_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS geste_pass_count integer NOT NULL DEFAULT 0;
