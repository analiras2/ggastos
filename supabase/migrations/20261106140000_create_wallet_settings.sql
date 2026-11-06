-- The wallet is the user's current balance, not a per-month figure. It starts at the day the user
-- informs their balance (`starts_on_month`, `initial_balance_cents`) and from then on follows the
-- settled movement of every month up to the current one. Months before the start (old statements
-- imported only to fill the yearly view) never change it.
--
-- `month_opening_balances` and its RPCs are no longer used by the app; they stay until the
-- database is reset.
begin;

create table if not exists public.wallet_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  starts_on_month text not null,
  initial_balance_cents bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallet_settings_month_format
    check (starts_on_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
);

create trigger set_wallet_settings_updated_at
before update on public.wallet_settings
for each row
execute function public.set_updated_at();

alter table public.wallet_settings enable row level security;

revoke all on public.wallet_settings from anon, authenticated;
grant select, insert, update, delete on public.wallet_settings to authenticated;
grant select, insert, update, delete on public.wallet_settings to service_role;

drop policy if exists wallet_settings_owner_access on public.wallet_settings;
create policy wallet_settings_owner_access
on public.wallet_settings
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Settled movement (what was actually paid or received) from p_from to p_to, both included.
create or replace function public.wallet_movement_cents(p_from text, p_to text)
returns bigint
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_month date := (p_from || '-01')::date;
  v_last date := (p_to || '-01')::date;
  v_total bigint := 0;
begin
  while v_month <= v_last loop
    v_total := v_total
      + coalesce(
        (public.get_month_dashboard(to_char(v_month, 'YYYY-MM')) -> 'summary' ->> 'currentBalanceCents')::bigint,
        0
      );
    v_month := (v_month + interval '1 month')::date;
  end loop;

  return v_total;
end;
$$;

create or replace function public.get_wallet(p_current_month text)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_settings public.wallet_settings;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_current_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'invalid month format: %', p_current_month;
  end if;

  select * into v_settings from public.wallet_settings where user_id = v_user_id;

  if not found then
    return jsonb_build_object(
      'isConfigured', false,
      'startsOnMonth', null,
      'initialBalanceCents', 0,
      'balanceCents', 0
    );
  end if;

  return jsonb_build_object(
    'isConfigured', true,
    'startsOnMonth', v_settings.starts_on_month,
    'initialBalanceCents', v_settings.initial_balance_cents,
    'balanceCents',
      v_settings.initial_balance_cents
      + public.wallet_movement_cents(v_settings.starts_on_month, p_current_month)
  );
end;
$$;

-- Makes the wallet show p_balance_cents now. The first call also fixes the start month.
create or replace function public.set_wallet_balance(p_current_month text, p_balance_cents bigint)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_starts_on text;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_current_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'invalid month format: %', p_current_month;
  end if;

  select starts_on_month into v_starts_on from public.wallet_settings where user_id = v_user_id;
  v_starts_on := coalesce(v_starts_on, p_current_month);

  insert into public.wallet_settings (user_id, starts_on_month, initial_balance_cents)
  values (
    v_user_id,
    v_starts_on,
    p_balance_cents - public.wallet_movement_cents(v_starts_on, p_current_month)
  )
  on conflict (user_id) do update
    set initial_balance_cents = excluded.initial_balance_cents;

  return public.get_wallet(p_current_month);
end;
$$;

revoke all on function public.wallet_movement_cents(text, text) from public, anon;
revoke all on function public.get_wallet(text) from public, anon;
revoke all on function public.set_wallet_balance(text, bigint) from public, anon;
grant execute on function public.wallet_movement_cents(text, text) to authenticated;
grant execute on function public.get_wallet(text) to authenticated;
grant execute on function public.set_wallet_balance(text, bigint) to authenticated;

commit;
