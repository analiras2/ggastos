begin;

alter table public.profiles enable row level security;
alter table public.financial_connections enable row level security;
alter table public.financial_accounts enable row level security;
alter table public.categories enable row level security;
alter table public.imported_transactions enable row level security;
alter table public.planning_templates enable row level security;
alter table public.planned_entries enable row level security;
alter table public.reconciliation_matches enable row level security;
alter table public.user_category_rules enable row level security;
alter table public.month_snapshots enable row level security;
alter table public.sync_events enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.financial_connections from anon, authenticated;
revoke all on public.financial_accounts from anon, authenticated;
revoke all on public.categories from anon, authenticated;
revoke all on public.imported_transactions from anon, authenticated;
revoke all on public.planning_templates from anon, authenticated;
revoke all on public.planned_entries from anon, authenticated;
revoke all on public.reconciliation_matches from anon, authenticated;
revoke all on public.user_category_rules from anon, authenticated;
revoke all on public.month_snapshots from anon, authenticated;
revoke all on public.sync_events from anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.financial_connections to authenticated;
grant select, insert, update, delete on public.financial_accounts to authenticated;
grant select on public.categories to authenticated;
grant select, insert, update, delete on public.imported_transactions to authenticated;
grant select, insert, update, delete on public.planning_templates to authenticated;
grant select, insert, update, delete on public.planned_entries to authenticated;
grant select, insert, update, delete on public.reconciliation_matches to authenticated;
grant select, insert, update, delete on public.user_category_rules to authenticated;
grant select, insert, update, delete on public.month_snapshots to authenticated;
grant select on public.sync_events to authenticated;

drop policy if exists profiles_owner_access on public.profiles;
create policy profiles_owner_access
on public.profiles
for all
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists financial_connections_owner_access on public.financial_connections;
create policy financial_connections_owner_access
on public.financial_connections
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists financial_accounts_owner_access on public.financial_accounts;
create policy financial_accounts_owner_access
on public.financial_accounts
for all
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.financial_connections as financial_connection
    where financial_connection.id = connection_id
      and financial_connection.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.financial_connections as financial_connection
    where financial_connection.id = connection_id
      and financial_connection.user_id = auth.uid()
  )
);

drop policy if exists categories_authenticated_read on public.categories;
create policy categories_authenticated_read
on public.categories
for select
to authenticated
using (true);

drop policy if exists imported_transactions_owner_access on public.imported_transactions;
create policy imported_transactions_owner_access
on public.imported_transactions
for all
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.financial_connections as financial_connection
    where financial_connection.id = connection_id
      and financial_connection.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.financial_accounts as financial_account
    where financial_account.id = account_id
      and financial_account.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.financial_connections as financial_connection
    where financial_connection.id = connection_id
      and financial_connection.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.financial_accounts as financial_account
    where financial_account.id = account_id
      and financial_account.user_id = auth.uid()
  )
);

drop policy if exists planning_templates_owner_access on public.planning_templates;
create policy planning_templates_owner_access
on public.planning_templates
for all
to authenticated
using (
  user_id = auth.uid()
  and (
    expected_account_id is null
    or exists (
      select 1
      from public.financial_accounts as financial_account
      where financial_account.id = expected_account_id
        and financial_account.user_id = auth.uid()
    )
  )
)
with check (
  user_id = auth.uid()
  and (
    expected_account_id is null
    or exists (
      select 1
      from public.financial_accounts as financial_account
      where financial_account.id = expected_account_id
        and financial_account.user_id = auth.uid()
    )
  )
);

drop policy if exists planned_entries_owner_access on public.planned_entries;
create policy planned_entries_owner_access
on public.planned_entries
for all
to authenticated
using (
  user_id = auth.uid()
  and (
    template_id is null
    or exists (
      select 1
      from public.planning_templates as planning_template
      where planning_template.id = template_id
        and planning_template.user_id = auth.uid()
    )
  )
  and (
    expected_account_id is null
    or exists (
      select 1
      from public.financial_accounts as financial_account
      where financial_account.id = expected_account_id
        and financial_account.user_id = auth.uid()
    )
  )
)
with check (
  user_id = auth.uid()
  and (
    template_id is null
    or exists (
      select 1
      from public.planning_templates as planning_template
      where planning_template.id = template_id
        and planning_template.user_id = auth.uid()
    )
  )
  and (
    expected_account_id is null
    or exists (
      select 1
      from public.financial_accounts as financial_account
      where financial_account.id = expected_account_id
        and financial_account.user_id = auth.uid()
    )
  )
);

drop policy if exists reconciliation_matches_owner_access on public.reconciliation_matches;
create policy reconciliation_matches_owner_access
on public.reconciliation_matches
for all
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.planned_entries as planned_entry
    where planned_entry.id = planned_entry_id
      and planned_entry.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.imported_transactions as imported_transaction
    where imported_transaction.id = imported_transaction_id
      and imported_transaction.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.planned_entries as planned_entry
    where planned_entry.id = planned_entry_id
      and planned_entry.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.imported_transactions as imported_transaction
    where imported_transaction.id = imported_transaction_id
      and imported_transaction.user_id = auth.uid()
  )
);

drop policy if exists user_category_rules_owner_access on public.user_category_rules;
create policy user_category_rules_owner_access
on public.user_category_rules
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists month_snapshots_owner_access on public.month_snapshots;
create policy month_snapshots_owner_access
on public.month_snapshots
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists sync_events_owner_read on public.sync_events;
create policy sync_events_owner_read
on public.sync_events
for select
to authenticated
using (user_id = auth.uid());

commit;
