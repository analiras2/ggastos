import type { ImpactType } from '@/shared/contracts/finance';
import { formatCurrencyCents } from '@/shared/lib/format-currency';

export type CategoryStatusTone = 'neutral' | 'over' | 'under';

// What is left to finish a category (or how far it went past the plan), worded for the entry type.
export type CategoryStatus = { label: string; value: string | null; tone: CategoryStatusTone };

const REMAINING_LABELS: Partial<Record<ImpactType, string>> = {
  EXPENSE: 'Falta pagar',
  INCOME: 'Falta receber',
  INVESTMENT: 'Falta investir',
};
const DEFAULT_REMAINING_LABEL = 'Falta';
const DONE_LABEL = 'Concluído';
const OVER_EXPENSE_LABEL = 'Passou';
const OVER_OTHER_LABEL = 'Acima do previsto';

// Null when nothing was planned, since there is no target to compare with.
export function categoryStatus(impactType: ImpactType, plannedCents: number, actualCents: number): CategoryStatus | null {
  if (plannedCents <= 0) {
    return null;
  }

  const remainingCents = plannedCents - actualCents;
  if (remainingCents > 0) {
    return {
      label: REMAINING_LABELS[impactType] ?? DEFAULT_REMAINING_LABEL,
      value: formatCurrencyCents(remainingCents),
      tone: 'neutral',
    };
  }
  if (remainingCents === 0) {
    return { label: DONE_LABEL, value: null, tone: 'under' };
  }

  const isExpense = impactType === 'EXPENSE';
  return {
    label: isExpense ? OVER_EXPENSE_LABEL : OVER_OTHER_LABEL,
    value: formatCurrencyCents(-remainingCents),
    tone: isExpense ? 'over' : 'under',
  };
}
