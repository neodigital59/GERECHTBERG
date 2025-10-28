-- Tables pour traçabilité et conformité
create table if not exists signature_events (
  id bigint generated always as identity primary key,
  document_id uuid null,
  provider text not null,
  type text not null,
  envelope_id text null,
  event jsonb null,
  valid_signature boolean default false,
  created_at timestamptz default now()
);

create index if not exists signature_events_envelope_idx on signature_events(envelope_id);
create index if not exists signature_events_doc_idx on signature_events(document_id);

create table if not exists document_timestamps (
  id bigint generated always as identity primary key,
  document_id uuid not null,
  hash text not null,
  receipt jsonb not null,
  created_at timestamptz default now()
);

create index if not exists document_timestamps_doc_idx on document_timestamps(document_id);

-- Optionnel: RLS
alter table signature_events enable row level security;
alter table document_timestamps enable row level security;

-- Politiques basiques: admin (service_role) uniquement en lecture/écriture, et propriétaire lecture.
-- Adaptez selon vos besoins
create policy if not exists signature_events_admin_all on signature_events for all using (auth.role() = 'service_role') with check (true);
create policy if not exists document_timestamps_admin_all on document_timestamps for all using (auth.role() = 'service_role') with check (true);