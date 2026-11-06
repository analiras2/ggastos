import { describe, expect, it } from 'vitest';

import { formatCurrencyCents } from '@/shared/lib/format-currency';

// Intl separates the symbol with a non-breaking space; compare with a regular one.
const NON_BREAKING_SPACE = String.fromCharCode(0xa0);
const plain = (text: string) => text.split(NON_BREAKING_SPACE).join(' ');

describe('formatCurrencyCents', () => {
  it('formats cents as Brazilian reais', () => {
    expect(plain(formatCurrencyCents(12345))).toBe('R$ 123,45');
  });

  it('uses thousands separators', () => {
    expect(plain(formatCurrencyCents(123456789))).toBe('R$ 1.234.567,89');
  });

  it('formats zero and negatives', () => {
    expect(plain(formatCurrencyCents(0))).toBe('R$ 0,00');
    expect(plain(formatCurrencyCents(-5000))).toBe('-R$ 50,00');
  });
});
