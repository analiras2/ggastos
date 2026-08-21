update public.categories as category
set parent_id = root_category.id
from public.categories as root_category
where category.user_id is not null
  and category.parent_id is null
  and root_category.user_id is null
  and root_category.code = lower(category.impact_type::text);

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
