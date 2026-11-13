import { describe, expect, it } from 'vitest';

import { summarizeUncategorized, uncategorizedCountLabel } from '@/features/dashboard/uncategorized';

describe('summarizeUncategorized', () => {
  it('is null when there is nothing without a category', () => {
    expect(summarizeUncategorized([])).toBeNull();
  });

  it('counts the purchases and sums what was spent', () => {
    expect(
      summarizeUncategorized([
        { amountCents: 1000, direction: 'DEBIT' },
        { amountCents: 2500, direction: 'DEBIT' },
      ])
    ).toEqual({ count: 2, totalCents: 3500 });
  });

  it('takes refunds off the total, never going below zero', () => {
    expect(
      summarizeUncategorized([
        { amountCents: 5000, direction: 'DEBIT' },
        { amountCents: 1500, direction: 'CREDIT' },
      ])
    ).toEqual({ count: 2, totalCents: 3500 });
    expect(summarizeUncategorized([{ amountCents: 900, direction: 'CREDIT' }])).toEqual({ count: 1, totalCents: 0 });
  });
});

describe('uncategorizedCountLabel', () => {
  it('uses the singular for one item', () => {
    expect(uncategorizedCountLabel(1)).toBe('1 item');
    expect(uncategorizedCountLabel(3)).toBe('3 itens');
  });
});
