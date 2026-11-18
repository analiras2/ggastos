import { describe, expect, it } from 'vitest';

import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { formatReconciliationSuggestion } from '@/features/reconciliation/format-reconciliation';
import type { ReconciliationSuggestion } from '@/features/reconciliation/contract';

const suggestion = {
  transactionId: 'tx-1',
  plannedEntryId: 'entry-1',
  transactionDescription: 'NETFLIX.COM',
  transactionAmountCents: 5590,
  transactionPostedAt: new Date(2026, 10, 3, 12).toISOString(),
  plannedEntryTitle: 'Netflix',
  plannedEntryAmountCents: 5590,
  score: 0.876,
} as unknown as ReconciliationSuggestion;

describe('formatReconciliationSuggestion', () => {
  it('formats the transaction and the planned entry for display', () => {
    expect(formatReconciliationSuggestion(suggestion)).toMatchObject({
      transactionId: 'tx-1',
      plannedEntryId: 'entry-1',
      transactionDescription: 'NETFLIX.COM',
      transactionAmount: formatCurrencyCents(5590),
      transactionDate: '03/11/2026',
      plannedEntryTitle: 'Netflix',
      plannedEntryAmount: formatCurrencyCents(5590),
    });
  });

  it('shows the score as a rounded percentage', () => {
    expect(formatReconciliationSuggestion(suggestion).scoreLabel).toBe('88% de confiança');
    expect(formatReconciliationSuggestion({ ...suggestion, score: 1 }).scoreLabel).toBe('100% de confiança');
  });
});
