import { missingSupabaseEnv, supabase } from '@/shared/lib/supabase/client';

// The configured client, or a clear error when the env vars are missing.
export function requireSupabase() {
  if (!supabase) {
    throw new Error(`Missing env vars: ${missingSupabaseEnv.join(', ')}`);
  }
  return supabase;
}
