import { useCallback, useState } from 'react';

import type { RecurrenceFrequency } from '@/shared/contracts/finance';
import type { TemplateMode } from '@/features/templates';

// How often the entry happens: once, every month/year, or split into installments.
export type PlanKind = 'ONE_OFF' | TemplateMode;

export interface PlanRecurrenceState {
  kind: PlanKind;
  setKind: (kind: PlanKind) => void;
  frequency: RecurrenceFrequency;
  setFrequency: (frequency: RecurrenceFrequency) => void;
  installmentCountInput: string;
  handleInstallmentCountChange: (text: string) => void;
  reset: () => void;
}

export function usePlanRecurrenceState(): PlanRecurrenceState {
  const [kind, setKind] = useState<PlanKind>('ONE_OFF');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('MONTHLY');
  const [installmentCountInput, setInstallmentCountInput] = useState('');

  const handleInstallmentCountChange = useCallback((text: string) => {
    setInstallmentCountInput(text.replace(/\D/g, ''));
  }, []);

  const reset = useCallback(() => {
    setKind('ONE_OFF');
    setFrequency('MONTHLY');
    setInstallmentCountInput('');
  }, []);

  return { kind, setKind, frequency, setFrequency, installmentCountInput, handleInstallmentCountChange, reset };
}
