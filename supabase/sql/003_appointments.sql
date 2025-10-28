-- Appointments tables and RLS policies (run in Supabase SQL editor)
-- If you see schema cache errors after creation, go to Settings > API > Reload schema cache.

begin;

create extension if not exists pgcrypto;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  notes text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_user_idx on public.appointments(user_id);
create index if not exists appointments_time_idx on public.appointments(start_time, end_time);

alter table public.appointments enable row level security;

create policy if not exists appointments_admin_all on public.appointments
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy if not exists appointments_select_own on public.appointments
  for select using (user_id = auth.uid());

create policy if not exists appointments_insert_own on public.appointments
  for insert with check (user_id = auth.uid());

create policy if not exists appointments_update_own on public.appointments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy if not exists appointments_delete_own on public.appointments
  for delete using (user_id = auth.uid());

commit;