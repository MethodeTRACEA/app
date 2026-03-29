-- ============================================
-- TRACEA — Schema SQL pour Supabase
-- A executer dans le SQL Editor de Supabase
-- ============================================

-- 1. Table profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text default '',
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Table sessions (donnees sensibles art. 9 RGPD)
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date timestamptz default now(),
  context text check (context in ('relationnel', 'professionnel', 'existentiel', 'autre')),
  intensity_before smallint check (intensity_before between 1 and 10),
  intensity_after smallint check (intensity_after between 1 and 10),
  steps jsonb default '{}',
  emotion_primaire text,
  verite_interieure text,
  action_alignee text,
  analysis text,
  completed boolean default false,
  note_entre_sessions text,
  created_at timestamptz default now()
);

alter table public.sessions enable row level security;

create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.sessions for delete
  using (auth.uid() = user_id);

-- 3. Table consent_logs (preuve RGPD)
create table public.consent_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  consent_type text not null,
  granted boolean not null,
  version text not null,
  created_at timestamptz default now()
);

alter table public.consent_logs enable row level security;

create policy "Users can view own consent logs"
  on public.consent_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own consent logs"
  on public.consent_logs for insert
  with check (auth.uid() = user_id);

-- 4. Vue admin — statistiques ANONYMISEES uniquement
-- Aucun texte, aucune emotion, aucun contenu personnel
create or replace view public.admin_stats as
select
  count(distinct s.user_id) as total_users,
  count(s.id) as total_sessions,
  count(s.id) filter (where s.completed = true) as completed_sessions,
  round(avg(s.intensity_before)::numeric, 1) as avg_intensity_before,
  round(avg(s.intensity_after)::numeric, 1) as avg_intensity_after,
  round(avg(s.intensity_before - s.intensity_after)::numeric, 1) as avg_recovery,
  count(s.id) filter (where s.context = 'relationnel') as ctx_relationnel,
  count(s.id) filter (where s.context = 'professionnel') as ctx_professionnel,
  count(s.id) filter (where s.context = 'existentiel') as ctx_existentiel,
  count(s.id) filter (where s.context = 'autre') as ctx_autre,
  count(s.id) filter (where s.date > now() - interval '7 days') as sessions_last_7d,
  count(s.id) filter (where s.date > now() - interval '30 days') as sessions_last_30d,
  count(distinct s.user_id) filter (where s.date > now() - interval '7 days') as active_users_7d
from public.sessions s;

-- Vue stats par semaine
create or replace view public.admin_weekly_stats as
select
  date_trunc('week', s.date)::date as week,
  count(s.id) as sessions_count,
  count(distinct s.user_id) as unique_users,
  round(avg(s.intensity_before - s.intensity_after)::numeric, 1) as avg_recovery,
  count(s.id) filter (where s.completed = true) as completed
from public.sessions s
where s.date > now() - interval '12 weeks'
group by date_trunc('week', s.date)
order by week desc;

-- Politique pour admin_stats : seuls les admins peuvent lire
-- (les vues n'ont pas de RLS, on gere cote app)

-- 5. Index pour performance
create index idx_sessions_user_id on public.sessions(user_id);
create index idx_sessions_date on public.sessions(date desc);
create index idx_sessions_completed on public.sessions(completed);
create index idx_consent_logs_user_id on public.consent_logs(user_id);
