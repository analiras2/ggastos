import { describe, expect, it, vi } from 'vitest';

import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { emptyDashboardData, formatDashboardData } from '@/features/dashboard/format-dashboard';
import type { MonthDashboard } from '@/features/dashboard/contract';

// The categories feature's index pulls in native UI, which cannot load in Node; only these two
// pure helpers are used here.
vi.mock('@/features/categories', () => ({
  resolveCategoryColor: (categoryId: string) => `color-of-${categoryId}`,
  resolveCategoryIcon: (_categoryId: string, fallbackIcon: string) => fallbackIcon,
}));

type DashboardCategory = MonthDashboard['categories'][number];

const category = (overrides: Partial<DashboardCategory>): DashboardCategory => ({
  categoryId: '11111111-1111-4111-8111-111111111111',
  categoryCode: 'food',
  name: 'Mercado',
  impactType: 'EXPENSE',
  plannedCents: 0,
  actualCents: 0,
  deltaCents: 0,
  ...overrides,
});

const dashboard = (categories: DashboardCategory[], summary: Partial<MonthDashboard['summary']> = {}): MonthDashboard => ({
  month: '2026-11',
  summary: {
    plannedIncomeCents: 0,
    actualIncomeCents: 0,
    plannedExpenseCents: 0,
    actualExpenseCents: 0,
    plannedInvestmentCents: 0,
    actualInvestmentCents: 0,
    expectedBalanceCents: 120000,
    currentBalanceCents: 0,
    committedRemainingCents: 30000,
    openExpenseCents: 0,
    ...summary,
  },
  categories,
});

describe('formatDashboardData', () => {
  it('formats the month, the expected balance and the commitment', () => {
    const data = formatDashboardData(dashboard([]));

    expect(data.month).toBe('Novembro 2026');
    expect(data.expectedBalance).toBe(formatCurrencyCents(120000));
    expect(data.commitment.value).toBe(formatCurrencyCents(30000));
  });

  it('shows open invoices only when there is something to pay', () => {
    expect(formatDashboardData(dashboard([])).openInvoices).toBeNull();
    expect(formatDashboardData(dashboard([], { openExpenseCents: 5000 })).openInvoices).toEqual({
      value: formatCurrencyCents(5000),
    });
  });

  it('computes progress against the plan, rounded', () => {
    const [row] = formatDashboardData(dashboard([category({ plannedCents: 30000, actualCents: 10000 })])).categories;

    expect(row.progress).toBe(33);
    expect(row.planned).toBe(formatCurrencyCents(30000));
  });

  it('counts an unplanned category with spending as complete, and an untouched one as zero', () => {
    const [spent, untouched] = formatDashboardData(
      dashboard([category({ actualCents: 500 }), category({ categoryId: '22222222-2222-4222-8222-222222222222' })])
    ).categories;

    expect(spent.progress).toBe(100);
    expect(spent.planned).toBeNull();
    expect(untouched.progress).toBe(0);
  });

  it('never shows a negative amount as actual', () => {
    const [row] = formatDashboardData(dashboard([category({ actualCents: -700 })])).categories;

    expect(row.actual).toBe(formatCurrencyCents(0));
  });

  it('tells apart a category that appears once per entry type', () => {
    const shared = '33333333-3333-4333-8333-333333333333';
    const { categories } = formatDashboardData(
      dashboard([
        category({ categoryId: shared, impactType: 'EXPENSE' }),
        category({ categoryId: shared, impactType: 'INCOME' }),
      ])
    );

    expect(categories.map((item) => item.name)).toEqual(['Mercado · Despesa', 'Mercado · Receita']);
  });

  it('picks the icon of the category code, or a default for an unknown one', () => {
    const { categories } = formatDashboardData(
      dashboard([category({ categoryCode: 'housing' }), category({ categoryCode: 'custom' })])
    );

    expect(categories[0].icon).toBe('home');
    expect(categories[1].icon).toBe('circle-dollar-sign');
  });
});

describe('emptyDashboardData', () => {
  it('has no categories and zeroed totals for the month', () => {
    expect(emptyDashboardData('2026-02')).toEqual({
      month: 'Fevereiro 2026',
      expectedBalance: formatCurrencyCents(0),
      commitment: { value: formatCurrencyCents(0) },
      openInvoices: null,
      categories: [],
      pendingReviewCount: 0,
    });
  });
});
