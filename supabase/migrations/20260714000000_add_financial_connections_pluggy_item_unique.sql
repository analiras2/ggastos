begin;

create unique index if not exists financial_connections_pluggy_item_id_uk
on public.financial_connections (pluggy_item_id);

commit;
