begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'recurrence_frequency'
  ) then
    create type public.recurrence_frequency as enum (
      'NONE',
      'MONTHLY',
      'YEARLY'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'connection_status'
  ) then
    create type public.connection_status as enum (
      'UPDATING',
      'UPDATED',
      'LOGIN_ERROR',
      'OUTDATED',
      'WAITING_USER_INPUT',
      'DELETED'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'account_type'
  ) then
    create type public.account_type as enum (
      'BANK',
      'CREDIT'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'account_subtype'
  ) then
    create type public.account_subtype as enum (
      'CHECKING_ACCOUNT',
      'SAVINGS_ACCOUNT',
      'CREDIT_CARD',
      'OTHER'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'transaction_status'
  ) then
    create type public.transaction_status as enum (
      'PENDING',
      'POSTED'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'transaction_direction'
  ) then
    create type public.transaction_direction as enum (
      'DEBIT',
      'CREDIT'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'entry_origin'
  ) then
    create type public.entry_origin as enum (
      'PLUGGY',
      'MANUAL',
      'RECURRING_TEMPLATE',
      'INSTALLMENT_TEMPLATE',
      'SYSTEM'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'planning_status'
  ) then
    create type public.planning_status as enum (
      'PLANNED',
      'PROJECTED',
      'RECONCILED',
      'CANCELLED',
      'CARRIED_OVER'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'match_status'
  ) then
    create type public.match_status as enum (
      'UNMATCHED',
      'AUTO_MATCHED',
      'MANUAL_MATCHED',
      'REJECTED',
      'IGNORED'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'budget_impact_type'
  ) then
    create type public.budget_impact_type as enum (
      'INCOME',
      'EXPENSE',
      'INVESTMENT',
      'TRANSFER'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  locale text not null default 'pt-BR',
  base_currency text not null default 'BRL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_not_blank check (btrim(email) <> ''),
  constraint profiles_base_currency_not_blank check (btrim(base_currency) <> '')
);

create table if not exists public.financial_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  pluggy_item_id text,
  pluggy_connector_id text,
  institution_name text not null,
  status public.connection_status not null,
  last_synced_at timestamptz,
  last_sync_requested_at timestamptz,
  last_error_code text,
  last_error_message text,
  consent_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint financial_connections_institution_name_not_blank
    check (btrim(institution_name) <> '')
);

create table if not exists public.financial_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  connection_id uuid not null references public.financial_connections (id) on delete cascade,
  pluggy_account_id text not null unique,
  type public.account_type not null,
  subtype public.account_subtype not null,
  name text not null,
  marketing_name text,
  masked_number text,
  owner_name text,
  currency_code text not null default 'BRL',
  balance_cents bigint,
  credit_limit_cents bigint,
  due_date date,
  close_date date,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint financial_accounts_name_not_blank check (btrim(name) <> ''),
  constraint financial_accounts_currency_code_not_blank check (btrim(currency_code) <> ''),
  constraint financial_accounts_credit_limit_non_negative
    check (credit_limit_cents is null or credit_limit_cents >= 0)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  impact_type public.budget_impact_type not null,
  color text,
  parent_id uuid references public.categories (id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_code_not_blank check (btrim(code) <> ''),
  constraint categories_name_not_blank check (btrim(name) <> '')
);

create table if not exists public.imported_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  connection_id uuid not null references public.financial_connections (id) on delete cascade,
  account_id uuid not null references public.financial_accounts (id) on delete cascade,
  pluggy_transaction_id text not null unique,
  provider_created_at timestamptz,
  provider_updated_at timestamptz,
  posted_at timestamptz not null,
  competency_month text not null,
  description text not null,
  description_raw text,
  amount_cents bigint not null,
  currency_code text not null default 'BRL',
  status public.transaction_status not null,
  direction public.transaction_direction not null,
  pluggy_category_id text,
  pluggy_category_name text,
  merchant_name text,
  merchant_legal_name text,
  merchant_cnpj text,
  internal_category_id uuid references public.categories (id) on delete set null,
  impact_type public.budget_impact_type not null,
  is_internal_transfer boolean not null default false,
  is_hidden_from_budget boolean not null default false,
  note text,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint imported_transactions_competency_month_format
    check (competency_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  constraint imported_transactions_description_not_blank
    check (btrim(description) <> ''),
  constraint imported_transactions_currency_code_not_blank
    check (btrim(currency_code) <> '')
);

