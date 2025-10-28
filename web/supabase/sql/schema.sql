-- Schema: tables pour GERECHTBERG
-- À exécuter dans l’éditeur SQL Supabase (Project > SQL)

-- Extension pour UUID (si non active)
-- create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text default 'user',
  plan text default 'freemium',
  trial_start timestamptz,
  trial_end timestamptz,
  stripe_customer_id text
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text,
  titre text,
  contenu text,
  details text,
  langue text,
  statut text check (statut in ('draft','signé','horodaté')) default 'draft',
  hash text,
  date_creation timestamptz default now()
);

create table if not exists document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  version int not null,
  contenu text,
  date_modification timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan text not null,
  status text not null,
  start_date timestamptz,
  end_date timestamptz,
  stripe_subscription_id text,
  stripe_price_id text,
  cancel_at_period_end boolean default false
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  montant numeric not null,
  type text not null,
  date timestamptz default now()
);