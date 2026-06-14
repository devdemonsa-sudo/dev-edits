create extension if not exists pgcrypto;

create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.api_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  label text,
  endpoint text,
  enabled boolean not null default true,
  secure_value_enc text not null,
  secure_value_last4 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.site_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  base_url text not null,
  category text not null,
  selector_hint text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  topic text not null,
  genre text not null,
  tone text not null,
  publish_at timestamptz not null,
  status text not null default 'scheduled',
  stage text not null default 'queued',
  progress integer not null default 0,
  site_ids text[] not null default '{}'::text[],
  video_slug text,
  script text,
  voiceover_path text,
  heygen_video_id text,
  output_url text,
  youtube_url text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.video_jobs(id) on delete cascade,
  stage text not null,
  status text not null,
  message text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists api_configs_user_provider_idx
  on public.api_configs (user_id, provider, updated_at desc);

create index if not exists site_sources_user_created_idx
  on public.site_sources (user_id, created_at desc);

create index if not exists video_jobs_user_publish_idx
  on public.video_jobs (user_id, publish_at asc, status);

create index if not exists job_events_job_created_idx
  on public.job_events (job_id, created_at desc);

alter table public.api_configs enable row level security;
alter table public.site_sources enable row level security;
alter table public.video_jobs enable row level security;
alter table public.job_events enable row level security;

grant select, insert, update, delete on public.api_configs to authenticated;
grant select, insert, update, delete on public.site_sources to authenticated;
grant select, insert, update, delete on public.video_jobs to authenticated;
grant select, insert, update, delete on public.job_events to authenticated;

create policy "api_configs_select_own"
on public.api_configs for select to authenticated
using (user_id = auth.uid());

create policy "api_configs_insert_own"
on public.api_configs for insert to authenticated
with check (user_id = auth.uid());

create policy "api_configs_update_own"
on public.api_configs for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "api_configs_delete_own"
on public.api_configs for delete to authenticated
using (user_id = auth.uid());

create policy "site_sources_select_own"
on public.site_sources for select to authenticated
using (user_id = auth.uid());

create policy "site_sources_insert_own"
on public.site_sources for insert to authenticated
with check (user_id = auth.uid());

create policy "site_sources_update_own"
on public.site_sources for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "site_sources_delete_own"
on public.site_sources for delete to authenticated
using (user_id = auth.uid());

create policy "video_jobs_select_own"
on public.video_jobs for select to authenticated
using (user_id = auth.uid());

create policy "video_jobs_insert_own"
on public.video_jobs for insert to authenticated
with check (user_id = auth.uid());

create policy "video_jobs_update_own"
on public.video_jobs for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "video_jobs_delete_own"
on public.video_jobs for delete to authenticated
using (user_id = auth.uid());

create policy "job_events_select_own"
on public.job_events for select to authenticated
using (user_id = auth.uid());

create policy "job_events_insert_own"
on public.job_events for insert to authenticated
with check (user_id = auth.uid());

create policy "job_events_delete_own"
on public.job_events for delete to authenticated
using (user_id = auth.uid());

create trigger api_configs_set_updated_at
before update on public.api_configs
for each row execute function private.set_updated_at();

create trigger site_sources_set_updated_at
before update on public.site_sources
for each row execute function private.set_updated_at();

create trigger video_jobs_set_updated_at
before update on public.video_jobs
for each row execute function private.set_updated_at();
