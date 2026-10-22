begin;

create unique index if not exists planned_entries_recurring_occurrence_uk
on public.planned_entries (template_id, month)
where template_id is not null and installment_index is null;

create unique index if not exists planned_entries_installment_occurrence_uk
on public.planned_entries (template_id, installment_index)
where template_id is not null and installment_index is not null;

commit;
