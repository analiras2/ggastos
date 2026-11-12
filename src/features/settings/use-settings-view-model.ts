import { useCallback, useMemo, useState } from 'react';

import { signOut, useAuth } from '@/features/auth';
import { useChartPreference } from '@/shared/lib/chart-preference';
import { accountName } from '@/shared/lib/account-name';

// Who is signed in, the sign-out action and the chart the statistics open with.
export function useSettingsViewModel() {
  const { session } = useAuth();
  const [chartPreference, setChartPreference] = useChartPreference();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = useCallback(async () => {
    setSignOutError(null);
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      setSignOutError('Não foi possível sair. Tente de novo.');
      setIsSigningOut(false);
    }
  }, []);

  return useMemo(
    () => ({
      name: accountName(session?.user),
      email: session?.user.email ?? 'Sem e-mail',
      chartPreference,
      setChartPreference,
      isSigningOut,
      signOutError,
      handleSignOut,
    }),
    [chartPreference, handleSignOut, isSigningOut, session, setChartPreference, signOutError]
  );
}
