import { describe, expect, it } from 'vitest';

import { createPlanningTemplateSchema } from '@/features/templates/contract';

const base = {
  title: 'Aluguel',
  impactType: 'EXPENSE' as const,
  categoryId: '11111111-1111-4111-8111-111111111111',
  defaultAmountCents: 150000,
  startMonth: '2026-11',
};

describe('createPlanningTemplateSchema', () => {
  it('accepts a monthly recurring template', () => {
    expect(createPlanningTemplateSchema.safeParse({ ...base, recurrenceFrequency: 'MONTHLY' }).success).toBe(true);
  });

  it('accepts an installment template', () => {
    const result = createPlanningTemplateSchema.safeParse({
      ...base,
      recurrenceFrequency: 'NONE',
      installmentTotal: 6,
      installmentAmountCents: 25000,
    });
    expect(result.success).toBe(true);
  });

  it('needs either a recurrence or installment data', () => {
    expect(createPlanningTemplateSchema.safeParse(base).success).toBe(false);
  });

  it('does not allow a recurrence together with installments', () => {
    const result = createPlanningTemplateSchema.safeParse({
      ...base,
      recurrenceFrequency: 'MONTHLY',
      installmentTotal: 6,
      installmentAmountCents: 25000,
    });
    expect(result.success).toBe(false);
  });

  it('needs the installment count and amount together', () => {
    const result = createPlanningTemplateSchema.safeParse({
      ...base,
      recurrenceFrequency: 'NONE',
      installmentTotal: 6,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an end month before the start month', () => {
    const result = createPlanningTemplateSchema.safeParse({
      ...base,
      recurrenceFrequency: 'MONTHLY',
      endMonth: '2026-10',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a blank title', () => {
    expect(createPlanningTemplateSchema.safeParse({ ...base, title: '  ', recurrenceFrequency: 'MONTHLY' }).success).toBe(false);
  });
});
