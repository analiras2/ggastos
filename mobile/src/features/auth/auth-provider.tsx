import {
  createContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';

type AuthContextValue = {
  isConfigured: boolean;
  isLoading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  missingEnv: string[];
};

export const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureProfile(user: User) {
  if (!supabase) {
    return;
  }

  const displayNameSource =
    typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name
      : typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : null;

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? `${user.id}@users.ggastos.local`,
      display_name: displayNameSource,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.warn('Unable to sync profile after auth event.', error.message);
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(supabase !== null);
  const lastProfileSyncUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.warn('Unable to restore existing Supabase session.', error.message);
        }

        if (!isMounted) {
          return;
        }

        setSession(data.session);
        setIsLoading(false);

        if (data.session?.user) {
          lastProfileSyncUserId.current = data.session.user.id;
          void ensureProfile(data.session.user);
        }
      })
      .catch((error: unknown) => {
        console.warn('Unexpected session restore error.', error);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);

      if (!nextSession?.user) {
        lastProfileSyncUserId.current = null;
        return;
      }

      if (lastProfileSyncUserId.current === nextSession.user.id) {
        return;
      }

      lastProfileSyncUserId.current = nextSession.user.id;
      void ensureProfile(nextSession.user);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error(
        `Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }

  async function signUp(email: string, password: string) {
    if (!supabase) {
      throw new Error(
        `Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`
      );
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isConfigured: supabase !== null,
        isLoading,
        session,
        signIn,
        signUp,
        signOut,
        missingEnv: missingSupabaseEnv,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
