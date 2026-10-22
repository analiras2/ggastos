import { useMemo } from 'react';

import { useAuth } from '@/features/auth/use-auth';

type AppBootstrapViewModel = {
  isLoading: boolean;
  setupError: string | null;
  isAppReady: boolean;
};

export function useAppBootstrapViewModel(): AppBootstrapViewModel {
  const { bootstrapError, isLoading, missingEnv, session } = useAuth();

  return useMemo(() => {
    if (missingEnv.length > 0) {
      return {
        isLoading: false,
        isAppReady: false,
        setupError: `Defina as variáveis de ambiente: ${missingEnv.join(', ')}.`,
      };
    }

    if (bootstrapError) {
      return {
        isLoading: false,
        isAppReady: false,
        setupError: `Não foi possível iniciar a conta principal: ${bootstrapError}`,
      };
    }

    return {
      isLoading,
      isAppReady: session !== null,
      setupError: null,
    };
  }, [bootstrapError, isLoading, missingEnv, session]);
}
