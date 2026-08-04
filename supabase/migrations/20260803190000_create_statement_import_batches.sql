begin;

create table if not exists public.statement_import_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  bank text not null,
  file_name text not null,
  file_hash text not null,
  invoice_month text,
  status text not null default 'RECEIVED',
  rows_read integer not null default 0,
  rows_imported integer not null default 0,
  rows_duplicated integer not null default 0,
  rows_skipped integer not null default 0,
  rows_failed integer not null default 0,
  matches_created integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint statement_import_batches_bank_valid
    check (bank in ('NUBANK', 'BRADESCO')),
  constraint statement_import_batches_status_valid
    check (status in ('RECEIVED', 'PROCESSED', 'FAILED')),
  constraint statement_import_batches_file_name_not_blank
    check (btrim(file_name) <> ''),
  constraint statement_import_batches_file_hash_not_blank
    check (btrim(file_hash) <> ''),
  constraint statement_import_batches_invoice_month_format
    check (invoice_month is null or invoice_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  constraint statement_import_batches_counts_non_negative
    check (
      rows_read >= 0
      and rows_imported >= 0
      and rows_duplicated >= 0
      and rows_skipped >= 0
      and rows_failed >= 0
      and matches_created >= 0
    )
);

alter table public.imported_transactions
  add column if not exists statement_import_batch_id uuid
    references public.statement_import_batches (id) on delete set null,
  add column if not exists statement_source_bank text,
  add column if not exists statement_source_fingerprint text,
  add column if not exists statement_source_section text,
  add column if not exists statement_installment_index integer,
  add column if not exists statement_installment_total integer,
  add column if not exists statement_import_mode text;

alter table public.imported_transactions
  drop constraint if exists imported_transactions_statement_source_bank_valid,
  add constraint imported_transactions_statement_source_bank_valid
    check (statement_source_bank is null or statement_source_bank in ('NUBANK', 'BRADESCO')),
  drop constraint if exists imported_transactions_statement_source_section_valid,
  add constraint imported_transactions_statement_source_section_valid
    check (statement_source_section is null or statement_source_section in ('CURRENT_INVOICE', 'SCHEDULED')),
  drop constraint if exists imported_transactions_statement_import_mode_valid,
  add constraint imported_transactions_statement_import_mode_valid
    check (statement_import_mode is null or statement_import_mode in ('IMPORT', 'PREVIEW_ONLY', 'SKIP')),
  drop constraint if exists imported_transactions_statement_installment_index_positive,
  add constraint imported_transactions_statement_installment_index_positive
    check (statement_installment_index is null or statement_installment_index > 0),
  drop constraint if exists imported_transactions_statement_installment_total_positive,
  add constraint imported_transactions_statement_installment_total_positive
    check (statement_installment_total is null or statement_installment_total > 0),
  drop constraint if exists imported_transactions_statement_installment_pairing,
  add constraint imported_transactions_statement_installment_pairing
    check (
      (statement_installment_index is null and statement_installment_total is null)
      or (
        statement_installment_index is not null
        and statement_installment_total is not null
        and statement_installment_index <= statement_installment_total
      )
    );

create index if not exists idx_statement_import_batches_user_created
  on public.statement_import_batches (user_id, created_at desc);

create index if not exists idx_imported_transactions_statement_batch
  on public.imported_transactions (statement_import_batch_id);

create unique index if not exists imported_transactions_statement_source_uk
  on public.imported_transactions (user_id, statement_source_bank, statement_source_fingerprint)
  where statement_source_bank is not null
    and statement_source_fingerprint is not null;

drop trigger if exists set_statement_import_batches_updated_at
  on public.statement_import_batches;
create trigger set_statement_import_batches_updated_at
before update on public.statement_import_batches
for each row
execute function public.set_updated_at();

alter table public.statement_import_batches enable row level security;

revoke all on public.statement_import_batches from anon, authenticated;
grant select, insert, update, delete on public.statement_import_batches to authenticated;
grant select, insert, update, delete on public.statement_import_batches to service_role;

drop policy if exists statement_import_batches_owner_access
  on public.statement_import_batches;
create policy statement_import_batches_owner_access
on public.statement_import_batches
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

commit;
