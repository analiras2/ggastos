-- Payment status of imported statements.
--
-- imported_transactions.status is POSTED when the statement was paid and PENDING when it is still
-- open. Only the cash side of the month dashboard reads it:
--   * currentBalanceCents counts settled (POSTED) imports, so an unpaid statement is not cash out yet;
--   * committedRemainingCents adds open imported expenses that did not match a planned entry
--     (a matched one is already counted through its planned entry);
--   * openExpenseCents is the total of every open imported expense of the month.
-- actual*Cents and the per-category figures keep counting every import: the spending happened.
-- Everything else is identical to 20260805143000_attribute_matched_imports_to_planned_category.sql.
begin;

-- Payment status of a statement. Every statement imported so far was treated as paid, so that is
-- the default and the backfill: nothing changes for existing data.
alter table public.statement_import_batches
  add column if not exists payment_status text not null default 'PAID',
  add column if not exists paid_at timestamptz;

alter table public.statement_import_batches
  drop constraint if exists statement_import_batches_payment_status_valid,
  drop constraint if exists statement_import_batches_paid_at_only_when_paid;

alter table public.statement_import_batches
  add constraint statement_import_batches_payment_status_valid
    check (payment_status in ('PAID', 'OPEN')),
  add constraint statement_import_batches_paid_at_only_when_paid
    check (paid_at is null or payment_status = 'PAID');

-- Pays or reopens a whole statement: the batch and every transaction of it change together, in one
-- transaction. security invoker keeps RLS in force, so another user's batch is simply not found.
create or replace function public.set_statement_payment_status(
  p_batch_id uuid,
  p_payment_status text,
  p_paid_at timestamptz default null
)
returns table (rows_updated integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  if p_payment_status is null or p_payment_status not in ('PAID', 'OPEN') then
    raise exception 'The payment status must be PAID or OPEN.' using errcode = '22023';
  end if;

  update public.statement_import_batches
  set
    payment_status = p_payment_status,
    paid_at = case when p_payment_status = 'PAID' then coalesce(p_paid_at, now()) else null end
  where id = p_batch_id
    and user_id = v_user_id;

  if not found then
    raise exception 'Statement not found.' using errcode = 'PT404';
  end if;

  update public.imported_transactions
  set status = case when p_payment_status = 'PAID' then 'POSTED' else 'PENDING' end::public.transaction_status
  where statement_import_batch_id = p_batch_id
    and user_id = v_user_id;

  get diagnostics rows_updated = row_count;
  return next;
end;
$$;

revoke all on function public.set_statement_payment_status(uuid, text, timestamptz) from public, anon;
grant execute on function public.set_statement_payment_status(uuid, text, timestamptz) to authenticated;

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
    select category_id, sum(amount_cents) as planned_cents
    from public.planned_entries
    where user_id = v_user_id
      and month = p_month
      and status <> 'CANCELLED'
      and impact_type <> 'TRANSFER'
    group by category_id
  ),
  imported_category_rows as (
    select
      coalesce(transaction.internal_category_id, planned_entry.category_id) as category_id,
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
    select category_id, sum(signed_amount_cents) as actual_cents
    from imported_category_rows
    group by category_id
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
