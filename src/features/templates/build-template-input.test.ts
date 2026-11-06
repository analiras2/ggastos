import { describe, expect, it } from 'vitest';

import { buildTemplateInput } from '@/features/templates/build-template-input';

const categoryId = '11111111-1111-4111-8111-111111111111';

const valid = {
  mode: 'RECURRING' as const,
  title: 'Aluguel',
  impactType: 'EXPENSE' as const,
  categoryId: categoryId as string | null,
  startDate: new Date(2026, 10, 5),
  amountCents: 150000,
  recurrenceFrequency: 'MONTHLY' as const,
  installmentCountInput: '',
};

describe('buildTemplateInput', () => {
  it('builds a recurring template from a valid form', () => {
    expect(buildTemplateInput(valid)).toEqual({
      input: {
        title: 'Aluguel',
        impactType: 'EXPENSE',
        categoryId,
        defaultAmountCents: 150000,
        recurrenceFrequency: 'MONTHLY',
        recurrenceInterval: 1,
        startMonth: '2026-11',
        installmentTotal: null,
        installmentAmountCents: null,
      },
    });
  });

  it('splits the total across the installments', () => {
    const result = buildTemplateInput({
      ...valid,
      mode: 'INSTALLMENT',
      amountCents: 10000,
      installmentCountInput: '3',
    });

    expect(result).toMatchObject({
      input: {
        recurrenceFrequency: 'NONE',
        installmentTotal: 3,
        installmentAmountCents: 3333,
        defaultAmountCents: 3333,
      },
    });
  });

  it('uses the impact type chosen on the entry, not the category', () => {
    expect(buildTemplateInput({ ...valid, impactType: 'INCOME' })).toMatchObject({
      input: { impactType: 'INCOME', categoryId },
    });
  });

  it.each([
    [{ title: '  ' }, 'Informe um título.'],
    [{ categoryId: null }, 'Selecione uma categoria.'],
    [{ startDate: null }, 'Selecione a data.'],
    [{ amountCents: 0 }, 'Informe um valor maior que zero.'],
    [{ mode: 'INSTALLMENT' as const, installmentCountInput: '' }, 'Informe o número de parcelas.'],
  ])('reports the first problem: %j', (override, message) => {
    expect(buildTemplateInput({ ...valid, ...override })).toEqual({ error: message });
  });
});
