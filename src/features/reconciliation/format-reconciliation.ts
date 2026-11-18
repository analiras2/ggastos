import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { PERCENT_FACTOR } from '@/shared/lib/percent';
import { formatTimestampToBrazilian } from '@/shared/lib/form-utils';
import type { ReconciliationSuggestion } from '@/features/reconciliation/contract';

export type ReconciliationSuggestionView = {
  transactionId: string;
  plannedEntryId: string;
  transactionDescription: string;
  transactionAmount: string;
  transactionDate: string;
  plannedEntryTitle: string;
  plannedEntryAmount: string;
  scoreLabel: string;
};

export function formatReconciliationSuggestion(
  suggestion: ReconciliationSuggestion
): ReconciliationSuggestionView {
  return {
    transactionId: suggestion.transactionId,
    plannedEntryId: suggestion.plannedEntryId,
    transactionDescription: suggestion.transactionDescription,
    transactionAmount: formatCurrencyCents(suggestion.transactionAmountCents),
    transactionDate: formatTimestampToBrazilian(suggestion.transactionPostedAt),
    plannedEntryTitle: suggestion.plannedEntryTitle,
    plannedEntryAmount: formatCurrencyCents(suggestion.plannedEntryAmountCents),
    scoreLabel: `${Math.round(suggestion.score * PERCENT_FACTOR)}% de confiança`,
  };
}
