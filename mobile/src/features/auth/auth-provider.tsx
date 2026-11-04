import {
  createContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';
import { ensureProfile } from '@/features/auth/auth-service';

type AuthContextValue = {
  isLoading: boolean;
  session: Session | null;
  missingEnv: string[];
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(supabase !== null);
  const lastProfileSyncUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

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

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, session, missingEnv: missingSupabaseEnv }}>
      {children}
    </AuthContext.Provider>
  );
}
