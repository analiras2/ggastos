begin;

create table public.pluggy_category_map (
  pluggy_category_name text primary key,
  category_code text not null references public.categories (code),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pluggy_category_map enable row level security;

revoke all on public.pluggy_category_map from anon, authenticated;

grant select on public.pluggy_category_map to authenticated;
grant select, insert, update, delete on public.pluggy_category_map to service_role;

drop policy if exists pluggy_category_map_authenticated_read on public.pluggy_category_map;
create policy pluggy_category_map_authenticated_read
on public.pluggy_category_map
for select
to authenticated
using (true);

create trigger set_pluggy_category_map_updated_at
before update on public.pluggy_category_map
for each row execute function public.set_updated_at();

-- Mapping rows themselves live in supabase/seed.sql (after categories are
-- seeded, since this table's FK requires the target category codes to
-- already exist) — see the "pluggy_category_map" block there.

commit;
