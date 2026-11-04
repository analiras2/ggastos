begin;

-- Opt-in opening balance per month. A month without a row behaves exactly as
-- before (balance = that month's own movement); a row is only created when the
-- user carries the previous month over or types a value.
create table if not exists public.month_opening_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  month text not null,
  amount_cents bigint not null,
  source text not null,
  carried_from_month text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint month_opening_balances_user_month_unique unique (user_id, month),
  constraint month_opening_balances_month_format
    check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  constraint month_opening_balances_source_valid
    check (source in ('CARRIED', 'MANUAL')),
  constraint month_opening_balances_carried_month_format
    check (carried_from_month is null or carried_from_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
);

create trigger set_month_opening_balances_updated_at
before update on public.month_opening_balances
for each row
execute function public.set_updated_at();

alter table public.month_opening_balances enable row level security;

revoke all on public.month_opening_balances from anon, authenticated;
grant select, insert, update, delete on public.month_opening_balances to authenticated;
grant select, insert, update, delete on public.month_opening_balances to service_role;

drop policy if exists month_opening_balances_owner_access on public.month_opening_balances;
create policy month_opening_balances_owner_access
on public.month_opening_balances
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Closing balance of a month: its own movement plus its opening balance, if any.
create or replace function public.month_closing_balance_cents(p_month text)
returns bigint
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce((public.get_month_dashboard(p_month) -> 'summary' ->> 'currentBalanceCents')::bigint, 0)
    + coalesce(
      (
        select amount_cents
        from public.month_opening_balances
        where user_id = auth.uid()
          and month = p_month
      ),
      0
    );
$$;

create or replace function public.get_month_opening_balance(p_month text)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_previous_month text;
  v_previous_closing bigint;
  v_row public.month_opening_balances;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'invalid month format: %', p_month;
  end if;

  v_previous_month := to_char((p_month || '-01')::date - interval '1 month', 'YYYY-MM');
  v_previous_closing := public.month_closing_balance_cents(v_previous_month);

  select * into v_row
  from public.month_opening_balances
  where user_id = v_user_id and month = p_month;

  return jsonb_build_object(
    'month', p_month,
    'openingBalanceCents', v_row.amount_cents,
    'source', v_row.source,
    'carriedFromMonth', v_row.carried_from_month,
    'previousMonth', v_previous_month,
    'previousMonthClosingCents', v_previous_closing,
    'isStale', coalesce(v_row.source = 'CARRIED' and v_row.amount_cents <> v_previous_closing, false)
  );
end;
$$;

-- Copies the previous month's closing balance into p_month. The value is frozen
-- at call time; calling it again refreshes it.
create or replace function public.carry_over_opening_balance(p_month text)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_previous_month text;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'invalid month format: %', p_month;
  end if;

  v_previous_month := to_char((p_month || '-01')::date - interval '1 month', 'YYYY-MM');

  insert into public.month_opening_balances (user_id, month, amount_cents, source, carried_from_month)
  values (v_user_id, p_month, public.month_closing_balance_cents(v_previous_month), 'CARRIED', v_previous_month)
  on conflict (user_id, month) do update
    set amount_cents = excluded.amount_cents,
        source = excluded.source,
        carried_from_month = excluded.carried_from_month;

  return public.get_month_opening_balance(p_month);
end;
$$;

create or replace function public.set_month_opening_balance(p_month text, p_amount_cents bigint)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'invalid month format: %', p_month;
  end if;

  insert into public.month_opening_balances (user_id, month, amount_cents, source, carried_from_month)
  values (v_user_id, p_month, p_amount_cents, 'MANUAL', null)
  on conflict (user_id, month) do update
    set amount_cents = excluded.amount_cents,
        source = excluded.source,
        carried_from_month = null;

  return public.get_month_opening_balance(p_month);
end;
$$;

create or replace function public.clear_month_opening_balance(p_month text)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  delete from public.month_opening_balances
  where user_id = v_user_id and month = p_month;

  return public.get_month_opening_balance(p_month);
end;
$$;

grant execute on function public.month_closing_balance_cents(text) to authenticated;
grant execute on function public.get_month_opening_balance(text) to authenticated;
grant execute on function public.carry_over_opening_balance(text) to authenticated;
grant execute on function public.set_month_opening_balance(text, bigint) to authenticated;
grant execute on function public.clear_month_opening_balance(text) to authenticated;

-- Annual summary: months that have an opening balance include it in both
-- balances. Snapshots keep storing the month's own movement only, so the
-- opening balance is overlaid live and never double counted.
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

  with month_series as (
    select to_char(make_date(p_year, gs, 1), 'YYYY-MM') as month
    from generate_series(1, 12) as gs
  ),
  snapshots as (
    select *
    from public.month_snapshots
    where user_id = v_user_id
      and month like p_year || '-%'
  ),
  openings as (
    select month, amount_cents
    from public.month_opening_balances
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
        'openingBalanceCents', coalesce(o.amount_cents, 0),
        'expectedBalanceCents', coalesce(s.expected_balance_cents, 0) + coalesce(o.amount_cents, 0),
        'currentBalanceCents', coalesce(s.current_balance_cents, 0) + coalesce(o.amount_cents, 0),
        'committedRemainingCents', coalesce(s.committed_remaining_cents, 0),
        'computedAt', s.computed_at
      )
      order by ms.month
    ),
    '[]'::jsonb
  )
  into v_months
  from month_series ms
  left join snapshots s on s.month = ms.month
  left join openings o on o.month = ms.month;

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
