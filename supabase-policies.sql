-- Run this in the Supabase SQL editor.
-- It allows public analytics inserts, while keeping analytics/receipts readable only by admins.

-- Optional helper to keep policy checks readable.
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin_user() to anon, authenticated;

alter table public.site_analytics_events enable row level security;
drop policy if exists "Public analytics insert" on public.site_analytics_events;
create policy "Public analytics insert"
on public.site_analytics_events
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read analytics" on public.site_analytics_events;
create policy "Admins can read analytics"
on public.site_analytics_events
for select
to authenticated
using (public.is_admin_user());

alter table public.receipts enable row level security;
drop policy if exists "Admins can read receipts" on public.receipts;
create policy "Admins can read receipts"
on public.receipts
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "Admins can create receipts" on public.receipts;
create policy "Admins can create receipts"
on public.receipts
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "Admins can update receipts" on public.receipts;
create policy "Admins can update receipts"
on public.receipts
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Admins can delete receipts" on public.receipts;
create policy "Admins can delete receipts"
on public.receipts
for delete
to authenticated
using (public.is_admin_user());
