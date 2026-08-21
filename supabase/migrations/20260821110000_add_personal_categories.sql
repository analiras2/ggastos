begin;

alter table public.categories
  add column if not exists user_id uuid references public.profiles (id) on delete cascade;

create or replace function public.normalize_category_name(value text)
returns text
language sql
immutable
as $$
  select lower(
    regexp_replace(
      translate(
        btrim(value),
        'ÁÀÃÂÄáàãâäÉÊÈËéêèëÍÎÌÏíîìïÓÔÒÕÖóôòõöÚÛÙÜúûùüÇç',
        'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCc'
      ),
      '\s+',
      ' ',
      'g'
    )
  );
$$;

create unique index if not exists categories_personal_name_per_type_unique
  on public.categories (user_id, impact_type, public.normalize_category_name(name))
  where user_id is not null;

grant insert, update on public.categories to authenticated;

drop policy if exists categories_authenticated_read on public.categories;
create policy categories_visible_to_owner_or_shared
on public.categories
for select
to authenticated
using (user_id is null or user_id = auth.uid());

drop policy if exists categories_owner_write on public.categories;
create policy categories_owner_write
on public.categories
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.create_personal_category(
  p_name text,
  p_impact_type public.budget_impact_type
)
returns public.categories
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_name text := btrim(p_name);
  v_category public.categories;
  v_parent_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if v_name = '' then
    raise exception 'category name cannot be blank';
  end if;

  select id into v_parent_id
  from public.categories
  where user_id is null
    and code = lower(p_impact_type::text);

  if v_parent_id is null then
    raise exception 'root category for % does not exist', p_impact_type;
  end if;

  insert into public.categories (code, name, impact_type, parent_id, user_id)
  values (
    format('custom_%s', replace(gen_random_uuid()::text, '-', '')),
    v_name,
    p_impact_type,
    v_parent_id,
    auth.uid()
  )
  returning * into v_category;

  return v_category;
end;
$$;

grant execute on function public.create_personal_category(text, public.budget_impact_type) to authenticated;

commit;
