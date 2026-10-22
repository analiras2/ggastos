begin;

alter table public.financial_connections
  add column if not exists source_provider text,
  add column if not exists source_connection_id text;

alter table public.financial_accounts
  add column if not exists source_provider text,
  add column if not exists source_account_id text;

alter table public.imported_transactions
  add column if not exists source_provider text,
  add column if not exists source_transaction_id text;

update public.financial_connections
set
  source_provider = case
    when pluggy_item_id like 'statement:%' then 'CARD_STATEMENT'
    when pluggy_item_id is not null then 'PLUGGY'
    else 'LEGACY'
  end,
  source_connection_id = case
    when pluggy_item_id like 'statement:%' then upper(split_part(pluggy_item_id, ':', 2))
    else coalesce(pluggy_item_id, id::text)
  end
where source_provider is null or source_connection_id is null;

update public.financial_accounts
set
  source_provider = case
    when pluggy_account_id like 'statement:%' then 'CARD_STATEMENT'
    else 'PLUGGY'
  end,
  source_account_id = case
    when pluggy_account_id like 'statement:%' then upper(split_part(pluggy_account_id, ':', 2)) || ':CREDIT_CARD'
    else pluggy_account_id
  end
where source_provider is null or source_account_id is null;

update public.imported_transactions
set
  source_provider = case
    when statement_source_bank is not null or pluggy_transaction_id like 'statement:%' then 'CARD_STATEMENT'
    else 'PLUGGY'
  end,
  source_transaction_id = case
    when pluggy_transaction_id like 'statement:%' then
      upper(split_part(pluggy_transaction_id, ':', 2)) || ':' || split_part(pluggy_transaction_id, ':', 3)
    else pluggy_transaction_id
  end
where source_provider is null or source_transaction_id is null;

alter table public.financial_connections
  alter column source_provider set not null,
  alter column source_connection_id set not null,
  drop constraint if exists financial_connections_source_provider_valid,
  add constraint financial_connections_source_provider_valid
    check (source_provider in ('PLUGGY', 'CARD_STATEMENT', 'LEGACY'));

alter table public.financial_accounts
  alter column source_provider set not null,
  alter column source_account_id set not null,
  alter column pluggy_account_id drop not null,
  drop constraint if exists financial_accounts_source_provider_valid,
  add constraint financial_accounts_source_provider_valid
    check (source_provider in ('PLUGGY', 'CARD_STATEMENT', 'LEGACY'));

alter table public.imported_transactions
  alter column source_provider set not null,
  alter column source_transaction_id set not null,
  alter column pluggy_transaction_id drop not null,
  drop constraint if exists imported_transactions_source_provider_valid,
  add constraint imported_transactions_source_provider_valid
    check (source_provider in ('PLUGGY', 'CARD_STATEMENT', 'LEGACY'));

alter table public.financial_accounts
  drop constraint if exists financial_accounts_pluggy_account_id_key;

alter table public.imported_transactions
  drop constraint if exists imported_transactions_pluggy_transaction_id_key;

drop index if exists public.financial_connections_pluggy_item_id_uk;

create unique index if not exists financial_connections_source_identity_uk
  on public.financial_connections (user_id, source_provider, source_connection_id);

create unique index if not exists financial_accounts_source_identity_uk
  on public.financial_accounts (user_id, source_provider, source_account_id);

create unique index if not exists imported_transactions_source_identity_uk
  on public.imported_transactions (user_id, source_provider, source_transaction_id);

create index if not exists idx_imported_transactions_source_identity
  on public.imported_transactions (source_provider, source_transaction_id);

commit;
