import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

export const missingSupabaseEnv = [
  !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
  !supabasePublishableKey ? 'VITE_SUPABASE_PUBLISHABLE_KEY' : null,
].filter((value): value is string => value !== null);

export const supabase: SupabaseClient | null =
  missingSupabaseEnv.length === 0
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
