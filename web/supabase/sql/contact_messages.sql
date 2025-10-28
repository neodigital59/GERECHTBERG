-- Créer la table des messages de contact
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new',
  origin text null,
  created_at timestamp with time zone not null default now()
);

-- Index pour la consultation par statut et date
create index if not exists contact_messages_status_idx on public.contact_messages(status);
create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);