import { resolveCategoryColor, resolveCategoryIcon, type CategoryAppearanceMap } from '@/features/categories';
import type { CategoryBudget, DashboardData } from '@/features/dashboard/dashboard-data';
import { categoryStatus } from '@/features/dashboard/category-status';
import { categoryDisplayName, splitCategoryIds } from '@/features/dashboard/category-display-name';
import type { MonthDashboard } from '@/features/dashboard/contract';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { monthLabel } from '@/shared/lib/month';

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

  return {
    categoryId: category.categoryId,
    impactType: category.impactType,
    name: categoryDisplayName(category.name, category.impactType, isSplit),
    icon: resolveCategoryIcon(category.categoryId, iconForCategory(category.categoryCode), appearance),
    color: resolveCategoryColor(category.categoryId, appearance),
    planned: category.plannedCents > 0 ? formatCurrencyCents(category.plannedCents) : null,
    actual: formatCurrencyCents(Math.max(category.actualCents, 0)),
    status: categoryStatus(category.impactType, category.plannedCents, category.actualCents),
    progress,
  };
}

export function formatDashboardData(
  monthDashboard: MonthDashboard,
  appearance?: CategoryAppearanceMap
): DashboardData {
  const { summary } = monthDashboard;
  const splitIds = splitCategoryIds(monthDashboard.categories);

  return {
    month: monthLabel(monthDashboard.month),
    previsto: formatCurrencyCents(summary.expectedBalanceCents),
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
    previsto: formatCurrencyCents(0),
    commitment: { value: formatCurrencyCents(0) },
    openInvoices: null,
    categories: [],
    pendingReviewCount: 0,
  };
}
