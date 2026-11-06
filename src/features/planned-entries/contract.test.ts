import { describe, expect, it } from 'vitest';

import { createPlannedEntrySchema } from '@/features/planned-entries/contract';

const base = {
  month: '2026-11',
  impactType: 'EXPENSE' as const,
  categoryId: '11111111-1111-4111-8111-111111111111',
  amountCents: 5000,
};

describe('createPlannedEntrySchema', () => {
  it('accepts a planned entry with only the required fields', () => {
    const parsed = createPlannedEntrySchema.parse(base);
    expect(parsed.settlement).toBe('PLANNED');
    expect(parsed.tags).toEqual([]);
  });

  it('requires the date a paid entry happened on', () => {
    const result = createPlannedEntrySchema.safeParse({ ...base, settlement: 'PAID', paymentMethod: 'PIX' });
    expect(result.success).toBe(false);
  });

  it('accepts a paid entry with date and payment method', () => {
    const result = createPlannedEntrySchema.safeParse({
      ...base,
      settlement: 'PAID',
      paymentMethod: 'PIX',
      dueDate: '2026-11-05',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a payment method on an entry that is not paid yet', () => {
    expect(createPlannedEntrySchema.safeParse({ ...base, paymentMethod: 'PIX' }).success).toBe(false);
  });

  it('rejects credit card as a hand-picked payment method', () => {
    const result = createPlannedEntrySchema.safeParse({
      ...base,
      settlement: 'PAID',
      paymentMethod: 'CREDIT_CARD',
      dueDate: '2026-11-05',
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero, negative and fractional amounts', () => {
    for (const amountCents of [0, -1, 10.5]) {
      expect(createPlannedEntrySchema.safeParse({ ...base, amountCents }).success).toBe(false);
    }
  });
});
