import { describe, expect, it } from 'vitest';

import { walletCentsFromInput, walletInputFromCents } from '@/features/wallet/wallet-input';

describe('walletCentsFromInput', () => {
  it('reads digits as cents', () => {
    expect(walletCentsFromInput('R$ 1.234,56')).toBe(123456);
  });

  it('turns the value negative when there is a minus sign', () => {
    expect(walletCentsFromInput('-2500')).toBe(-2500);
    expect(walletCentsFromInput('R$ -25,00')).toBe(-2500);
  });

  it('is zero for empty text or only a minus sign', () => {
    expect(walletCentsFromInput('')).toBe(0);
    expect(walletCentsFromInput('-')).toBe(0);
  });
});

describe('walletInputFromCents', () => {
  it('round-trips the current value into the field', () => {
    expect(walletCentsFromInput(walletInputFromCents(-2500))).toBe(-2500);
    expect(walletCentsFromInput(walletInputFromCents(99))).toBe(99);
  });

  it('leaves the field empty for zero', () => {
    expect(walletInputFromCents(0)).toBe('');
  });
});
