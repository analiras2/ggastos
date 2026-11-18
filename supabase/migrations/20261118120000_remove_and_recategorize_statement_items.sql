begin;

-- Whether a statement description is covered by a DESCRIPTION_CONTAINS rule value. Same meaning as
-- the check made at import time (resolveStatementCategory in the Edge Function): the description,
-- folded for case, accents and spaces, contains the normalized rule value.
create or replace function public.statement_description_matches(p_description text, p_rule_value text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select public.normalize_rule_value(p_rule_value) <> ''
    and strpos(
      public.normalize_category_name(p_description),
      public.normalize_rule_value(p_rule_value)
    ) > 0;
$$;

-- Removes one imported statement row from the app without deleting it: it keeps its deleted_at, so
-- importing the same file again does not bring it back (the upsert never writes deleted_at).
-- An active reconciliation with a planned entry is released first, like "undo" does.
-- security invoker keeps RLS in force, so another user's row is never touched.
create or replace function public.remove_imported_transaction(p_transaction_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  update public.imported_transactions
  set deleted_at = now()
  where id = p_transaction_id
    and user_id = v_user_id
    and deleted_at is null;

  if not found then
    raise exception 'Imported transaction not found.' using errcode = 'P0002';
  end if;

  update public.reconciliation_matches
  set status = 'UNMATCHED'
  where imported_transaction_id = p_transaction_id
    and user_id = v_user_id
    and status in ('AUTO_MATCHED', 'MANUAL_MATCHED');
end;
$$;

-- Brings a removed row back. The matches released on removal are not restored.
create or replace function public.restore_imported_transaction(p_transaction_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  update public.imported_transactions
  set deleted_at = null
  where id = p_transaction_id
    and user_id = v_user_id
    and deleted_at is not null;

  if not found then
    raise exception 'Removed imported transaction not found.' using errcode = 'P0002';
  end if;
end;
$$;

-- How many of the user's statement rows a rule value would reach, to tell the user before saving.
create or replace function public.count_similar_imported_transactions(p_rule_value text)
returns integer
language sql
stable
security invoker
set search_path = ''
as $$
  select count(*)::integer
  from public.imported_transactions
  where user_id = auth.uid()
    and deleted_at is null
    and is_hidden_from_budget = false
    and public.statement_description_matches(description, p_rule_value);
$$;

-- Moves every row of the same merchant to a category and keeps that choice for the next statements
-- by upserting one DESCRIPTION_CONTAINS rule. Rows already in the category are left as they are.
--   * only rows of the same entry type as the chosen one are changed;
--   * the chosen row is always included, even if its description does not match the rule value;
--   * security invoker keeps RLS in force; any invalid input raises and the call rolls back.
create or replace function public.recategorize_similar_imported_transactions(
  p_transaction_id uuid,
  p_category_id uuid,
  p_rule_value text
)
returns table (updated_count integer, rules_upserted integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  c_min_rule_value_length constant integer := 3;
  v_user_id uuid := auth.uid();
  v_impact_type public.budget_impact_type;
  v_rule_value text := public.normalize_rule_value(p_rule_value);
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  if length(v_rule_value) < c_min_rule_value_length then
    raise exception 'Rule value must have at least % characters after normalization.',
      c_min_rule_value_length using errcode = '22023';
  end if;

  select impact_type
  into v_impact_type
  from public.imported_transactions
  where id = p_transaction_id
    and user_id = v_user_id
    and deleted_at is null;

  if not found then
    raise exception 'Imported transaction not found.' using errcode = 'P0002';
  end if;

  perform 1
  from public.categories
  where id = p_category_id
    and is_active
    and impact_type = v_impact_type
    and (user_id is null or user_id = v_user_id);

  if not found then
    raise exception 'The category must be an active category of the same type, available to you.'
      using errcode = '22023';
  end if;

  update public.imported_transactions
  set internal_category_id = p_category_id
  where user_id = v_user_id
    and deleted_at is null
    and is_hidden_from_budget = false
    and impact_type = v_impact_type
    and internal_category_id is distinct from p_category_id
    and (id = p_transaction_id or public.statement_description_matches(description, v_rule_value));

  get diagnostics updated_count = row_count;

  insert into public.user_category_rules (user_id, rule_type, rule_value, target_category_id, priority, is_active)
  values (v_user_id, 'DESCRIPTION_CONTAINS', v_rule_value, p_category_id, 0, true)
  on conflict (user_id, rule_type, (public.normalize_rule_value(rule_value))) where is_active
  do update set target_category_id = excluded.target_category_id;

  get diagnostics rules_upserted = row_count;

  return next;
end;
$$;

revoke all on function public.statement_description_matches(text, text) from public, anon;
revoke all on function public.remove_imported_transaction(uuid) from public, anon;
revoke all on function public.restore_imported_transaction(uuid) from public, anon;
revoke all on function public.count_similar_imported_transactions(text) from public, anon;
revoke all on function public.recategorize_similar_imported_transactions(uuid, uuid, text) from public, anon;
grant execute on function public.statement_description_matches(text, text) to authenticated;
grant execute on function public.remove_imported_transaction(uuid) to authenticated;
grant execute on function public.restore_imported_transaction(uuid) to authenticated;
grant execute on function public.count_similar_imported_transactions(text) to authenticated;
grant execute on function public.recategorize_similar_imported_transactions(uuid, uuid, text) to authenticated;

commit;
