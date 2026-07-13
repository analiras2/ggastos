begin;

create or replace function public.ensure_active_category()
returns trigger
language plpgsql
as $$
declare
  v_is_active boolean;
begin
  select is_active into v_is_active from public.categories where id = new.category_id;

  if v_is_active is null then
    raise exception 'category % does not exist', new.category_id;
  end if;

  if not v_is_active then
    raise exception 'category % is inactive and cannot be used for new entries', new.category_id;
  end if;

  return new;
end;
$$;

drop trigger if exists planned_entries_active_category on public.planned_entries;
create trigger planned_entries_active_category
before insert or update of category_id on public.planned_entries
for each row execute function public.ensure_active_category();

drop trigger if exists planning_templates_active_category on public.planning_templates;
create trigger planning_templates_active_category
before insert or update of category_id on public.planning_templates
for each row execute function public.ensure_active_category();

commit;
