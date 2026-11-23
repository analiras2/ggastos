-- Mercado Pago card statements (PDF) join Nubank and Bradesco as supported sources.
alter table public.statement_import_batches
  drop constraint if exists statement_import_batches_bank_valid,
  add constraint statement_import_batches_bank_valid
    check (bank in ('NUBANK', 'BRADESCO', 'MERCADO_PAGO'));

alter table public.imported_transactions
  drop constraint if exists imported_transactions_statement_source_bank_valid,
  add constraint imported_transactions_statement_source_bank_valid
    check (statement_source_bank is null or statement_source_bank in ('NUBANK', 'BRADESCO', 'MERCADO_PAGO'));
