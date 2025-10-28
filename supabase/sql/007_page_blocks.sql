-- Modèle CMS par blocs: table page_blocks et politiques RLS
-- À exécuter dans l'éditeur SQL Supabase

begin;

create extension if not exists pgcrypto;

create table if not exists public.page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  type text not null,
  content jsonb not null default '{}',
  order_index int not null default 0,
  published boolean not null default false,
  author_id uuid null references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists page_blocks_page_idx on public.page_blocks(page_id);
create index if not exists page_blocks_order_idx on public.page_blocks(page_id, order_index);
create index if not exists page_blocks_published_idx on public.page_blocks(published);
create index if not exists page_blocks_type_idx on public.page_blocks(type);

alter table public.page_blocks enable row level security;

-- Accès complet réservé au service_role (intégrations serveur)
drop policy if exists page_blocks_admin_all on public.page_blocks;
create policy page_blocks_admin_all on public.page_blocks
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Lecture publique pour les blocs publiés ET dont la page est publiée
drop policy if exists page_blocks_select_public on public.page_blocks;
create policy page_blocks_select_public on public.page_blocks
  for select using (
    published = true
    and exists (
      select 1 from public.pages p
      where p.id = page_blocks.page_id
        and p.published = true
    )
  );

-- Lecture/écriture par l'auteur
drop policy if exists page_blocks_select_own on public.page_blocks;
create policy page_blocks_select_own on public.page_blocks
  for select using (author_id = auth.uid());

drop policy if exists page_blocks_insert_own on public.page_blocks;
create policy page_blocks_insert_own on public.page_blocks
  for insert with check (author_id = auth.uid());

drop policy if exists page_blocks_update_own on public.page_blocks;
create policy page_blocks_update_own on public.page_blocks
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists page_blocks_delete_own on public.page_blocks;
create policy page_blocks_delete_own on public.page_blocks
  for delete using (author_id = auth.uid());

commit;