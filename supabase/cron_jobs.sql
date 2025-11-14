-- ============================================================================
-- CRON JOBS CONFIGURATION
-- ============================================================================
-- This file sets up scheduled tasks for the wishlist application.
-- 
-- Prerequisites:
-- - pg_cron extension
-- - pg_net extension
-- - All schema files must be applied first
-- ============================================================================


-- ============================================================================
-- CONFIGURATION SETTINGS
-- ============================================================================
-- Development environment variables, 
-- for prod you would do that via the Supabase dashboard

-- Store API URL
SELECT vault.create_secret(
  'http://host.docker.internal:54321',
  'api_url',
  'API URL for Edge Functions'
);

-- Store Service Role Key
SELECT vault.create_secret(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  'service_role_key',
  'Service role key for authentication'
);

-- ============================================================================
-- SCHEDULED JOBS
-- ============================================================================

-- Job 1: Cleanup expired reservations every 30 minutes
-- This updates the reservation status from 'reserved' to 'cancelled' when expired
SELECT cron.schedule(
  'cleanup-expired-reservations',
  '*/30 * * * *',  -- Every 30 minutes
  $$SELECT cancel_expired_reservations();$$
);

-- Job 2: Send reminder emails every hour
-- This invokes the Edge Function to send reminder emails for reservations expiring in ~12 hours
SELECT cron.schedule(
  'send-reservation-reminder',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'api_url') || '/functions/v1/send-reservation-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- ============================================================================
-- UTILITY QUERIES
-- ============================================================================

-- View all scheduled cron jobs:
-- SELECT * FROM cron.job;

-- View recent cron job execution history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- View failed cron jobs:
-- SELECT * FROM cron.job_run_details WHERE status = 'failed' ORDER BY start_time DESC;

-- Manually trigger cleanup:
-- SELECT cancel_expired_reservations();

-- Unschedule a job (if needed):
-- SELECT cron.unschedule('send-reservation-reminder');
-- SELECT cron.unschedule('cleanup-expired-reservations');

-- ============================================================================
-- PRODUCTION SETUP
-- ============================================================================
-- Use Supabase Vault (more secure)
-- See: https://supabase.com/docs/guides/database/vault


