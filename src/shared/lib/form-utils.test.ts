import { describe, expect, it } from 'vitest';

import {
  centsFromMaskedInput,
  formatDateToIso,
  formatIsoDateToBrazilian,
  installmentAmountCents,
  installmentCountFromInput,
  monthKeyFromIsoDate,
} from '@/shared/lib/form-utils';

describe('centsFromMaskedInput', () => {
  it('keeps only the digits of a masked amount', () => {
    expect(centsFromMaskedInput('R$ 1.234,56')).toBe(123456);
  });

  it('is zero when there are no digits', () => {
    expect(centsFromMaskedInput('R$ ')).toBe(0);
  });
});

describe('installment helpers', () => {
  it('rounds the amount of each installment to the cent', () => {
    expect(installmentAmountCents(10000, 3)).toBe(3333);
  });

  it('reads the installment count from free text', () => {
    expect(installmentCountFromInput('12x')).toBe(12);
    expect(installmentCountFromInput('')).toBe(0);
  });
});

describe('date helpers', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(formatDateToIso(new Date(2026, 10, 5))).toBe('2026-11-05');
  });

  it('formats an ISO date without shifting the day', () => {
    expect(formatIsoDateToBrazilian('2026-11-05')).toBe('05/11/2026');
    expect(formatIsoDateToBrazilian('2026-11-05T23:59:00Z')).toBe('05/11/2026');
  });

  it('takes the month key from an ISO date', () => {
    expect(monthKeyFromIsoDate('2026-11-05')).toBe('2026-11');
  });
});
