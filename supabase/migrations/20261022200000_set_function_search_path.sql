begin;

-- Pin search_path so these functions cannot resolve objects from a caller-controlled schema.
-- Bodies only use pg_catalog functions or schema-qualified public.* tables, so an empty path is safe.
alter function public.months_between(text, text) set search_path = '';
alter function public.normalize_category_name(text) set search_path = '';
alter function public.set_updated_at() set search_path = '';
alter function public.ensure_active_category() set search_path = '';
alter function public.deactivate_rules_for_hidden_category() set search_path = '';

commit;
