-- ===================================================================
-- TRACÉA — Schéma de la table public.tracea_events
-- Fichier de DOCUMENTATION : reflète l'état RÉEL de la base de production.
-- Relevé en base le 2026-06-11 (vérification brique 0).
--
-- Le relevé brique 0 couvrait : colonnes (type, nullabilité, défaut),
-- état RLS, et policies (pg_policies). Il ne couvrait pas les contraintes
-- (clé primaire, index) ni les GRANTs — ils ne sont donc pas reproduits ici.
-- ===================================================================

create table public.tracea_events (
  id          uuid        not null default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     text        null,
  event       text        null,
  data        jsonb       null
);

-- RLS : activée (relrowsecurity = true).
alter table public.tracea_events enable row level security;

-- Policy 1 — INSERT : aucun insert direct depuis un client.
-- with_check = false bloque tout insert via les rôles client (anon/authenticated).
-- Les écritures passent exclusivement par la route serveur /api/track-event,
-- qui utilise service_role (lequel bypasse la RLS).
create policy "No direct client inserts"
  on public.tracea_events
  for insert
  to public
  with check (false);

-- Policy 2 — SELECT : une utilisatrice authentifiée ne lit que ses propres
-- lignes, via comparaison de son auth.uid() (casté en text) avec la colonne
-- user_id (de type text).
create policy "Users can read own tracea events"
  on public.tracea_events
  for select
  to authenticated
  using ((auth.uid())::text = user_id);
