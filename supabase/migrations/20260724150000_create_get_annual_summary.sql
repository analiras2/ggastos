begin;

create or replace function public.get_annual_summary(p_year int)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_months jsonb;
  v_categories jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_year < 2000 or p_year > 2100 then
    raise exception 'invalid year: %', p_year;
  end if;

  -- Competency-only MVP: one row per calendar month, left-joined against
  -- whatever snapshot exists so months without a snapshot still render as a
  -- valid zeroed entry instead of being omitted or erroring.
  with month_series as (
    select to_char(make_date(p_year, gs, 1), 'YYYY-MM') as month
    from generate_series(1, 12) as gs
  ),
  snapshots as (
    select *
    from public.month_snapshots
    where user_id = v_user_id
      and month like p_year || '-%'
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'month', ms.month,
        'hasSnapshot', s.id is not null,
        'status', s.status,
        'plannedIncomeCents', coalesce(s.planned_income_cents, 0),
        'actualIncomeCents', coalesce(s.actual_income_cents, 0),
        'plannedExpenseCents', coalesce(s.planned_expense_cents, 0),
        'actualExpenseCents', coalesce(s.actual_expense_cents, 0),
        'plannedInvestmentCents', coalesce(s.planned_investment_cents, 0),
        'actualInvestmentCents', coalesce(s.actual_investment_cents, 0),
        'expectedBalanceCents', coalesce(s.expected_balance_cents, 0),
        'currentBalanceCents', coalesce(s.current_balance_cents, 0),
        'committedRemainingCents', coalesce(s.committed_remaining_cents, 0),
        'computedAt', s.computed_at
      )
      order by ms.month
    ),
    '[]'::jsonb
  )
  into v_months
  from month_series ms
  left join snapshots s on s.month = ms.month;

  -- Per-category rollup: unnest each snapshot's persisted category payload
  -- (already computed by get_month_dashboard, transfers already excluded
  -- there) and sum across the year's available snapshots.
  with category_rows as (
    select
      (cat ->> 'categoryId')::uuid as category_id,
      cat ->> 'categoryCode' as category_code,
      cat ->> 'name' as name,
      cat ->> 'impactType' as impact_type,
      coalesce((cat ->> 'plannedCents')::bigint, 0) as planned_cents,
      coalesce((cat ->> 'actualCents')::bigint, 0) as actual_cents
    from public.month_snapshots s
    cross join lateral jsonb_array_elements(
      coalesce(s.snapshot_payload -> 'categories', '[]'::jsonb)
    ) as cat
    where s.user_id = v_user_id
      and s.month like p_year || '-%'
      and cat ->> 'impactType' <> 'TRANSFER'
  ),
  category_totals as (
    select category_id, category_code, name, impact_type,
      sum(planned_cents) as planned_cents,
      sum(actual_cents) as actual_cents
    from category_rows
    group by category_id, category_code, name, impact_type
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'categoryId', category_id,
        'categoryCode', category_code,
        'name', name,
        'impactType', impact_type,
        'plannedCents', planned_cents,
        'actualCents', actual_cents,
        'deltaCents', actual_cents - planned_cents
      )
      order by name
    ),
    '[]'::jsonb
  )
  into v_categories
  from category_totals;

  return jsonb_build_object(
    'year', p_year,
    'months', v_months,
    'categories', v_categories
  );
end;
$$;

grant execute on function public.get_annual_summary(int) to authenticated;

commit;
