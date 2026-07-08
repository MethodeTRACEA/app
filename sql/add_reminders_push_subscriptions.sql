-- ===================================================================
-- TRACÉA — Chantier 57 « Ancrage contextuel » — Brique 57-1 (stockage)
-- À exécuter à la main dans le SQL Editor de Supabase.
-- ===================================================================
-- Deux tables NEUVES, créées verrouillées d'emblée. Confirmé au SQL Editor le
-- 2026-07-08 qu'aucune n'existe avant (regclass introuvable, pg_class /
-- pg_policies / grants = 0 ligne). Il n'y a donc rien à réconcilier ni aucun
-- P0 latent : ce script CRÉE les tables et pose la sécurité dès la création.
--
-- Patron « nouvelle table » du CLAUDE.md (régime pré-30-mai-2026) : RLS
-- owner-scoped + REVOKE ALL from anon, authenticated puis GRANT du strict
-- nécessaire. service_role n'est pas touché par le REVOKE et garde ses
-- privilèges par défaut (cron 57-4 + suppression de compte, bypass RLS).
--
-- Écrit en idempotent (create table if not exists, drop policy if exists +
-- create policy, enable rls, revoke/grant) : sûr à ré-exécuter sans casse.
--
-- Effacement RGPD câblé côté code (obligatoire, aucun héritage) :
--   src/lib/memory.ts deleteMemoryData + src/app/api/account/delete CHILD_TABLES.
-- Aucune UI, aucun envoi ici : on ne fait que créer les tables.
-- ===================================================================


-- ── Table 1 : reminders — un rappel armé par la personne ───────────
create table if not exists public.reminders (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,

  categorie   text        not null check (categorie in ('entrainement', 'moment_sensible')),
  creneau     text        not null check (creneau in ('matin', 'midi', 'soir')),
  jours       smallint[]  not null default '{}'::smallint[]
                          check (jours <@ array[1,2,3,4,5,6,7]::smallint[]),
  fuseau      text        not null,
  label       text,                 -- nom libre optionnel du moment — nullable
  arme        boolean     not null default true,

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists idx_reminders_user_id on public.reminders(user_id);
create index if not exists idx_reminders_arme on public.reminders(arme) where arme;

alter table public.reminders enable row level security;

drop policy if exists "Users can view own reminders"   on public.reminders;
drop policy if exists "Users can insert own reminders"  on public.reminders;
drop policy if exists "Users can update own reminders"  on public.reminders;
drop policy if exists "Users can delete own reminders"  on public.reminders;

create policy "Users can view own reminders"
  on public.reminders for select using (auth.uid() = user_id);
create policy "Users can insert own reminders"
  on public.reminders for insert with check (auth.uid() = user_id);
create policy "Users can update own reminders"
  on public.reminders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own reminders"
  on public.reminders for delete using (auth.uid() = user_id);

-- Bloc REVOKE/GRANT obligatoire (CLAUDE.md) — c'est LE fix P0 de cette brique.
revoke all on public.reminders from anon, authenticated;
grant select, insert, update, delete on public.reminders to authenticated;


-- ── Table 2 : push_subscriptions — abonnement push navigateur (perso) ─
create table if not exists public.push_subscriptions (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,

  endpoint    text        not null unique,
  p256dh      text        not null,
  auth        text        not null,

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users can view own push subscriptions"   on public.push_subscriptions;
drop policy if exists "Users can insert own push subscriptions" on public.push_subscriptions;
drop policy if exists "Users can update own push subscriptions" on public.push_subscriptions;
drop policy if exists "Users can delete own push subscriptions" on public.push_subscriptions;

create policy "Users can view own push subscriptions"
  on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert own push subscriptions"
  on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can update own push subscriptions"
  on public.push_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own push subscriptions"
  on public.push_subscriptions for delete using (auth.uid() = user_id);

-- Bloc REVOKE/GRANT obligatoire (CLAUDE.md) — fix P0.
revoke all on public.push_subscriptions from anon, authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
