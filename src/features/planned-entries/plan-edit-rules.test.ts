import { describe, expect, it } from 'vitest';

import {
  buildEditablePlannedEntry,
  buildPlanEditUpdate,
  type PlanEditValues,
} from '@/features/planned-entries/plan-edit-rules';

const values: PlanEditValues = {
  title: 'Aluguel',
  categoryName: 'Casa',
  tags: ['#fixo'],
  impactType: 'EXPENSE',
  categoryId: 'cat-1',
  amountCents: 150000,
  dueDate: '2026-12-05',
  settlement: 'PLANNED',
  paymentMethod: null,
  initialSettlement: 'PLANNED',
};

describe('buildPlanEditUpdate', () => {
  it('writes the fields and the month of the new date, leaving the status alone', () => {
    const update = buildPlanEditUpdate(values);

    expect(update).toMatchObject({ title: 'Aluguel', is_title_manual: true, month: '2026-12', due_date: '2026-12-05', amount_cents: 150000 });
    expect(update).not.toHaveProperty('status');
  });

  it('keeps an empty title empty while only planned, to be named by the import', () => {
    expect(buildPlanEditUpdate({ ...values, title: '  ' })).toMatchObject({ title: null, is_title_manual: false });
  });

  it('confirms a paid entry on its date with the payment method', () => {
    const update = buildPlanEditUpdate({ ...values, settlement: 'PAID', paymentMethod: 'PIX' });

    expect(update).toMatchObject({ status: 'RECONCILED', manually_confirmed_at: '2026-12-05T12:00:00Z', payment_method: 'PIX' });
  });

  it('undoes the confirmation when a paid entry becomes planned again', () => {
    const update = buildPlanEditUpdate({ ...values, initialSettlement: 'PAID' });

    expect(update).toMatchObject({ status: 'PLANNED', manually_confirmed_at: null, payment_method: null });
  });
});

describe('buildEditablePlannedEntry', () => {
  const entry = {
    id: 'e1',
    title: null,
    tags: [],
    impactType: 'EXPENSE' as const,
    categoryId: 'c1',
    amountCents: 100,
    dueDate: '2026-11-04',
    status: 'RECONCILED' as const,
    manuallyConfirmedAt: '2026-11-04T12:00:00Z',
    paymentMethod: 'PIX',
  };

  it('marks a hand-confirmed entry as paid', () => {
    expect(buildEditablePlannedEntry(entry)).toMatchObject({ isPaid: true, paymentMethod: 'PIX' });
  });

  it('does not call an entry reconciled by an import paid, and drops payment methods the form cannot pick', () => {
    expect(buildEditablePlannedEntry({ ...entry, manuallyConfirmedAt: null, paymentMethod: 'CREDIT_CARD' })).toMatchObject({
      isPaid: false,
      paymentMethod: null,
    });
  });
});
