begin;

create or replace function public.deactivate_rules_for_hidden_category()
returns trigger
language plpgsql
as $$
begin
  if old.is_active and not new.is_active then
    update public.user_category_rules
    set is_active = false
    where user_id = new.user_id
      and target_category_id = new.id
      and is_active;
  end if;

  return new;
end;
$$;

drop trigger if exists categories_deactivate_rules_when_hidden on public.categories;
create trigger categories_deactivate_rules_when_hidden
after update of is_active on public.categories
for each row execute function public.deactivate_rules_for_hidden_category();

update public.user_category_rules as rule
set is_active = false
from public.categories as category
where rule.target_category_id = category.id
  and not category.is_active
  and rule.is_active;

commit;
