begin;

with root_categories (code, name, impact_type, color) as (
  values
    ('income', 'Receitas', 'INCOME'::public.budget_impact_type, '#2E8B57'),
    ('expense', 'Despesas', 'EXPENSE'::public.budget_impact_type, '#D1495B'),
    ('investment', 'Investimentos', 'INVESTMENT'::public.budget_impact_type, '#1F6FEB'),
    ('transfer', 'Transferências', 'TRANSFER'::public.budget_impact_type, '#6B7280')
)
insert into public.categories (
  code,
  name,
  impact_type,
  color,
  parent_id,
  is_active
)
select
  root_categories.code,
  root_categories.name,
  root_categories.impact_type,
  root_categories.color,
  null,
  true
from root_categories
on conflict (code) do update
set
  name = excluded.name,
  impact_type = excluded.impact_type,
  color = excluded.color,
  parent_id = excluded.parent_id,
  is_active = true;

commit;
