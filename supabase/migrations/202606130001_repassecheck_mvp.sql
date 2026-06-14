create extension if not exists pgcrypto;

create schema if not exists private;

create type public.user_role as enum ('admin', 'analyst', 'viewer');
create type public.import_status as enum ('uploaded', 'processing', 'completed', 'failed');
create type public.transaction_type as enum ('sale', 'refund', 'chargeback', 'adjustment');
create type public.transaction_status as enum ('pending', 'completed', 'failed', 'cancelled');
create type public.reconciliation_status as enum ('matched', 'discrepancy', 'unmatched');
create type public.discrepancy_type as enum ('missing', 'amount_mismatch', 'duplicate', 'late', 'status_issue', 'invalid_row', 'other');
create type public.discrepancy_severity as enum ('low', 'medium', 'high');
create type public.discrepancy_status as enum ('open', 'investigating', 'resolved');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_name text,
  email text,
  role public.user_role not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.marketplaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'manual',
  sync_status text not null default 'manual',
  last_sync timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text,
  report_path text,
  status public.import_status not null default 'uploaded',
  total_rows integer not null default 0,
  processed_rows integer not null default 0,
  discrepancy_count integer not null default 0,
  error_message text,
  report_generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  import_id uuid references public.imports(id) on delete set null,
  marketplace text not null,
  external_id text not null,
  type public.transaction_type not null,
  amount numeric(14,2) not null,
  expected_amount numeric(14,2) not null default 0,
  currency text not null default 'BRL',
  status public.transaction_status not null,
  reconciliation_status public.reconciliation_status not null default 'unmatched',
  confidence_score integer not null default 100 check (confidence_score >= 0 and confidence_score <= 100),
  metadata jsonb not null default '{}'::jsonb,
  transaction_date timestamptz not null,
  "date" timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.discrepancies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  import_id uuid references public.imports(id) on delete set null,
  transaction_id uuid references public.transactions(id) on delete set null,
  type public.discrepancy_type not null,
  description text not null,
  expected_value numeric(14,2),
  actual_value numeric(14,2),
  severity public.discrepancy_severity not null default 'medium',
  status public.discrepancy_status not null default 'open',
  notes text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index transactions_user_date_idx on public.transactions (user_id, transaction_date desc);
create index transactions_user_marketplace_idx on public.transactions (user_id, marketplace);
create index transactions_user_external_idx on public.transactions (user_id, marketplace, external_id);
create index discrepancies_user_status_idx on public.discrepancies (user_id, status, created_at desc);
create index imports_user_created_idx on public.imports (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.marketplaces enable row level security;
alter table public.imports enable row level security;
alter table public.transactions enable row level security;
alter table public.discrepancies enable row level security;
alter table public.audit_logs enable row level security;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.marketplaces to authenticated;
grant select, insert, update, delete on public.imports to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.discrepancies to authenticated;
grant select, insert on public.audit_logs to authenticated;

create policy "profiles_select_own" on public.profiles for select to authenticated using (user_id = auth.uid());
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "marketplaces_select_own" on public.marketplaces for select to authenticated using (user_id = auth.uid());
create policy "marketplaces_insert_own" on public.marketplaces for insert to authenticated with check (user_id = auth.uid());
create policy "marketplaces_update_own" on public.marketplaces for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "marketplaces_delete_own" on public.marketplaces for delete to authenticated using (user_id = auth.uid());

create policy "imports_select_own" on public.imports for select to authenticated using (user_id = auth.uid());
create policy "imports_insert_own" on public.imports for insert to authenticated with check (user_id = auth.uid());
create policy "imports_update_own" on public.imports for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "imports_delete_own" on public.imports for delete to authenticated using (user_id = auth.uid());

create policy "transactions_select_own" on public.transactions for select to authenticated using (user_id = auth.uid());
create policy "transactions_insert_own" on public.transactions for insert to authenticated with check (user_id = auth.uid());
create policy "transactions_update_own" on public.transactions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "transactions_delete_own" on public.transactions for delete to authenticated using (user_id = auth.uid());

create policy "discrepancies_select_own" on public.discrepancies for select to authenticated using (user_id = auth.uid());
create policy "discrepancies_insert_own" on public.discrepancies for insert to authenticated with check (user_id = auth.uid());
create policy "discrepancies_update_own" on public.discrepancies for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "discrepancies_delete_own" on public.discrepancies for delete to authenticated using (user_id = auth.uid());

create policy "audit_logs_select_own" on public.audit_logs for select to authenticated using (user_id = auth.uid());
create policy "audit_logs_insert_own" on public.audit_logs for insert to authenticated with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('transaction-imports', 'transaction-imports', false)
on conflict (id) do nothing;

create policy "storage_imports_select_own"
on storage.objects for select to authenticated
using (bucket_id = 'transaction-imports' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage_imports_insert_own"
on storage.objects for insert to authenticated
with check (bucket_id = 'transaction-imports' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage_imports_update_own"
on storage.objects for update to authenticated
using (bucket_id = 'transaction-imports' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'transaction-imports' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storage_imports_delete_own"
on storage.objects for delete to authenticated
using (bucket_id = 'transaction-imports' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger marketplaces_set_updated_at
before update on public.marketplaces
for each row execute function private.set_updated_at();

create trigger imports_set_updated_at
before update on public.imports
for each row execute function private.set_updated_at();

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, company_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'company_name', 'Minha empresa'),
    'admin'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace function private.sync_transaction_dates()
returns trigger
language plpgsql
as $$
begin
  new.transaction_date := coalesce(new.transaction_date, new."date", now());
  new."date" := new.transaction_date;
  return new;
end;
$$;

create trigger transactions_sync_dates
before insert or update on public.transactions
for each row execute function private.sync_transaction_dates();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();
