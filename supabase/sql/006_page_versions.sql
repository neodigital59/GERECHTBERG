-- Historique des versions et workflow de validation pour les pages CMS
-- À exécuter dans l'éditeur SQL Supabase

begin;

create extension if not exists pgcrypto;

create table if not exists public.page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  title text not null,
  content text not null,
  state text not null check (state in ('draft','in_review','approved','published')),
  approved_by uuid null references public.users(id) on delete set null,
  author_id uuid null references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists page_versions_page_idx on public.page_versions(page_id);
create index if not exists page_versions_state_idx on public.page_versions(state);

alter table public.page_versions enable row level security;

-- Accès complet réservé au service_role
drop policy if exists page_versions_admin_all on public.page_versions;
create policy page_versions_admin_all on public.page_versions
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Lecture publique des versions publiées
drop policy if exists page_versions_select_published on public.page_versions;
create policy page_versions_select_published on public.page_versions
  for select using (state = 'published');

-- Lecture/écriture par l'auteur
drop policy if exists page_versions_select_own on public.page_versions;
create policy page_versions_select_own on public.page_versions
  for select using (author_id = auth.uid());

drop policy if exists page_versions_insert_own on public.page_versions;
create policy page_versions_insert_own on public.page_versions
  for insert with check (author_id = auth.uid());

drop policy if exists page_versions_update_own on public.page_versions;
create policy page_versions_update_own on public.page_versions
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

commit;