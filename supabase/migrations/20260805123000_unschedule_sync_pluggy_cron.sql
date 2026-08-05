begin;

do $$
begin
  perform cron.unschedule(jobid)
  from cron.job
  where jobname = 'sync-pluggy-every-12-hours'
    or command ilike '%/functions/v1/sync-pluggy%';
exception
  when undefined_schema or undefined_table or undefined_function then
    null;
end $$;

commit;
