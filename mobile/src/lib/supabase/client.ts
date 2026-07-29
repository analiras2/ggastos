import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

export const missingSupabaseEnv = [
  !supabaseUrl ? 'EXPO_PUBLIC_SUPABASE_URL' : null,
  !supabasePublishableKey ? 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY' : null,
].filter((value): value is string => value !== null);

// GGastos is a single-user personal app — there is no real sign-up flow in
// production. Setting these lets the app authenticate silently on launch
// instead of showing the login form (AuthScreen stays as a manual fallback
// if these are unset or the auto sign-in fails).
const ownerEmail = process.env.EXPO_PUBLIC_OWNER_EMAIL?.trim() ?? '';
const ownerPassword = process.env.EXPO_PUBLIC_OWNER_PASSWORD ?? '';

export const ownerCredentials =
  ownerEmail.length > 0 && ownerPassword.length > 0
    ? { email: ownerEmail, password: ownerPassword }
    : null;

export const supabase: SupabaseClient | null =
  missingSupabaseEnv.length === 0
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          lock: processLock,
        },
      })
    : null;

let autoRefreshListenerRegistered = false;

if (supabase && Platform.OS !== 'web' && !autoRefreshListenerRegistered) {
  autoRefreshListenerRegistered = true;
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
