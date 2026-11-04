begin;

-- Canonical form of a category rule value. Must stay in sync with normalizeMerchantText in
-- supabase/functions/_shared/statements/merchant-key.ts (parity is covered by
-- supabase/tests/bulk-categorization-suite.mjs): folds case and accents, drops the trailing
-- installment suffix and the payment intermediary prefix.
create or replace function public.normalize_rule_value(p_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      regexp_replace(
        translate(public.normalize_category_name(p_value), 'ñ', 'n'),
        '(\s*-\s*)?(parcela\s+)?(?<![\d/])\d{1,2}/\d{1,2}$',
        ''
      ),
      '^(mp|ifd|picpay|pag)\s*\*\s*',
      ''
    )
  );
$$;

-- Rules that normalize to nothing never matched anything; stop them from holding the index.
update public.user_category_rules
set is_active = false
where is_active and public.normalize_rule_value(rule_value) = '';

-- Equivalent active rules (same user, type and normalized value): keep the one that already wins at
-- runtime (lowest priority, then newest) and deactivate the others. Nothing is deleted.
with ranked as (
  select
    id,
    row_number() over (
      partition by user_id, rule_type, public.normalize_rule_value(rule_value)
      order by priority asc, created_at desc, id
    ) as position
  from public.user_category_rules
  where is_active
)
update public.user_category_rules as rule
set is_active = false
from ranked
where rule.id = ranked.id and ranked.position > 1;

-- Store every rule in canonical form so one purchase maps to one rule across installments.
update public.user_category_rules
set rule_value = public.normalize_rule_value(rule_value)
where public.normalize_rule_value(rule_value) <> ''
  and rule_value <> public.normalize_rule_value(rule_value);

create unique index if not exists user_category_rules_active_value_key
  on public.user_category_rules (user_id, rule_type, public.normalize_rule_value(rule_value))
  where is_active;

-- Categorizes a batch of pending imported transactions for the signed-in user in one transaction,
-- optionally creating one DESCRIPTION_CONTAINS rule per merchant key.
--   * only rows that are still uncategorized and not hidden from the budget are updated;
--   * security invoker keeps RLS in force, so foreign rows are never touched;
--   * any invalid input raises, and the whole call rolls back.
create or replace function public.categorize_imported_transactions(
  p_transaction_ids uuid[],
  p_category_id uuid,
  p_rule_values text[] default '{}'
)
returns table (updated_count integer, skipped_count integer, rules_upserted integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  c_max_transaction_ids constant integer := 500;
  c_min_rule_value_length constant integer := 3;
  v_user_id uuid := auth.uid();
  v_transaction_ids uuid[];
  v_rule_values text[];
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  select coalesce(array_agg(distinct transaction_id), '{}')
  into v_transaction_ids
  from unnest(coalesce(p_transaction_ids, '{}')) as transaction_id;

  if cardinality(v_transaction_ids) = 0 then
    raise exception 'At least one transaction is required.' using errcode = '22023';
  end if;

  if cardinality(v_transaction_ids) > c_max_transaction_ids then
    raise exception 'At most % transactions can be categorized per call.', c_max_transaction_ids
      using errcode = '22023';
  end if;

  perform 1
  from public.categories
  where id = p_category_id
    and is_active
    and impact_type = 'EXPENSE'
    and (user_id is null or user_id = v_user_id);

  if not found then
    raise exception 'The category must be an active expense category available to you.'
      using errcode = '22023';
  end if;

  select coalesce(array_agg(distinct normalized_value), '{}')
  into v_rule_values
  from (
    select public.normalize_rule_value(rule_value) as normalized_value
    from unnest(coalesce(p_rule_values, '{}')) as rule_value
  ) as normalized;

  if exists (
    select 1 from unnest(v_rule_values) as rule_value where length(rule_value) < c_min_rule_value_length
  ) then
    raise exception 'Rule values must have at least % characters after normalization.',
      c_min_rule_value_length using errcode = '22023';
  end if;

  update public.imported_transactions
  set internal_category_id = p_category_id
  where id = any (v_transaction_ids)
    and user_id = v_user_id
    and internal_category_id is null
    and is_hidden_from_budget = false;

  get diagnostics updated_count = row_count;
  skipped_count := cardinality(v_transaction_ids) - updated_count;

  insert into public.user_category_rules (user_id, rule_type, rule_value, target_category_id, priority, is_active)
  select v_user_id, 'DESCRIPTION_CONTAINS', rule_value, p_category_id, 0, true
  from unnest(v_rule_values) as rule_value
  on conflict (user_id, rule_type, (public.normalize_rule_value(rule_value))) where is_active
  do update set target_category_id = excluded.target_category_id;

  get diagnostics rules_upserted = row_count;

  return next;
end;
$$;

revoke all on function public.categorize_imported_transactions(uuid[], uuid, text[]) from public, anon;
grant execute on function public.categorize_imported_transactions(uuid[], uuid, text[]) to authenticated;

commit;
