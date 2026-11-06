import { useCallback, useState } from 'react';

import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { monthLabel } from '@/shared/lib/month';
import {
  useCarryOverOpeningBalance,
  useClearOpeningBalance,
  useMonthOpeningBalance,
  useSetOpeningBalance,
} from '@/features/opening-balance/use-month-opening-balance';

const DIGITS_PATTERN = /\D/g;
const NEGATIVE_MARK = '-';

export function openingBalanceCentsFromInput(text: string): number {
  const digitsOnly = text.replace(DIGITS_PATTERN, '');
  const cents = digitsOnly ? parseInt(digitsOnly, 10) : 0;
  return text.includes(NEGATIVE_MARK) ? -cents : cents;
}

function monthName(monthKey: string): string {
  return monthLabel(monthKey).split(' ')[0];
}

export function useOpeningBalanceViewModel(monthKey: string) {
  const openingQuery = useMonthOpeningBalance(monthKey);
  const carryOver = useCarryOverOpeningBalance(monthKey);
  const setOpening = useSetOpeningBalance(monthKey);
  const clearOpening = useClearOpeningBalance(monthKey);
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState('');

  const opening = openingQuery.data;
  const hasOpening = opening?.openingBalanceCents != null;

  const handleStartEditing = useCallback(() => {
    const currentCents = opening?.openingBalanceCents;
    setInputText(currentCents != null ? String(currentCents) : '');
    setIsEditing(true);
  }, [opening?.openingBalanceCents]);

  const handleCancelEditing = useCallback(() => setIsEditing(false), []);

  const handleSaveEditing = useCallback(() => {
    setOpening.mutate(openingBalanceCentsFromInput(inputText), {
      onSuccess: () => setIsEditing(false),
    });
  }, [inputText, setOpening]);

  const handleCarryOver = useCallback(() => carryOver.mutate(), [carryOver]);
  const handleClear = useCallback(() => clearOpening.mutate(), [clearOpening]);

  const isBusy = carryOver.isPending || setOpening.isPending || clearOpening.isPending;
  const hasMutationError = carryOver.isError || setOpening.isError || clearOpening.isError;

  return {
    isLoading: openingQuery.isLoading,
    hasOpening,
    isEditing,
    isBusy,
    hasMutationError,
    maskedInput: inputText ? formatCurrencyCents(openingBalanceCentsFromInput(inputText)) : '',
    openingValue: hasOpening ? formatCurrencyCents(opening.openingBalanceCents ?? 0) : null,
    sourceLabel:
      opening?.source === 'CARRIED' && opening.carriedFromMonth
        ? `Trazido de ${monthName(opening.carriedFromMonth)}`
        : 'Informado manualmente',
    previousMonthName: opening ? monthName(opening.previousMonth) : '',
    previousMonthClosing: opening ? formatCurrencyCents(opening.previousMonthClosingCents) : '',
    isStale: opening?.isStale ?? false,
    setInputText,
    handleStartEditing,
    handleCancelEditing,
    handleSaveEditing,
    handleCarryOver,
    handleClear,
  };
}
