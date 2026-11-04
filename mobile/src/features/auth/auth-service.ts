import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';

const PROFILE_FALLBACK_EMAIL_DOMAIN = 'users.ggastos.local';

export async function ensureProfile(user: User) {
  if (!supabase) {
    return;
  }

  const displayName = getDisplayName(user);
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? `${user.id}@${PROFILE_FALLBACK_EMAIL_DOMAIN}`,
      display_name: displayName,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.warn('Unable to sync profile after auth event.', error.message);
  }
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
}

function getDisplayName(user: User): string | null {
  if (typeof user.user_metadata?.display_name === 'string') {
    return user.user_metadata.display_name;
  }

  return typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null;
}
