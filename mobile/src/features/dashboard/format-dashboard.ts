import type { CategoryBudget, DashboardData } from '@/features/dashboard/dashboard-data';
import type { MonthDashboard } from '@/features/dashboard/dashboard-schema';
import { monthLabel } from '@/features/dashboard/month-utils';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatCurrencyCents(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

function formatSignedCurrencyCents(cents: number): string {
  const formatted = formatCurrencyCents(Math.abs(cents));
  if (cents < 0) return `-${formatted}`;
  if (cents > 0) return `+${formatted}`;
  return formatted;
}

const CATEGORY_ICONS: Record<string, string> = {
  food: 'shopping-cart',
  housing: 'home',
  transport: 'car',
  health: 'heart-pulse',
  leisure: 'popcorn',
  bills: 'receipt',
  education: 'graduation-cap',
  shopping: 'shopping-bag',
  taxes_fees: 'landmark',
  salary: 'banknote',
  extra_income: 'plus-circle',
  invested_amount: 'trending-up',
  internal_transfer: 'arrow-left-right',
};

function iconForCategory(categoryCode: string): string {
  return CATEGORY_ICONS[categoryCode] ?? 'circle-dollar-sign';
}

function toCategoryBudget(category: MonthDashboard['categories'][number]): CategoryBudget {
  const progress =
    category.plannedCents > 0
      ? Math.round((category.actualCents / category.plannedCents) * 100)
      : category.actualCents > 0
        ? 100
        : 0;

  const deltaTone: CategoryBudget['deltaTone'] =
    category.deltaCents > 0 ? 'over' : category.deltaCents < 0 ? 'under' : 'neutral';

  const delta =
    category.actualCents === 0
      ? 'Ainda não começou'
      : category.deltaCents === 0
        ? 'No previsto'
        : formatSignedCurrencyCents(category.deltaCents);

  return {
    categoryId: category.categoryId,
    name: category.name,
    icon: iconForCategory(category.categoryCode),
    planned: formatCurrencyCents(category.plannedCents),
    actual: formatCurrencyCents(category.actualCents),
    delta,
    deltaTone,
    progress,
  };
}

export function formatDashboardData(monthDashboard: MonthDashboard): DashboardData {
  const { summary } = monthDashboard;
  // Cash balance: only what was actually paid. Unpaid (open) statements are counted in
  // committedRemainingCents instead (see get_month_dashboard).
  const totalActual = summary.currentBalanceCents;
  const heroDeltaCents = summary.expectedBalanceCents - totalActual;

  return {
    month: monthLabel(monthDashboard.month),
    hero: {
      value: formatCurrencyCents(totalActual),
      delta: formatSignedCurrencyCents(heroDeltaCents),
      deltaLabel: 'até o momento',
      status: totalActual >= 0 ? 'healthy' : 'tight',
    },
    previsto: formatCurrencyCents(summary.expectedBalanceCents),
    commitment: { value: formatCurrencyCents(summary.committedRemainingCents) },
    openInvoices:
      summary.openExpenseCents > 0 ? { value: formatCurrencyCents(summary.openExpenseCents) } : null,
    categories: monthDashboard.categories.map(toCategoryBudget),
    pendingReviewCount: 0,
  };
}

export function emptyDashboardData(monthKey: string): DashboardData {
  return {
    month: monthLabel(monthKey),
    hero: {
      value: formatCurrencyCents(0),
      delta: formatCurrencyCents(0),
      deltaLabel: 'vs. realizado até agora',
      status: 'healthy',
    },
    previsto: formatCurrencyCents(0),
    commitment: { value: formatCurrencyCents(0) },
    openInvoices: null,
    categories: [],
    pendingReviewCount: 0,
  };
}
