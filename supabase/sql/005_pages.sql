-- Pages CMS: structure et politiques RLS
-- À exécuter dans l'éditeur SQL Supabase

begin;

create extension if not exists pgcrypto;

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null,
  published boolean not null default false,
  author_id uuid null references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pages_slug_idx on public.pages(slug);
create index if not exists pages_published_idx on public.pages(published);

alter table public.pages enable row level security;

-- Accès complet réservé au service_role (intégrations serveur)
drop policy if exists pages_admin_all on public.pages;
create policy pages_admin_all on public.pages
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Lecture publique pour les pages publiées
drop policy if exists pages_select_published on public.pages;
create policy pages_select_published on public.pages
  for select using (published = true);

-- Lecture/écriture par le propriétaire (optionnel)
drop policy if exists pages_select_own on public.pages;
create policy pages_select_own on public.pages
  for select using (author_id = auth.uid());

drop policy if exists pages_insert_own on public.pages;
create policy pages_insert_own on public.pages
  for insert with check (author_id = auth.uid());

drop policy if exists pages_update_own on public.pages;
create policy pages_update_own on public.pages
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists pages_delete_own on public.pages;
create policy pages_delete_own on public.pages
  for delete using (author_id = auth.uid());

commit;