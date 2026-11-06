import { useCallback, useState } from 'react';

import { useWallet, type WalletSheetMode } from '@/features/wallet';
import { formatCurrencyCents } from '@/shared/lib/format-currency';

// The wallet shown at the top (always today's balance) and the sheet that sets or confirms it.
export function useWalletPanel(onCloseMonth: () => void) {
  const walletQuery = useWallet();
  const wallet = walletQuery.data;
  const isConfigured = wallet?.isConfigured ?? false;
  const balanceCents = wallet?.balanceCents ?? 0;
  const [sheetMode, setSheetMode] = useState<WalletSheetMode | null>(null);

  const handleOpenWalletSheet = useCallback(
    () => setSheetMode(isConfigured ? 'adjust' : 'setup'),
    [isConfigured]
  );
  const handleCloseWalletSheet = useCallback(() => setSheetMode(null), []);

  // Closing a month first asks whether the wallet matches the real balance.
  const handleRequestCloseMonth = useCallback(() => {
    if (isConfigured) {
      setSheetMode('close');
    } else {
      onCloseMonth();
    }
  }, [isConfigured, onCloseMonth]);

  const handleWalletSheetDone = useCallback(() => {
    const wasClosingMonth = sheetMode === 'close';
    setSheetMode(null);
    if (wasClosingMonth) {
      onCloseMonth();
    }
  }, [onCloseMonth, sheetMode]);

  return {
    wallet: {
      value: formatCurrencyCents(balanceCents),
      balanceCents,
      isNegative: balanceCents < 0,
      isConfigured,
      isLoading: walletQuery.isLoading,
    },
    walletSheetMode: sheetMode,
    handleOpenWalletSheet,
    handleCloseWalletSheet,
    handleRequestCloseMonth,
    handleWalletSheetDone,
  };
}
