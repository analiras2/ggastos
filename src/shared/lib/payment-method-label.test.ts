import { describe, expect, it } from 'vitest';

import { paymentMethodLabel } from '@/shared/lib/payment-method-label';

describe('paymentMethodLabel', () => {
  it('names the known payment methods', () => {
    expect(paymentMethodLabel('PIX')).toBe('Pix');
    expect(paymentMethodLabel('CASH')).toBe('Dinheiro');
    expect(paymentMethodLabel('CREDIT_CARD')).toBe('Cartão de crédito');
  });

  it('returns null for no method or one this version does not know', () => {
    expect(paymentMethodLabel(null)).toBeNull();
    expect(paymentMethodLabel('')).toBeNull();
    expect(paymentMethodLabel('BARTER')).toBeNull();
  });
});
