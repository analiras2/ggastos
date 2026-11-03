begin;

-- How an entry that was already paid or received outside the card statements was settled.
-- Null for planned entries and for entries confirmed before this column existed.
alter table public.planned_entries
  add column if not exists payment_method text;

alter table public.planned_entries
  drop constraint if exists planned_entries_payment_method_valid,
  drop constraint if exists planned_entries_payment_method_only_when_confirmed;

alter table public.planned_entries
  add constraint planned_entries_payment_method_valid
    check (payment_method is null or payment_method in ('CASH', 'PIX', 'DEBIT_TRANSFER', 'OTHER')),
  -- A planned entry has not been paid yet, so it cannot carry a payment method.
  add constraint planned_entries_payment_method_only_when_confirmed
    check (payment_method is null or manually_confirmed_at is not null);

commit;
