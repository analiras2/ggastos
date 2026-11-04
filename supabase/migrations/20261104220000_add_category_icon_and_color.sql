begin;

-- categories.color already exists (unused so far). Add the icon and constrain
-- both to values the app can render: a #RRGGBB hex color and a lucide icon name.
alter table public.categories
  add column if not exists icon text;

alter table public.categories
  drop constraint if exists categories_color_hex,
  drop constraint if exists categories_icon_name_format;

alter table public.categories
  add constraint categories_color_hex
    check (color is null or color ~ '^#[0-9A-Fa-f]{6}$') not valid,
  add constraint categories_icon_name_format
    check (icon is null or icon ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- Existing rows may hold free-form text in color; validate only new writes.

-- The 2-argument create_personal_category stays for clients that have not
-- updated yet; this overload adds the optional appearance.
create or replace function public.create_personal_category(
  p_name text,
  p_impact_type public.budget_impact_type,
  p_icon text,
  p_color text
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

  insert into public.categories (code, name, impact_type, parent_id, user_id, icon, color)
  values (
    format('custom_%s', replace(gen_random_uuid()::text, '-', '')),
    v_name,
    p_impact_type,
    v_parent_id,
    auth.uid(),
    p_icon,
    p_color
  )
  returning * into v_category;

  return v_category;
end;
$$;

grant execute on function public.create_personal_category(text, public.budget_impact_type, text, text) to authenticated;

commit;
