-- Ajoute les colonnes de profil pour l’inscription standard
alter table users add column if not exists name text;
alter table users add column if not exists country text;

-- Contraintes légères pour cohérence
alter table users add constraint users_name_length check (name is null or char_length(name) <= 100);
alter table users add constraint users_country_code check (country is null or country ~ '^[A-Z]{2}$');

-- (Optionnel) Index sur email pour accélérer recherches (id est déjà PK)
create index if not exists users_email_idx on users (email);