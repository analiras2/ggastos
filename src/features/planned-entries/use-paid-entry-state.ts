import { useCallback, useState } from 'react';

import {
  isFutureDate,
  settlementLabel,
  type EntrySettlement,
  type SelectablePaymentMethod,
} from '@/features/planned-entries/paid-entry-rules';
import { formatDateToIso } from '@/shared/lib/form-utils';

export interface PaidEntryState {
  settlement: EntrySettlement;
  setSettlement: (value: EntrySettlement) => void;
  paidLabel: string;
  paymentMethod: SelectablePaymentMethod | null;
  setPaymentMethod: (value: SelectablePaymentMethod | null) => void;
  showFutureDateWarning: boolean;
  reset: () => void;
}

export function usePaidEntryState(impactType: string | undefined, selectedDate: Date | null): PaidEntryState {
  const [settlement, setSettlement] = useState<EntrySettlement>('PLANNED');
  const [paymentMethod, setPaymentMethod] = useState<SelectablePaymentMethod | null>(null);

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