create table if not exists public.planning_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  origin public.entry_origin not null default 'MANUAL',
  impact_type public.budget_impact_type not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  expected_account_id uuid references public.financial_accounts (id) on delete set null,
  expected_merchant_hint text,
  recurrence_frequency public.recurrence_frequency not null default 'NONE',
  recurrence_interval integer not null default 1,
  installment_total integer,
  installment_amount_cents bigint,
  start_month text not null,
  end_month text,
  default_amount_cents bigint not null,
  is_mandatory boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planning_templates_title_not_blank check (btrim(title) <> ''),
  constraint planning_templates_start_month_format
    check (start_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  constraint planning_templates_end_month_format
    check (end_month is null or end_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  constraint planning_templates_recurrence_interval_positive check (recurrence_interval > 0),
  constraint planning_templates_default_amount_positive check (default_amount_cents > 0),
  constraint planning_templates_installment_total_positive
    check (installment_total is null or installment_total > 0),
  constraint planning_templates_installment_amount_positive
    check (installment_amount_cents is null or installment_amount_cents > 0),
  constraint planning_templates_installment_fields_together
    check (
      (installment_total is null and installment_amount_cents is null)
      or (installment_total is not null and installment_amount_cents is not null)
    ),
  constraint planning_templates_month_order
    check (end_month is null or end_month >= start_month)
);

create table if not exists public.planned_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid references public.planning_templates (id) on delete set null,
  month text not null,
  title text not null,
  impact_type public.budget_impact_type not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  expected_account_id uuid references public.financial_accounts (id) on delete set null,
  amount_cents bigint not null,
  due_date date,
  status public.planning_status not null default 'PLANNED',
  installment_index integer,
  installment_total integer,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  constraint planned_entries_month_format
    check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  constraint planned_entries_title_not_blank check (btrim(title) <> ''),
  constraint planned_entries_amount_positive check (amount_cents > 0),
  constraint planned_entries_installment_index_positive
    check (installment_index is null or installment_index > 0),
  constraint planned_entries_installment_total_positive
    check (installment_total is null or installment_total > 0),
  constraint planned_entries_installment_pairing
    check (
      (installment_index is null and installment_total is null)
      or (
        installment_index is not null
        and installment_total is not null
        and installment_index <= installment_total
      )
    )
);

create table if not exists public.reconciliation_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  planned_entry_id uuid not null references public.planned_entries (id) on delete cascade,
  imported_transaction_id uuid not null references public.imported_transactions (id) on delete cascade,
  status public.match_status not null,
  matched_by text not null,
  match_score numeric(5,4),
  amount_delta_cents bigint,
  date_delta_days integer,
  rationale jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reconciliation_matches_matched_by_valid
    check (matched_by in ('SYSTEM', 'USER')),
  constraint reconciliation_matches_score_range
    check (match_score is null or (match_score >= 0 and match_score <= 1))
);

create table if not exists public.user_category_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  rule_type text not null,
  rule_value text not null,
  target_category_id uuid not null references public.categories (id) on delete restrict,
  priority integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_category_rules_rule_type_not_blank check (btrim(rule_type) <> ''),
  constraint user_category_rules_rule_value_not_blank check (btrim(rule_value) <> ''),
  constraint user_category_rules_priority_non_negative check (priority >= 0)
);

create table if not exists public.month_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  month text not null,
  planned_income_cents bigint not null default 0,
  actual_income_cents bigint not null default 0,
  planned_expense_cents bigint not null default 0,
  actual_expense_cents bigint not null default 0,
  planned_investment_cents bigint not null default 0,
  actual_investment_cents bigint not null default 0,
  expected_balance_cents bigint not null default 0,
  current_balance_cents bigint not null default 0,
  committed_remaining_cents bigint not null default 0,
  status text not null default 'OPEN',
  snapshot_payload jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint month_snapshots_user_month_unique unique (user_id, month),
  constraint month_snapshots_month_format
    check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  constraint month_snapshots_status_valid
    check (status in ('OPEN', 'CLOSED'))
);

