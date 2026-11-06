import { useCallback, useState } from 'react';

import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { useSetWalletBalance } from '@/features/wallet/use-wallet';
import { walletCentsFromInput, walletInputFromCents } from '@/features/wallet/wallet-input';

// State of the "wallet balance" sheet: the typed value and saving it.
export function useWalletBalanceForm(currentCents: number, onSaved: () => void) {
  const setBalance = useSetWalletBalance();
  const [text, setText] = useState(() => walletInputFromCents(currentCents));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cents = walletCentsFromInput(text);

  const handleSave = useCallback(async () => {
    setErrorMessage(null);
    try {
      // Nothing to save when the value was confirmed as it is.
      if (cents !== currentCents) {
        await setBalance.mutateAsync(cents);
      }
      onSaved();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar o saldo.');
    }
  }, [cents, currentCents, onSaved, setBalance]);

  return {
    maskedValue: text ? formatCurrencyCents(cents) : '',
    setText,
    errorMessage,
    isSaving: setBalance.isPending,
    handleSave,
  };
}
