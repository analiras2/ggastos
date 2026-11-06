import { resolveCategoryColor, resolveCategoryIcon, type CategoryAppearanceMap } from '@/features/categories';
import type { CategoryBudget, DashboardData } from '@/features/dashboard/dashboard-data';
import { categoryDisplayName, splitCategoryIds } from '@/features/dashboard/category-display-name';
import type { MonthDashboard } from '@/features/dashboard/contract';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { monthLabel } from '@/shared/lib/month';

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

function toCategoryBudget(
  category: MonthDashboard['categories'][number],
  isSplit: boolean,
  appearance?: CategoryAppearanceMap
): CategoryBudget {
  const progress =
    category.plannedCents > 0
      ? Math.round((category.actualCents / category.plannedCents) * 100)
      : category.actualCents > 0
        ? 100
        : 0;

  const deltaTone: CategoryBudget['deltaTone'] =
    category.deltaCents > 0 ? 'over' : category.deltaCents < 0 ? 'under' : 'neutral';

  const hasDelta = category.actualCents > 0 && category.deltaCents !== 0;
  const delta = hasDelta ? formatSignedCurrencyCents(category.deltaCents) : null;

  return {
    categoryId: category.categoryId,
    impactType: category.impactType,
    name: categoryDisplayName(category.name, category.impactType, isSplit),
    icon: resolveCategoryIcon(category.categoryId, iconForCategory(category.categoryCode), appearance),
    color: resolveCategoryColor(category.categoryId, appearance),
    planned: category.plannedCents > 0 ? formatCurrencyCents(category.plannedCents) : null,
    delta,
    deltaTone,
    progress,
  };
}

export function formatDashboardData(
  monthDashboard: MonthDashboard,
  openingBalanceCents = 0,
  appearance?: CategoryAppearanceMap
): DashboardData {
  const { summary } = monthDashboard;
  const splitIds = splitCategoryIds(monthDashboard.categories);
  // Cash balance: only what was actually paid. Unpaid (open) statements are counted in
  // committedRemainingCents instead (see get_month_dashboard).
  const heroDeltaCents = summary.expectedBalanceCents - summary.currentBalanceCents;
  const totalActual = summary.currentBalanceCents + openingBalanceCents;

  return {
    month: monthLabel(monthDashboard.month),
    hero: {
      value: formatCurrencyCents(totalActual),
      delta: formatSignedCurrencyCents(heroDeltaCents),
      deltaLabel: 'até o momento',
      status: totalActual >= 0 ? 'healthy' : 'tight',
    },
    previsto: formatCurrencyCents(summary.expectedBalanceCents + openingBalanceCents),
    commitment: { value: formatCurrencyCents(summary.committedRemainingCents) },
    openInvoices:
      summary.openExpenseCents > 0 ? { value: formatCurrencyCents(summary.openExpenseCents) } : null,
    categories: monthDashboard.categories.map((category) =>
      toCategoryBudget(category, splitIds.has(category.categoryId), appearance)
    ),
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
