import { describe, expect, it } from 'vitest';

import {
  buildPaidFields,
  isFutureDate,
  paymentMethodLabel,
  resolveEntryTitle,
  settlementLabel,
} from '@/features/planned-entries/paid-entry-rules';

describe('buildPaidFields', () => {
  it('keeps a planned entry open and without a payment method', () => {
    expect(buildPaidFields('PLANNED', 'PIX', '2026-11-05')).toEqual({
      status: 'PLANNED',
      manuallyConfirmedAt: null,
      paymentMethod: null,
    });
  });

  it('confirms a paid entry at midday UTC of the chosen date', () => {
    expect(buildPaidFields('PAID', 'PIX', '2026-11-05')).toEqual({
      status: 'RECONCILED',
      manuallyConfirmedAt: '2026-11-05T12:00:00Z',
      paymentMethod: 'PIX',
    });
  });
});

describe('resolveEntryTitle', () => {
  it('uses the typed title, trimmed', () => {
    expect(resolveEntryTitle('  Luz ', 'Moradia', 'PLANNED')).toBe('Luz');
  });

  it('leaves a planned entry untitled so the import can name it', () => {
    expect(resolveEntryTitle('', 'Moradia', 'PLANNED')).toBeNull();
  });

  it('falls back to the category name for a paid entry', () => {
    expect(resolveEntryTitle(' ', 'Moradia', 'PAID')).toBe('Moradia');
  });
});

describe('labels and dates', () => {
  it('words the settlement by the kind of movement', () => {
    expect(settlementLabel('INCOME')).toBe('Já recebi');
    expect(settlementLabel('EXPENSE')).toBe('Já paguei');
  });

  it('knows when a date is after today', () => {
    expect(isFutureDate('2026-11-06', '2026-11-05')).toBe(true);
    expect(isFutureDate('2026-11-05', '2026-11-05')).toBe(false);
  });

  it('names payment methods and ignores unknown ones', () => {
    expect(paymentMethodLabel('PIX')).toBe('Pix');
    expect(paymentMethodLabel('CREDIT_CARD')).toBe('Cartão de crédito');
    expect(paymentMethodLabel('BITCOIN')).toBeNull();
    expect(paymentMethodLabel(null)).toBeNull();
  });
});
