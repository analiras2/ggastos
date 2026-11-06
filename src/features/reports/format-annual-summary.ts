import { resolveCategoryColor, type CategoryAppearanceMap } from '@/features/categories';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import type { AnnualCategory, AnnualMonth } from '@/features/reports/contract';

// Mirrors the full PT-BR month names used in dashboard/month-utils.ts. Kept
// local (not imported) because that array isn't exported and this feature
// must not modify files under dashboard/.
const FULL_MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export type AnnualMonthRowView = {
  month: string;
  label: string;
  hasSnapshot: boolean;
  status: 'OPEN' | 'CLOSED' | null;
  plannedIncome: string;
  actualIncome: string;
  plannedExpense: string;
  actualExpense: string;
};

export type AnnualCategoryView = {
  categoryId: string;
  name: string;
  color: string;
  actualCents: number;
};

function monthShortLabel(monthKey: string): string {
  const monthPart = monthKey.split('-')[1];
  const index = Number(monthPart) - 1;
  const fullName = FULL_MONTH_NAMES[index] ?? monthKey;
  return fullName.slice(0, 3);
}

export function toAnnualMonthRow(month: AnnualMonth): AnnualMonthRowView {
  return {
    month: month.month,
    label: monthShortLabel(month.month),
    hasSnapshot: month.hasSnapshot,
    status: month.status,
    plannedIncome: formatCurrencyCents(month.plannedIncomeCents),
    actualIncome: formatCurrencyCents(month.actualIncomeCents),
    plannedExpense: formatCurrencyCents(month.plannedExpenseCents),
    actualExpense: formatCurrencyCents(month.actualExpenseCents),
  };
}

export function toAnnualCategoryView(category: AnnualCategory, appearance?: CategoryAppearanceMap): AnnualCategoryView {
  return {
    categoryId: category.categoryId,
    name: category.name,
    color: resolveCategoryColor(category.categoryId, appearance),
    actualCents: category.actualCents,
  };
}
