import type { Session, User } from '@supabase/supabase-js';

import { ownerCredentials, supabase } from '@/lib/supabase/client';

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

export async function ensureOwnerSession(): Promise<Session> {
  if (!supabase || !ownerCredentials) {
    throw new Error('Owner credentials are not configured.');
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(
    ownerCredentials
  );
  if (!signInError) {
    if (!signInData.session) {
      throw new Error('Owner sign-in did not return a session.');
    }

    return signInData.session;
  }

  const { data, error: signUpError } = await supabase.auth.signUp(ownerCredentials);
  if (signUpError) {
    throw signUpError;
  }

  if (!data.session) {
    throw new Error('Owner account requires email confirmation before it can sign in.');
  }

  return data.session;
}

function getDisplayName(user: User): string | null {
  if (typeof user.user_metadata?.display_name === 'string') {
    return user.user_metadata.display_name;
  }

  return typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null;
}
