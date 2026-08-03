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
  const totalPlanned =
    summary.plannedIncomeCents - summary.plannedExpenseCents - summary.plannedInvestmentCents;
  const totalActual =
    summary.actualIncomeCents - summary.actualExpenseCents - summary.actualInvestmentCents;
  const remainingIncomeCents = Math.max(summary.plannedIncomeCents - summary.actualIncomeCents, 0);
  const heroDeltaCents = summary.expectedBalanceCents - summary.currentBalanceCents;

  return {
    month: monthLabel(monthDashboard.month),
    hero: {
      value: formatCurrencyCents(summary.expectedBalanceCents),
      delta: formatSignedCurrencyCents(heroDeltaCents),
      deltaLabel: 'vs. realizado até agora',
      status: summary.expectedBalanceCents >= 0 ? 'healthy' : 'tight',
    },
    previsto: formatCurrencyCents(totalPlanned),
    atual: formatCurrencyCents(totalActual),
    commitment: {
      remainingIncome: formatCurrencyCents(remainingIncomeCents),
      remainingExpenses: formatCurrencyCents(summary.committedRemainingCents),
      level: summary.committedRemainingCents > summary.expectedBalanceCents ? 'high' : 'normal',
    },
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
    atual: formatCurrencyCents(0),
    commitment: {
      remainingIncome: formatCurrencyCents(0),
      remainingExpenses: formatCurrencyCents(0),
      level: 'normal',
    },
    categories: [],
    pendingReviewCount: 0,
  };
}
