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

with child_categories (code, name, impact_type, color, parent_code) as (
  values
    ('salary', 'Salário', 'INCOME'::public.budget_impact_type, '#2E8B57', 'income'),
    ('extra_income', 'Renda extra', 'INCOME'::public.budget_impact_type, '#3FAF75', 'income'),
    ('housing', 'Moradia', 'EXPENSE'::public.budget_impact_type, '#C44536', 'expense'),
    ('food', 'Alimentação', 'EXPENSE'::public.budget_impact_type, '#E07A5F', 'expense'),
    ('transport', 'Transporte', 'EXPENSE'::public.budget_impact_type, '#F2A65A', 'expense'),
    ('health', 'Saúde', 'EXPENSE'::public.budget_impact_type, '#D7263D', 'expense'),
    ('education', 'Educação', 'EXPENSE'::public.budget_impact_type, '#4D908E', 'expense'),
    ('bills', 'Contas e serviços', 'EXPENSE'::public.budget_impact_type, '#577590', 'expense'),
    ('shopping', 'Compras', 'EXPENSE'::public.budget_impact_type, '#9C6644', 'expense'),
    ('leisure', 'Lazer', 'EXPENSE'::public.budget_impact_type, '#7B2CBF', 'expense'),
    ('taxes_fees', 'Impostos e tarifas', 'EXPENSE'::public.budget_impact_type, '#6C757D', 'expense'),
    ('invested_amount', 'Aportes', 'INVESTMENT'::public.budget_impact_type, '#277DA1', 'investment'),
    ('internal_transfer', 'Transferência interna', 'TRANSFER'::public.budget_impact_type, '#6B7280', 'transfer')
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
  child_categories.code,
  child_categories.name,
  child_categories.impact_type,
  child_categories.color,
  parent_categories.id,
  true
from child_categories
join public.categories as parent_categories
  on parent_categories.code = child_categories.parent_code
on conflict (code) do update
set
  name = excluded.name,
  impact_type = excluded.impact_type,
  color = excluded.color,
  parent_id = excluded.parent_id,
  is_active = true;

commit;