create table if not exists public.sync_events (
  id uuid primary key default gen_random_uuid(),
  event_id text,
  user_id uuid references public.profiles (id) on delete cascade,
  event_type text not null,
  connection_id uuid references public.financial_connections (id) on delete set null,
  account_id uuid references public.financial_accounts (id) on delete set null,
  processing_status text not null,
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint sync_events_event_type_not_blank check (btrim(event_type) <> ''),
  constraint sync_events_processing_status_valid
    check (processing_status in ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED'))
);

create index if not exists idx_financial_connections_user_id
  on public.financial_connections (user_id);

create index if not exists idx_financial_connections_pluggy_item_id
  on public.financial_connections (pluggy_item_id);

create index if not exists idx_financial_accounts_user_id
  on public.financial_accounts (user_id);

create index if not exists idx_financial_accounts_connection_id
  on public.financial_accounts (connection_id);

create index if not exists idx_categories_parent_id
  on public.categories (parent_id);

create index if not exists idx_imported_transactions_user_competency_month
  on public.imported_transactions (user_id, competency_month);

create index if not exists idx_imported_transactions_connection_id
  on public.imported_transactions (connection_id);

create index if not exists idx_imported_transactions_account_id
  on public.imported_transactions (account_id);

create index if not exists idx_imported_transactions_internal_category_id
  on public.imported_transactions (internal_category_id);

create index if not exists idx_planning_templates_user_id
  on public.planning_templates (user_id);

create index if not exists idx_planning_templates_category_id
  on public.planning_templates (category_id);

create index if not exists idx_planned_entries_user_month_status
  on public.planned_entries (user_id, month, status);

create index if not exists idx_planned_entries_template_id
  on public.planned_entries (template_id);

create index if not exists idx_planned_entries_category_id
  on public.planned_entries (category_id);

create index if not exists idx_reconciliation_matches_planned_entry_id
  on public.reconciliation_matches (planned_entry_id);

create index if not exists idx_reconciliation_matches_imported_transaction_id
  on public.reconciliation_matches (imported_transaction_id);

create unique index if not exists ux_reconciliation_matches_active_planned_entry
  on public.reconciliation_matches (planned_entry_id)
  where status in ('AUTO_MATCHED', 'MANUAL_MATCHED');

create unique index if not exists ux_reconciliation_matches_active_imported_transaction
  on public.reconciliation_matches (imported_transaction_id)
  where status in ('AUTO_MATCHED', 'MANUAL_MATCHED');

create index if not exists idx_user_category_rules_user_id_priority
  on public.user_category_rules (user_id, priority);

create index if not exists idx_month_snapshots_user_month
  on public.month_snapshots (user_id, month);

create index if not exists idx_sync_events_user_received_at
  on public.sync_events (user_id, received_at desc);

create index if not exists idx_sync_events_event_id
  on public.sync_events (event_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_financial_connections_updated_at
before update on public.financial_connections
for each row
execute function public.set_updated_at();

create trigger set_financial_accounts_updated_at
before update on public.financial_accounts
for each row
execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create trigger set_imported_transactions_updated_at
before update on public.imported_transactions
for each row
execute function public.set_updated_at();

create trigger set_planning_templates_updated_at
before update on public.planning_templates
for each row
execute function public.set_updated_at();

create trigger set_planned_entries_updated_at
before update on public.planned_entries
for each row
execute function public.set_updated_at();

create trigger set_reconciliation_matches_updated_at
before update on public.reconciliation_matches
for each row
execute function public.set_updated_at();

create trigger set_user_category_rules_updated_at
before update on public.user_category_rules
for each row
execute function public.set_updated_at();

create trigger set_month_snapshots_updated_at
before update on public.month_snapshots
for each row
execute function public.set_updated_at();

commit;
