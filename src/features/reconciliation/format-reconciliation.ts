import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import type { ReconciliationSuggestion } from '@/features/reconciliation/reconciliation-schema';

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
    transactionDate: new Date(suggestion.transactionPostedAt).toLocaleDateString('pt-BR'),
    plannedEntryTitle: suggestion.plannedEntryTitle,
    plannedEntryAmount: formatCurrencyCents(suggestion.plannedEntryAmountCents),
    scoreLabel: `${Math.round(suggestion.score * 100)}% de confiança`,
  };
}
