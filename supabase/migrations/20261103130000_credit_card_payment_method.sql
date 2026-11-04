begin;

-- Credit card is a payment method too, but it is not offered when an entry is created by hand:
-- card purchases arrive through the imported statements, which mark every row with it.
alter table public.planned_entries
  drop constraint if exists planned_entries_payment_method_valid;

alter table public.planned_entries
  add constraint planned_entries_payment_method_valid
    check (payment_method is null or payment_method in ('CASH', 'PIX', 'DEBIT_TRANSFER', 'CREDIT_CARD', 'OTHER'));

alter table public.imported_transactions
  add column if not exists payment_method text;

alter table public.imported_transactions
  drop constraint if exists imported_transactions_payment_method_valid;

alter table public.imported_transactions
  add constraint imported_transactions_payment_method_valid
    check (payment_method is null or payment_method in ('CASH', 'PIX', 'DEBIT_TRANSFER', 'CREDIT_CARD', 'OTHER'));

-- Everything imported so far came from a card statement.
update public.imported_transactions
set payment_method = 'CREDIT_CARD'
where source_provider = 'CARD_STATEMENT'
  and payment_method is null;

commit;
