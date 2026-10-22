begin;

create or replace function public.archive_planning_template(p_template_id uuid, p_archive_from_month text)
returns void language plpgsql security invoker set search_path = public as $$
declare v_start_month text; v_end_month text;
begin
  if p_archive_from_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then raise exception 'invalid month format'; end if;
  select start_month into v_start_month from planning_templates where id = p_template_id and user_id = auth.uid() for update;
  if not found then raise exception 'planning template not found'; end if;
  if p_archive_from_month <= v_start_month then
    update planning_templates set is_active = false where id = p_template_id;
  else
    v_end_month := to_char((to_date(p_archive_from_month || '-01', 'YYYY-MM-DD') - interval '1 month'), 'YYYY-MM');
    update planning_templates set end_month = v_end_month where id = p_template_id;
  end if;
  update planned_entries set status = 'CANCELLED', cancelled_at = now()
  where template_id = p_template_id and month >= p_archive_from_month and status = 'PLANNED';
end; $$;

create or replace function public.update_planning_template_future(
  p_template_id uuid, p_title text, p_default_amount_cents bigint, p_effective_month text
) returns void language plpgsql security invoker set search_path = public as $$
begin
  if btrim(p_title) = '' or p_default_amount_cents <= 0 or p_effective_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'invalid planning template update';
  end if;
  update planning_templates set title = btrim(p_title), default_amount_cents = p_default_amount_cents
  where id = p_template_id and user_id = auth.uid();
  if not found then raise exception 'planning template not found'; end if;
  update planned_entries set title = btrim(p_title), amount_cents = p_default_amount_cents
  where template_id = p_template_id and month >= p_effective_month and status = 'PLANNED';
end; $$;

grant execute on function public.archive_planning_template(uuid, text) to authenticated;
grant execute on function public.update_planning_template_future(uuid, text, bigint, text) to authenticated;
commit;
