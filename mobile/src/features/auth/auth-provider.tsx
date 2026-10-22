import {
  createContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import { missingOwnerEnv, missingSupabaseEnv, ownerCredentials, supabase } from '@/lib/supabase/client';
import { ensureOwnerSession, ensureProfile } from '@/features/auth/auth-service';

type AuthContextValue = {
  isLoading: boolean;
  session: Session | null;
  missingEnv: string[];
  bootstrapError: string | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(supabase !== null && ownerCredentials !== null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const lastProfileSyncUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase || !ownerCredentials) {
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error) {
          console.warn('Unable to restore existing Supabase session.', error.message);
        }

        if (!isMounted) {
          return;
        }

        if (data.session?.user) {
          setSession(data.session);
          setIsLoading(false);
          lastProfileSyncUserId.current = data.session.user.id;
          void ensureProfile(data.session.user);
          return;
        }

        try {
          const ownerSession = await ensureOwnerSession();
          if (!isMounted) {
            return;
          }

          setSession(ownerSession);
          lastProfileSyncUserId.current = ownerSession.user.id;
          void ensureProfile(ownerSession.user);
        } catch (autoSignInError) {
          const message = autoSignInError instanceof Error
            ? autoSignInError.message
            : 'Unknown owner sign-in error.';
          console.warn('Automatic owner sign-in failed.', message);
          setBootstrapError(message);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
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

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        session,
        missingEnv: [...missingSupabaseEnv, ...missingOwnerEnv],
        bootstrapError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
