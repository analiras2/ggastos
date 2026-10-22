begin;

update public.categories
set is_active = false
where user_id is null
  and parent_id is not null;

commit;
