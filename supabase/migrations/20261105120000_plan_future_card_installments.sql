begin;

-- Future installments found on a card statement become planned entries, so the next
-- months already show what is coming. Each generated entry carries a stable
-- source_key, which makes the generation idempotent and keeps a cancelled entry cancelled.
alter table public.planned_entries
  add column if not exists source_key text,
  add column if not exists source_batch_id uuid
    references public.statement_import_batches (id) on delete set null;

create unique index if not exists planned_entries_user_source_key_uk
  on public.planned_entries (user_id, source_key)
  where source_key is not null;

create index if not exists idx_planned_entries_source_batch_id
  on public.planned_entries (source_batch_id)
  where source_batch_id is not null;

-- Description without the installment suffix ("Loja - Parcela 2/5" -> "loja").
create or replace function public.statement_merchant_text(p_description text)
returns text
language sql
immutable
set search_path = public
as $$
  select btrim(lower(regexp_replace(
    p_description,
    '\s*-?\s*(parcela\s+)?[0-9]{1,2}/[0-9]{1,2}\s*$',
    '',
    'i'
  )));
$$;

create or replace function public.shift_month_key(p_month text, p_offset integer)
returns text
language sql
immutable
set search_path = public
as $$
  select to_char(to_date(p_month || '-01', 'YYYY-MM-DD') + make_interval(months => p_offset), 'YYYY-MM');
$$;

-- Creates the planned entries for the installments that come after each installment
-- found on the user's statements. Pass a batch to limit it to one import. Returns how
-- many entries were created. Safe to run again: existing entries are never touched.
create or replace function public.plan_future_installments(p_user_id uuid, p_batch_id uuid default null)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_general_category_id uuid;
  v_created integer;
begin
  select id into v_general_category_id
  from public.categories
  where code = 'expense' and user_id is null
  limit 1;

  with sources as (
    select
      t.user_id,
      t.account_id,
      t.statement_import_batch_id,
      t.statement_source_bank,
      t.impact_type,
      t.statement_installment_index as paid_index,
      t.statement_installment_total as total,
      abs(t.amount_cents) as amount_cents,
      t.competency_month,
      t.description,
      public.statement_merchant_text(t.description) as merchant_text,
      coalesce(t.internal_category_id, v_general_category_id) as category_id
    from public.imported_transactions t
    where t.user_id = p_user_id
      and t.source_provider = 'CARD_STATEMENT'
      and t.deleted_at is null
      and t.direction = 'DEBIT'
      and t.statement_import_mode = 'IMPORT'
      and t.statement_installment_index is not null
      and t.statement_installment_total > t.statement_installment_index
      and abs(t.amount_cents) > 0
      and (p_batch_id is null or t.statement_import_batch_id = p_batch_id)
  ),
  expanded as (
    select
      s.*,
      k as installment_index,
      public.shift_month_key(s.competency_month, k - s.paid_index) as target_month,
      public.shift_month_key(s.competency_month, 1 - s.paid_index) as purchase_month
    from sources s
    cross join lateral generate_series(s.paid_index + 1, s.total) as k
    where s.category_id is not null
  ),
  inserted as (
    insert into public.planned_entries (
      user_id, month, title, impact_type, category_id, expected_account_id,
      amount_cents, status, installment_index, installment_total,
      payment_method, is_title_manual, source_key, source_batch_id
    )
    select distinct on (e.user_id, key.value)
      e.user_id,
      e.target_month,
      coalesce(nullif(btrim(regexp_replace(e.description, '\s*-?\s*(parcela\s+)?[0-9]{1,2}/[0-9]{1,2}\s*$', '', 'i')), ''), e.description),
      e.impact_type,
      e.category_id,
      e.account_id,
      e.amount_cents,
      'PLANNED',
      e.installment_index,
      e.total,
      'CREDIT_CARD',
      false,
      key.value,
      e.statement_import_batch_id
    from expanded e
    cross join lateral (
      select format(
        'card-installment:%s:%s:%s:%s:%s:%s',
        coalesce(e.statement_source_bank, ''),
        md5(e.merchant_text),
        e.total,
        e.amount_cents,
        e.purchase_month,
        e.installment_index
      ) as value
    ) key
    where not exists (
      -- That month's own statement was already imported: the real row exists.
      select 1
      from public.imported_transactions real_row
      where real_row.user_id = e.user_id
        and real_row.source_provider = 'CARD_STATEMENT'
        and real_row.deleted_at is null
        and real_row.competency_month = e.target_month
        and real_row.statement_installment_index = e.installment_index
        and real_row.statement_installment_total = e.total
        and abs(real_row.amount_cents) = e.amount_cents
        and public.statement_merchant_text(real_row.description) = e.merchant_text
    )
    order by e.user_id, key.value
    on conflict (user_id, source_key) where source_key is not null do nothing
    returning 1
  )
  select count(*) into v_created from inserted;

  return v_created;
end;
$$;

revoke all on function public.plan_future_installments(uuid, uuid) from public, anon, authenticated;
grant execute on function public.plan_future_installments(uuid, uuid) to service_role;

-- Deleting an import also removes the installments it planned, as long as they are still
-- planned. Anything reconciled, confirmed or cancelled stays.
create or replace function public.delete_planned_installments_of_batch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.planned_entries
  where source_batch_id = old.id
    and status = 'PLANNED'
    and manually_confirmed_at is null;
  return old;
end;
$$;

drop trigger if exists delete_planned_installments_before_batch_delete on public.statement_import_batches;
create trigger delete_planned_installments_before_batch_delete
before delete on public.statement_import_batches
for each row
execute function public.delete_planned_installments_of_batch();

-- One-time backfill for statements imported before this existed.
do $$
declare
  v_user uuid;
begin
  for v_user in
    select distinct user_id
    from public.imported_transactions
    where source_provider = 'CARD_STATEMENT'
      and statement_installment_index is not null
  loop
    perform public.plan_future_installments(v_user);
  end loop;
end;
$$;

commit;
