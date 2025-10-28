-- Politiques RLS renforcées pour les tables de signature/horodatage
-- À exécuter dans Supabase SQL Editor

-- Assurer que la RLS est activée
alter table signature_events enable row level security;
alter table document_timestamps enable row level security;

-- Accès complet réservé au service_role (intégrations serveur)
create policy if not exists signature_events_admin_all on signature_events
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy if not exists document_timestamps_admin_all on document_timestamps
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Lecture par l’utilisateur propriétaire du document lié
create policy if not exists signature_events_read_own on signature_events
  for select using (
    exists (
      select 1 from documents d
      where d.id = signature_events.document_id
        and d.user_id = auth.uid()
    )
  );

create policy if not exists document_timestamps_read_own on document_timestamps
  for select using (
    exists (
      select 1 from documents d
      where d.id = document_timestamps.document_id
        and d.user_id = auth.uid()
    )
  );

-- Aucune politique d'insert/update/delete pour les utilisateurs
-- => Par défaut, interdit. Seul service_role (serveur) peut écrire via les politiques ci-dessus.