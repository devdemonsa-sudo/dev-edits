create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  connection_type text not null default 'oauth',
  status text not null default 'pending',
  account_label text,
  external_account_id text,
  store_url text,
  scopes text[] not null default '{}'::text[],
  token_payload_enc text,
  refresh_token_enc text,
  expires_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index integration_connections_user_provider_idx
  on public.integration_connections (user_id, provider, created_at desc);

alter table public.integration_connections enable row level security;

grant select, insert, update, delete on public.integration_connections to authenticated;

create policy "integration_connections_select_own"
on public.integration_connections
for select
to authenticated
using (user_id = auth.uid());

create policy "integration_connections_insert_own"
on public.integration_connections
for insert
to authenticated
with check (user_id = auth.uid());

create policy "integration_connections_update_own"
on public.integration_connections
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "integration_connections_delete_own"
on public.integration_connections
for delete
to authenticated
using (user_id = auth.uid());

create trigger integration_connections_set_updated_at
before update on public.integration_connections
for each row execute function private.set_updated_at();
