import { describe, expect, it, vi } from 'vitest';

import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { toAnnualCategoryView, toAnnualMonthRow } from '@/features/reports/format-annual-summary';
import type { AnnualCategory, AnnualMonth } from '@/features/reports/contract';

// The categories index pulls in native UI, which cannot load in Node; the saved color wins when set.
vi.mock('@/features/categories', () => ({
  resolveCategoryColor: (categoryId: string, appearance?: Record<string, { color: string | null }>) =>
    appearance?.[categoryId]?.color ?? 'derived-color',
}));

const month = (overrides: Partial<AnnualMonth>): AnnualMonth => ({
  month: '2026-03',
  hasSnapshot: true,
  status: 'CLOSED',
  plannedIncomeCents: 100000,
  actualIncomeCents: 90000,
  plannedExpenseCents: 50000,
  actualExpenseCents: 45000,
  plannedInvestmentCents: 0,
  actualInvestmentCents: 0,
  openingBalanceCents: 0,
  expectedBalanceCents: 0,
  currentBalanceCents: 0,
  committedRemainingCents: 0,
  computedAt: null,
  ...overrides,
});

describe('toAnnualMonthRow', () => {
  it('labels the month with its first three letters and formats the amounts', () => {
    const row = toAnnualMonthRow(month({}));

    expect(row.label).toBe('Mar');
    expect(row.plannedIncome).toBe(formatCurrencyCents(100000));
    expect(row.actualExpense).toBe(formatCurrencyCents(45000));
    expect(row).toMatchObject({ hasSnapshot: true, status: 'CLOSED' });
  });

  it('keeps the month key as the label when the month number is unknown', () => {
    expect(toAnnualMonthRow(month({ month: '2026-13' })).label).toBe('202');
  });
});

describe('toAnnualCategoryView', () => {
  it('uses the saved color of the category when there is one', () => {
    const category = {
      categoryId: 'c1',
      categoryCode: 'food',
      name: 'Mercado',
      impactType: 'EXPENSE',
      plannedCents: 0,
      actualCents: 1200,
      deltaCents: 0,
    } as AnnualCategory;

    const view = toAnnualCategoryView(category, { c1: { icon: null, color: '#112233' } });

    expect(view).toEqual({ categoryId: 'c1', name: 'Mercado', color: '#112233', actualCents: 1200 });
  });
});
