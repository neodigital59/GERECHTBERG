-- Add internal notes field to contact messages
-- Run this in Supabase SQL editor or via migration tooling

alter table public.contact_messages
  add column if not exists internal_notes text;

-- Optional: comment to document purpose
comment on column public.contact_messages.internal_notes is 'Notes internes pour suivi des échanges (non visibles publiquement)';