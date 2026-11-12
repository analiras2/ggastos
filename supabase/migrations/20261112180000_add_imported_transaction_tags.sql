-- Tags typed while reviewing an imported card transaction (same "#tag" format as planned entries).
-- Existing rows get an empty list; the table's row level security policies already cover the column.
begin;

alter table public.imported_transactions
  add column if not exists tags text[] not null default '{}';

commit;
