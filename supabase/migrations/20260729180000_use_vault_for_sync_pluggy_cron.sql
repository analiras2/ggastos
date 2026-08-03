begin;

-- AD-023 assumed Supabase Cloud pre-populates app.settings.supabase_url/
-- service_role_key automatically. In practice, ALTER DATABASE ... SET is not
-- permitted through the Management API/CLI role used to provision a project,
-- so those settings were never actually set on Cloud either. Vault secrets
-- can be created through that same role (vault.create_secret), so the cron
-- job now reads from there, falling back to the old app.settings.* GUCs for
-- any environment that already configured it that way (e.g. local dev
-- following the original AD-023 instructions).
--
-- Setup (any environment, via `supabase db query --linked`/`--local`):
--   select vault.create_secret('<project supabase url>', 'sync_pluggy_supabase_url');
--   select vault.create_secret('<service role key>', 'sync_pluggy_service_role_key');

select cron.unschedule('sync-pluggy-every-12-hours');

select cron.schedule(
  'sync-pluggy-every-12-hours',
  '0 */12 * * *',
  $$
  select net.http_post(
    url := coalesce(
      (select decrypted_secret from vault.decrypted_secrets where name = 'sync_pluggy_supabase_url'),
      current_setting('app.settings.supabase_url', true)
    ) || '/functions/v1/sync-pluggy',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', coalesce(
        (select decrypted_secret from vault.decrypted_secrets where name = 'sync_pluggy_service_role_key'),
        current_setting('app.settings.service_role_key', true)
      ),
      'Authorization', 'Bearer ' || coalesce(
        (select decrypted_secret from vault.decrypted_secrets where name = 'sync_pluggy_service_role_key'),
        current_setting('app.settings.service_role_key', true)
      )
    ),
    body := jsonb_build_object('mode', 'scheduled')
  );
  $$
);

commit;
