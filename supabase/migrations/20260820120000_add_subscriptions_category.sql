insert into public.categories (
  code,
  name,
  impact_type,
  color,
  parent_id,
  is_active
)
select
  'subscriptions',
  'Assinaturas',
  'EXPENSE'::public.budget_impact_type,
  '#2563EB',
  parent_category.id,
  true
from public.categories as parent_category
where parent_category.code = 'expense'
on conflict (code) do update
set
  name = excluded.name,
  impact_type = excluded.impact_type,
  color = excluded.color,
  parent_id = excluded.parent_id,
  is_active = true;
