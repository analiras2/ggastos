import { useCallback, useMemo, useState } from 'react';

import { signOut, useAuth } from '@/features/auth';
import { useChartPreference } from '@/shared/lib/chart-preference';
import { accountName } from '@/shared/lib/account-name';
import { useWallet } from '@/features/wallet';

// Who is signed in, the wallet, which sheet is open, the sign-out action and the chart the statistics open with.
export function useSettingsViewModel() {
  const { session } = useAuth();
  const [chartPreference, setChartPreference] = useChartPreference();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);
  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const [isEditNameVisible, setIsEditNameVisible] = useState(false);
  const walletQuery = useWallet();
  const isWalletConfigured = walletQuery.data?.isConfigured ?? false;
  const balanceCents = walletQuery.data?.balanceCents ?? 0;

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
      isWalletConfigured,
      balanceCents,
      isCategoriesVisible,
      isWalletVisible,
      isEditNameVisible,
      openCategories: () => setIsCategoriesVisible(true),
      closeCategories: () => setIsCategoriesVisible(false),
      openWallet: () => setIsWalletVisible(true),
      closeWallet: () => setIsWalletVisible(false),
      openEditName: () => setIsEditNameVisible(true),
      closeEditName: () => setIsEditNameVisible(false),
    }),
    [
      balanceCents,
      chartPreference,
      handleSignOut,
      isCategoriesVisible,
      isEditNameVisible,
      isSigningOut,
      isWalletConfigured,
      isWalletVisible,
      session,
      setChartPreference,
      signOutError,
    ]
  );
}
