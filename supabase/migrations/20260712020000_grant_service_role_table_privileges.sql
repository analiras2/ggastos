begin;

grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.financial_connections to service_role;
grant select, insert, update, delete on public.financial_accounts to service_role;
grant select, insert, update, delete on public.categories to service_role;
grant select, insert, update, delete on public.imported_transactions to service_role;
grant select, insert, update, delete on public.planning_templates to service_role;
grant select, insert, update, delete on public.planned_entries to service_role;
grant select, insert, update, delete on public.reconciliation_matches to service_role;
grant select, insert, update, delete on public.user_category_rules to service_role;
grant select, insert, update, delete on public.month_snapshots to service_role;
grant select, insert, update, delete on public.sync_events to service_role;

commit;
