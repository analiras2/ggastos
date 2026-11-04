import { useMemo } from 'react';

import { useAuth } from '@/features/auth/use-auth';

type AppBootstrapViewModel = {
  isLoading: boolean;
  setupError: string | null;
  isAppReady: boolean;
  needsLogin: boolean;
};

export function useAppBootstrapViewModel(): AppBootstrapViewModel {
  const { isLoading, missingEnv, session } = useAuth();

  return useMemo(() => {
    if (missingEnv.length > 0) {
      return {
        isLoading: false,
        isAppReady: false,
        needsLogin: false,
        setupError: `Defina as variáveis de ambiente: ${missingEnv.join(', ')}.`,
      };
    }

    return {
      isLoading,
      isAppReady: session !== null,
      needsLogin: !isLoading && session === null,
      setupError: null,
    };
  }, [isLoading, missingEnv, session]);
}
