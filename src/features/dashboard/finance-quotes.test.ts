import { describe, expect, it } from 'vitest';

import { FINANCE_QUOTES, pickFinanceQuote } from '@/features/dashboard/finance-quotes';

describe('finance quotes', () => {
  it('has many distinct, non-empty messages', () => {
    expect(FINANCE_QUOTES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(FINANCE_QUOTES).size).toBe(FINANCE_QUOTES.length);
    expect(FINANCE_QUOTES.every((quote) => quote.trim().length > 0)).toBe(true);
  });

  it('picks the first and the last message at the ends of the range', () => {
    expect(pickFinanceQuote(() => 0)).toBe(FINANCE_QUOTES[0]);
    expect(pickFinanceQuote(() => 0.999999)).toBe(FINANCE_QUOTES[FINANCE_QUOTES.length - 1]);
  });

  it('never goes out of range even if random returns 1', () => {
    expect(pickFinanceQuote(() => 1)).toBe(FINANCE_QUOTES[FINANCE_QUOTES.length - 1]);
  });
});
