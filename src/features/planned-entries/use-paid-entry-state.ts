import { useCallback, useState } from 'react';

import {
  isFutureDate,
  settlementLabel,
  type EntrySettlement,
  type SelectablePaymentMethod,
} from '@/features/planned-entries/paid-entry-rules';
import { formatDateToIso } from '@/shared/lib/form-utils';
import type { EditablePlannedEntry } from '@/features/planned-entries/plan-edit-rules';

export interface PaidEntryState {
  settlement: EntrySettlement;
  setSettlement: (value: EntrySettlement) => void;
  paidLabel: string;
  paymentMethod: SelectablePaymentMethod | null;
  setPaymentMethod: (value: SelectablePaymentMethod | null) => void;
  showFutureDateWarning: boolean;
  reset: () => void;
}

export function usePaidEntryState(
  impactType: string | undefined,
  selectedDate: Date | null,
  entry?: EditablePlannedEntry
): PaidEntryState {
  const [settlement, setSettlement] = useState<EntrySettlement>(entry?.isPaid ? 'PAID' : 'PLANNED');
  const [paymentMethod, setPaymentMethod] = useState<SelectablePaymentMethod | null>(entry?.paymentMethod ?? null);

  const reset = useCallback(() => {
    setSettlement('PLANNED');
    setPaymentMethod(null);
  }, []);

  const showFutureDateWarning =
    settlement === 'PAID' && selectedDate !== null && isFutureDate(formatDateToIso(selectedDate), formatDateToIso(new Date()));

  return {
    settlement,
    setSettlement,
    paidLabel: settlementLabel(impactType ?? 'EXPENSE'),
    paymentMethod,
    setPaymentMethod,
    showFutureDateWarning,
    reset,
  };
}
