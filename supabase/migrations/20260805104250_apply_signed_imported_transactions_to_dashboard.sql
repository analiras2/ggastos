begin;

create or replace function public.get_month_dashboard(p_month text)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_summary jsonb;
  v_categories jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'invalid month format: %', p_month;
  end if;

  with planned as (
    select
      coalesce(sum(amount_cents) filter (where impact_type = 'INCOME'), 0) as planned_income_cents,
      coalesce(sum(amount_cents) filter (where impact_type = 'EXPENSE'), 0) as planned_expense_cents,
      coalesce(sum(amount_cents) filter (where impact_type = 'INVESTMENT'), 0) as planned_investment_cents,
      coalesce(sum(amount_cents) filter (where impact_type = 'EXPENSE' and status = 'PLANNED'), 0) as committed_remaining_cents
    from public.planned_entries
    where user_id = v_user_id
      and month = p_month
      and status <> 'CANCELLED'
      and impact_type <> 'TRANSFER'
  ),
  imported_actual_rows as (
    select
      impact_type,
      internal_category_id,
      case
        when impact_type = 'INCOME' and direction = 'DEBIT' then -amount_cents
        when impact_type in ('EXPENSE', 'INVESTMENT') and direction = 'CREDIT' then -amount_cents
        else amount_cents
      end as signed_amount_cents
    from public.imported_transactions
    where user_id = v_user_id
      and competency_month = p_month
      and deleted_at is null
      and is_hidden_from_budget = false
      and is_internal_transfer = false
      and impact_type <> 'TRANSFER'
  ),
  actual as (
    select
      coalesce(sum(signed_amount_cents) filter (where impact_type = 'INCOME'), 0) as actual_income_cents,
      coalesce(sum(signed_amount_cents) filter (where impact_type = 'EXPENSE'), 0) as actual_expense_cents,
      coalesce(sum(signed_amount_cents) filter (where impact_type = 'INVESTMENT'), 0) as actual_investment_cents
    from imported_actual_rows
  ),
  manual_actual as (
    select
      coalesce(sum(amount_cents) filter (where impact_type = 'INCOME'), 0) as manual_income_cents,
      coalesce(sum(amount_cents) filter (where impact_type = 'EXPENSE'), 0) as manual_expense_cents,
      coalesce(sum(amount_cents) filter (where impact_type = 'INVESTMENT'), 0) as manual_investment_cents
    from public.planned_entries
    where user_id = v_user_id
      and month = p_month
      and status = 'RECONCILED'
      and manually_confirmed_at is not null
      and impact_type <> 'TRANSFER'
  )
  select jsonb_build_object(
    'plannedIncomeCents', planned.planned_income_cents,
    'actualIncomeCents', actual.actual_income_cents + manual_actual.manual_income_cents,
    'plannedExpenseCents', planned.planned_expense_cents,
    'actualExpenseCents', actual.actual_expense_cents + manual_actual.manual_expense_cents,
    'plannedInvestmentCents', planned.planned_investment_cents,
    'actualInvestmentCents', actual.actual_investment_cents + manual_actual.manual_investment_cents,
    'expectedBalanceCents',
      planned.planned_income_cents - planned.planned_expense_cents - planned.planned_investment_cents,
    'currentBalanceCents',
      (actual.actual_income_cents + manual_actual.manual_income_cents)
      - (actual.actual_expense_cents + manual_actual.manual_expense_cents)
      - (actual.actual_investment_cents + manual_actual.manual_investment_cents),
    'committedRemainingCents', planned.committed_remaining_cents
  )
  into v_summary
  from planned, actual, manual_actual;

  with category_planned as (
    select category_id, sum(amount_cents) as planned_cents
    from public.planned_entries
    where user_id = v_user_id
      and month = p_month
      and status <> 'CANCELLED'
      and impact_type <> 'TRANSFER'
    group by category_id
  ),
  imported_actual_rows as (
    select
      internal_category_id,
      case
        when impact_type = 'INCOME' and direction = 'DEBIT' then -amount_cents
        when impact_type in ('EXPENSE', 'INVESTMENT') and direction = 'CREDIT' then -amount_cents
        else amount_cents
      end as signed_amount_cents
    from public.imported_transactions
    where user_id = v_user_id
      and competency_month = p_month
      and deleted_at is null
      and is_hidden_from_budget = false
      and is_internal_transfer = false
      and impact_type <> 'TRANSFER'
      and internal_category_id is not null
  ),
  category_actual as (
    select internal_category_id as category_id, sum(signed_amount_cents) as actual_cents
    from imported_actual_rows
    group by internal_category_id
  ),
  category_manual_actual as (
    select category_id, sum(amount_cents) as manual_actual_cents
    from public.planned_entries
    where user_id = v_user_id
      and month = p_month
      and status = 'RECONCILED'
      and manually_confirmed_at is not null
      and impact_type <> 'TRANSFER'
    group by category_id
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'categoryId', c.id,
        'categoryCode', c.code,
        'name', c.name,
        'impactType', c.impact_type,
        'plannedCents', coalesce(cp.planned_cents, 0),
        'actualCents', coalesce(ca.actual_cents, 0) + coalesce(cma.manual_actual_cents, 0),
        'deltaCents',
          (coalesce(ca.actual_cents, 0) + coalesce(cma.manual_actual_cents, 0)) - coalesce(cp.planned_cents, 0)
      )
      order by c.name
    ),
    '[]'::jsonb
  )
  into v_categories
  from public.categories c
  left join category_planned cp on cp.category_id = c.id
  left join category_actual ca on ca.category_id = c.id
  left join category_manual_actual cma on cma.category_id = c.id
  where c.parent_id is not null
    and (cp.planned_cents is not null or ca.actual_cents is not null or cma.manual_actual_cents is not null);

  return jsonb_build_object(
    'month', p_month,
    'summary', v_summary,
    'categories', v_categories
  );
end;
$$;

grant execute on function public.get_month_dashboard(text) to authenticated;

commit;
