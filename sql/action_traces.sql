-- ===================================================================
-- TRACÉA — Chantier 35-A — Table public.action_traces
-- À exécuter à la main dans le SQL Editor de Supabase.
--
-- Patron A (cf. sql/phase2_memory_tables.sql) :
--   user_id UUID + FK auth.users ON DELETE CASCADE, RLS owner
--   SELECT / INSERT / DELETE (auth.uid() = user_id).
--
-- + Bloc REVOKE/GRANT obligatoire (CLAUDE.md — régime pré-30-mai-2026 :
--   toute nouvelle table public reçoit par défaut tous les privilèges à
--   anon/authenticated ; on révoque puis on n'accorde que le strict
--   nécessaire). service_role n'est pas touché par le REVOKE et conserve
--   ses privilèges par défaut (utilisé par /api/account/delete, bypass RLS).
--
-- session_id : uuid (= type de sessions.id, vérifié), FK ON DELETE CASCADE.
-- content    : l'écrit libre de l'utilisatrice — JAMAIS lu par le LLM.
-- ===================================================================

create table public.action_traces (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  session_id    uuid        references public.sessions(id) on delete cascade,
  created_at    timestamptz default now(),

  besoin        text,
  emotion       text,
  action        text,
  action_source text,
  kind          text,         -- 'write' | 'world'
  plan_when     text,         -- actions 'world' : le "quand"
  content       text,         -- actions 'write' : l'écrit — JAMAIS lu par le LLM
  kept          boolean       default true
);

create index idx_action_traces_user_id on public.action_traces(user_id);
create index idx_action_traces_created_at on public.action_traces(created_at desc);

alter table public.action_traces enable row level security;

create policy "Users can view own action traces"
  on public.action_traces for select
  using (auth.uid() = user_id);

create policy "Users can insert own action traces"
  on public.action_traces for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own action traces"
  on public.action_traces for delete
  using (auth.uid() = user_id);

-- Bloc REVOKE/GRANT obligatoire (CLAUDE.md). NE PAS omettre, sinon P0.
revoke all on public.action_traces from anon, authenticated;
grant select, insert, delete on public.action_traces to authenticated;
