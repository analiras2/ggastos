import { useCallback, useMemo } from 'react';

import { getFormattedCloseMonthError, useCloseMonth } from '@/features/closing/use-close-month';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import type { BannerState } from '@/features/dashboard/dashboard-view-model-types';

const CLOSED_MESSAGE = 'Mês fechado. O snapshot pode ser recalculado a qualquer momento.';

// Closing the month, plus the banner that reports its progress and open invoices.
export function useCloseMonthBanner(monthKey: string, openExpenseCents: number) {
  const closeMonthMutation = useCloseMonth();

  const closeMonthBanner = useMemo<{ state: BannerState; message: string } | null>(() => {
    if (closeMonthMutation.isPending) {
      return { state: 'pending', message: 'Fechando o mês...' };
    }

    if (closeMonthMutation.isError) {
      return { state: 'error', message: getFormattedCloseMonthError(closeMonthMutation.error) };
    }

    if (closeMonthMutation.isSuccess) {
      if (openExpenseCents > 0) {
        return {
          state: 'pending',
          message: `${CLOSED_MESSAGE} Atenção: ${formatCurrencyCents(openExpenseCents)} em faturas ainda em aberto. Marque como paga em Pendências e recalcule o mês.`,
        };
      }
      return { state: 'ok', message: CLOSED_MESSAGE };
    }

    return null;
  }, [
    closeMonthMutation.isPending,
    closeMonthMutation.isError,
    closeMonthMutation.error,
    closeMonthMutation.isSuccess,
    openExpenseCents,
  ]);

  const handleCloseMonth = useCallback(() => {
    closeMonthMutation.mutate(monthKey);
  }, [closeMonthMutation, monthKey]);

  return { closeMonthBanner, isClosingMonth: closeMonthMutation.isPending, handleCloseMonth };
}
