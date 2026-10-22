begin;

alter table public.planned_entries
  add column if not exists tags text[] not null default '{}',
  add column if not exists is_title_manual boolean not null default true;

alter table public.planned_entries
  alter column title drop not null;

alter table public.planned_entries
  drop constraint if exists planned_entries_title_not_blank;

commit;
