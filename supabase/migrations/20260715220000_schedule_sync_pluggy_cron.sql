begin;

create extension if not exists pg_cron;

-- Idempotent re-schedule: `db reset` re-runs this migration from scratch, and
-- cron.schedule() by name does not reliably upsert across pg_cron versions.
select cron.unschedule(jobid)
from cron.job
where jobname = 'sync-pluggy-every-12-hours';

-- Requires `app.settings.supabase_url` and `app.settings.service_role_key` to
-- be set on the database (Supabase Cloud sets these automatically; for local/
-- self-hosted environments run, once, as a superuser:
--   alter database postgres set app.settings.supabase_url to 'http://127.0.0.1:54321';
--   alter database postgres set app.settings.service_role_key to '<service_role_key>';
-- and reconnect). Until configured, the job is scheduled but each run will
-- fail to resolve a URL and post nothing (visible in net._http_response).
select cron.schedule(
  'sync-pluggy-every-12-hours',
  '0 */12 * * *',
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/sync-pluggy',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', current_setting('app.settings.service_role_key', true),
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('mode', 'scheduled')
  ) as request_id;
  $$
);

commit;
