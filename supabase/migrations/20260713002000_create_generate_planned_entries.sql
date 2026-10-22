begin;

create or replace function public.months_between(p_start text, p_end text)
returns integer
language sql
immutable
as $$
  select (
    (
      extract(year from to_date(p_end || '-01', 'YYYY-MM-DD'))
      - extract(year from to_date(p_start || '-01', 'YYYY-MM-DD'))
    ) * 12
    + (
      extract(month from to_date(p_end || '-01', 'YYYY-MM-DD'))
      - extract(month from to_date(p_start || '-01', 'YYYY-MM-DD'))
    )
  )::integer;
$$;

create or replace function public.generate_planned_entries(p_month text)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_template record;
  v_diff integer;
  v_installment_index integer;
  v_generated integer := 0;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'invalid month format: %', p_month;
  end if;

  for v_template in
    select *
    from public.planning_templates
    where user_id = v_user_id
      and is_active = true
      and start_month <= p_month
      and (end_month is null or end_month >= p_month)
  loop
    v_diff := public.months_between(v_template.start_month, p_month);

    if v_template.recurrence_frequency = 'MONTHLY' then
      if v_diff >= 0 and v_diff % v_template.recurrence_interval = 0 then
        insert into public.planned_entries (
          user_id, template_id, month, title, impact_type, category_id,
          expected_account_id, amount_cents, status
        )
        values (
          v_user_id, v_template.id, p_month, v_template.title, v_template.impact_type,
          v_template.category_id, v_template.expected_account_id, v_template.default_amount_cents, 'PLANNED'
        )
        on conflict (template_id, month) where template_id is not null and installment_index is null
        do nothing;

        if found then
          v_generated := v_generated + 1;
        end if;
      end if;

    elsif v_template.recurrence_frequency = 'YEARLY' then
      if v_diff >= 0 and v_diff % 12 = 0 and (v_diff / 12) % v_template.recurrence_interval = 0 then
        insert into public.planned_entries (
          user_id, template_id, month, title, impact_type, category_id,
          expected_account_id, amount_cents, status
        )
        values (
          v_user_id, v_template.id, p_month, v_template.title, v_template.impact_type,
          v_template.category_id, v_template.expected_account_id, v_template.default_amount_cents, 'PLANNED'
        )
        on conflict (template_id, month) where template_id is not null and installment_index is null
        do nothing;

        if found then
          v_generated := v_generated + 1;
        end if;
      end if;

    elsif v_template.recurrence_frequency = 'NONE' and v_template.installment_total is not null then
      if v_diff >= 0 and v_diff < v_template.installment_total then
        v_installment_index := v_diff + 1;

        insert into public.planned_entries (
          user_id, template_id, month, title, impact_type, category_id,
          expected_account_id, amount_cents, status, installment_index, installment_total
        )
        values (
          v_user_id, v_template.id, p_month, v_template.title, v_template.impact_type,
          v_template.category_id, v_template.expected_account_id, v_template.installment_amount_cents, 'PLANNED',
          v_installment_index, v_template.installment_total
        )
        on conflict (template_id, installment_index)
          where template_id is not null and installment_index is not null
        do nothing;

        if found then
          v_generated := v_generated + 1;
        end if;
      end if;
    end if;
  end loop;

  return v_generated;
end;
$$;

grant execute on function public.generate_planned_entries(text) to authenticated;

commit;
