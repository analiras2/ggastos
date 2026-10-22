import { useMemo } from 'react';

import { useAuth } from '@/features/auth/use-auth';

type SettingsViewModel = {
  accountLabel: string;
};

export function useSettingsViewModel(): SettingsViewModel {
  const { session } = useAuth();

  return useMemo(
    () => ({ accountLabel: session?.user.email ?? session?.user.id ?? 'Conta principal' }),
    [session]
  );
}
