-- The type of an entry (expense, income, ...) is chosen on the entry itself and no longer follows
-- its category. The month dashboard therefore returns one category row per (category, entry type),
-- so an income booked in an "expense" category is not summed with the expenses of that category.
-- Totals (summary) are unchanged: they already used the entry's own type.
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
      status,
      exists (
        select 1
        from public.reconciliation_matches as reconciliation_match
        where reconciliation_match.imported_transaction_id = imported_transactions.id
          and reconciliation_match.status in ('AUTO_MATCHED', 'MANUAL_MATCHED')
      ) as is_matched,
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
  settled as (
    select
      coalesce(sum(signed_amount_cents) filter (where impact_type = 'INCOME'), 0) as settled_income_cents,
      coalesce(sum(signed_amount_cents) filter (where impact_type = 'EXPENSE'), 0) as settled_expense_cents,
      coalesce(sum(signed_amount_cents) filter (where impact_type = 'INVESTMENT'), 0) as settled_investment_cents
    from imported_actual_rows
    where status = 'POSTED'
  ),
  open_expense as (
    select
      coalesce(sum(signed_amount_cents), 0) as open_expense_cents,
      coalesce(sum(signed_amount_cents) filter (where not is_matched), 0) as open_unmatched_expense_cents
    from imported_actual_rows
    where status = 'PENDING'
      and impact_type = 'EXPENSE'
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
      (settled.settled_income_cents + manual_actual.manual_income_cents)
      - (settled.settled_expense_cents + manual_actual.manual_expense_cents)
      - (settled.settled_investment_cents + manual_actual.manual_investment_cents),
    'committedRemainingCents',
      planned.committed_remaining_cents + open_expense.open_unmatched_expense_cents,
    'openExpenseCents', open_expense.open_expense_cents
  )
  into v_summary
  from planned, actual, settled, open_expense, manual_actual;

  with category_planned as (
    select category_id, impact_type::text as impact_type, sum(amount_cents) as planned_cents
    from public.planned_entries
    where user_id = v_user_id
      and month = p_month
      and status <> 'CANCELLED'
      and impact_type <> 'TRANSFER'
    group by category_id, impact_type
  ),
  imported_category_rows as (
    select
      coalesce(transaction.internal_category_id, planned_entry.category_id) as category_id,
      transaction.impact_type::text as impact_type,
      case
        when transaction.impact_type = 'INCOME' and transaction.direction = 'DEBIT' then -transaction.amount_cents
        when transaction.impact_type in ('EXPENSE', 'INVESTMENT') and transaction.direction = 'CREDIT' then -transaction.amount_cents
        else transaction.amount_cents
      end as signed_amount_cents
    from public.imported_transactions as transaction
    left join public.reconciliation_matches as reconciliation_match
      on reconciliation_match.imported_transaction_id = transaction.id
      and reconciliation_match.status in ('AUTO_MATCHED', 'MANUAL_MATCHED')
    left join public.planned_entries as planned_entry
      on planned_entry.id = reconciliation_match.planned_entry_id
    where transaction.user_id = v_user_id
      and transaction.competency_month = p_month
      and transaction.deleted_at is null
      and transaction.is_hidden_from_budget = false
      and transaction.is_internal_transfer = false
      and transaction.impact_type <> 'TRANSFER'
      and coalesce(transaction.internal_category_id, planned_entry.category_id) is not null
  ),
  category_actual as (
    select category_id, impact_type, sum(signed_amount_cents) as actual_cents
    from imported_category_rows
    group by category_id, impact_type
  ),
  category_manual_actual as (
    select category_id, impact_type::text as impact_type, sum(amount_cents) as manual_actual_cents
    from public.planned_entries
    where user_id = v_user_id
      and month = p_month
      and status = 'RECONCILED'
      and manually_confirmed_at is not null
      and impact_type <> 'TRANSFER'
    group by category_id, impact_type
  ),
  category_keys as (
    select category_id, impact_type from category_planned
    union
    select category_id, impact_type from category_actual
    union
    select category_id, impact_type from category_manual_actual
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'categoryId', c.id,
        'categoryCode', c.code,
        'name', c.name,
        'impactType', k.impact_type,
        'plannedCents', coalesce(cp.planned_cents, 0),
        'actualCents', coalesce(ca.actual_cents, 0) + coalesce(cma.manual_actual_cents, 0),
        'deltaCents',
          (coalesce(ca.actual_cents, 0) + coalesce(cma.manual_actual_cents, 0)) - coalesce(cp.planned_cents, 0)
      )
      order by c.name, k.impact_type
    ),
    '[]'::jsonb
  )
  into v_categories
  from category_keys k
  join public.categories c on c.id = k.category_id and c.parent_id is not null
  left join category_planned cp on cp.category_id = k.category_id and cp.impact_type = k.impact_type
  left join category_actual ca on ca.category_id = k.category_id and ca.impact_type = k.impact_type
  left join category_manual_actual cma on cma.category_id = k.category_id and cma.impact_type = k.impact_type;

  return jsonb_build_object(
    'month', p_month,
    'summary', v_summary,
    'categories', v_categories
  );
end;
$$;

grant execute on function public.get_month_dashboard(text) to authenticated;

commit;
