-- ALL-IN-ONE SETUP FOR SUPABASE (GERECHTBERG)
-- Paste this into your Supabase SQL Editor and run.
-- If you see "relation doesn't exist" or schema cache issues, use Settings > API > Reload Schema.

-- 0) Extension for UUIDs
create extension if not exists pgcrypto;

-- 1) Core tables
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text default 'user',
  plan text default 'freemium',
  trial_start timestamptz,
  trial_end timestamptz,
  stripe_customer_id text,
  name text,
  country text,
  constraint users_name_length check (name is null or char_length(name) <= 100),
  constraint users_country_code check (country is null or country ~ '^[A-Z]{2}$')
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text,
  titre text,
  contenu text,
  details text,
  langue text,
  statut text check (statut in ('draft','signé','horodaté')) default 'draft',
  hash text,
  date_creation timestamptz default now()
);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version int not null,
  contenu text,
  date_modification timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null,
  status text not null,
  start_date timestamptz,
  end_date timestamptz,
  stripe_subscription_id text,
  stripe_price_id text,
  cancel_at_period_end boolean default false
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  montant numeric not null,
  type text not null,
  date timestamptz default now()
);

-- 2) Signature & timestamp tables
create table if not exists public.signature_events (
  id bigint generated always as identity primary key,
  document_id uuid null,
  provider text not null,
  type text not null,
  envelope_id text null,
  event jsonb null,
  valid_signature boolean default false,
  created_at timestamptz default now()
);
create index if not exists signature_events_envelope_idx on public.signature_events(envelope_id);
create index if not exists signature_events_doc_idx on public.signature_events(document_id);

create table if not exists public.document_timestamps (
  id bigint generated always as identity primary key,
  document_id uuid not null,
  hash text not null,
  receipt jsonb not null,
  created_at timestamptz default now()
);
create index if not exists document_timestamps_doc_idx on public.document_timestamps(document_id);

-- 3) Enable RLS on all tables
alter table public.users enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;
alter table public.signature_events enable row level security;
alter table public.document_timestamps enable row level security;

-- 4) RLS policies
-- USERS: owner-only
create policy if not exists "Users can read own profile" on public.users
  for select using (auth.uid() = id);
create policy if not exists "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);
create policy if not exists "Users can update own profile" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- DOCUMENTS: owner-only CRUD
create policy if not exists "Read own documents" on public.documents
  for select using (auth.uid() = user_id);
create policy if not exists "Insert own documents" on public.documents
  for insert with check (auth.uid() = user_id);
create policy if not exists "Update own documents" on public.documents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Delete own documents" on public.documents
  for delete using (auth.uid() = user_id);

-- DOCUMENT_VERSIONS: linked to owner of document
create policy if not exists "Read versions of own documents" on public.document_versions
  for select using (exists(select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid()));
create policy if not exists "Insert versions for own documents" on public.document_versions
  for insert with check (exists(select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid()));

-- SUBSCRIPTIONS: read by owner; write by service role
create policy if not exists "Read own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy if not exists "Insert by service role" on public.subscriptions
  for insert with check (auth.role() = 'service_role');
create policy if not exists "Update by service role" on public.subscriptions
  for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- TRANSACTIONS: read by owner; write by service role
create policy if not exists "Read own transactions" on public.transactions
  for select using (auth.uid() = user_id);
create policy if not exists "Insert by service role" on public.transactions
  for insert with check (auth.role() = 'service_role');

-- SIGNATURE_EVENTS: service_role full; owner read
create policy if not exists signature_events_admin_all on public.signature_events
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists signature_events_read_own on public.signature_events
  for select using (
    exists (
      select 1 from public.documents d
      where d.id = signature_events.document_id
        and d.user_id = auth.uid()
    )
  );

-- DOCUMENT_TIMESTAMPS: service_role full; owner read
create policy if not exists document_timestamps_admin_all on public.document_timestamps
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists document_timestamps_read_own on public.document_timestamps
  for select using (
    exists (
      select 1 from public.documents d
      where d.id = document_timestamps.document_id
        and d.user_id = auth.uid()
    )
  );

-- 5) Optional indexes to speed up lists
create index if not exists documents_created_at_idx on public.documents(date_creation desc);
create index if not exists documents_user_idx on public.documents(user_id);

-- 6) Quick check (safe even if empty)
-- select count(*) as docs from public.documents;
-- select count(*) as sig_events from public.signature_events;