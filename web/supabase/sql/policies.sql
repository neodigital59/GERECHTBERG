-- RLS politiques pour sécurité par utilisateur
-- Activer la RLS sur toutes les tables
alter table users enable row level security;
alter table documents enable row level security;
alter table document_versions enable row level security;
alter table subscriptions enable row level security;
alter table transactions enable row level security;

-- USERS: chaque utilisateur gère son propre profil
create policy "Users can read own profile" on users
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- DOCUMENTS
create policy "Read own documents" on documents
  for select using (auth.uid() = user_id);

create policy "Insert own documents" on documents
  for insert with check (auth.uid() = user_id);

create policy "Update own documents" on documents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Delete own documents" on documents
  for delete using (auth.uid() = user_id);

-- DOCUMENT_VERSIONS (lié au propriétaire du document)
create policy "Read versions of own documents" on document_versions
  for select using (exists(select 1 from documents d where d.id = document_id and d.user_id = auth.uid()));

create policy "Insert versions for own documents" on document_versions
  for insert with check (exists(select 1 from documents d where d.id = document_id and d.user_id = auth.uid()));

-- SUBSCRIPTIONS (lecture par l’utilisateur, écriture par service_role)
create policy "Read own subscriptions" on subscriptions
  for select using (auth.uid() = user_id);

create policy "Insert by service role" on subscriptions
  for insert with check (auth.role() = 'service_role');

create policy "Update by service role" on subscriptions
  for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- TRANSACTIONS (lecture par l’utilisateur, écriture par service_role)
create policy "Read own transactions" on transactions
  for select using (auth.uid() = user_id);

create policy "Insert by service role" on transactions
  for insert with check (auth.role() = 'service_role');