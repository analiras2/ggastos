import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { TabbedSheet } from '@/shared/ui/cards/tabbed-sheet';
import { CategoryBudgetRow } from '@/shared/ui/rows/category-budget-row';
import { GgastosColors } from '@/shared/theme/ggastos-theme';
import type { CategoryBudget } from '@/features/dashboard/dashboard-data';
import { uncategorizedCountLabel, type UncategorizedSummary } from '@/features/dashboard/uncategorized';

type DashboardCategoriesSectionProps = {
  categories: CategoryBudget[];
  onOpenCategory: (category: CategoryBudget) => void;
  // Purchases with no category yet; they get their own row at the top so none is lost.
  uncategorized: UncategorizedSummary | null;
  onOpenUncategorized: () => void;
};

// A finished category shows only its total: "R$ 80,00 de R$ 80,00" would repeat the same number.
function isDone(category: CategoryBudget): boolean {
  return category.status !== null && category.status.value === null;
}

export function DashboardCategoriesSection({
  categories,
  onOpenCategory,
  uncategorized,
  onOpenUncategorized,
}: DashboardCategoriesSectionProps) {
  return (
    <TabbedSheet title="Categorias">
      {uncategorized ? (
        <CategoryBudgetRow
          name="Sem categoria"
          icon="circle"
          color={GgastosColors.inkFaint}
          actual={formatCurrencyCents(uncategorized.totalCents)}
          status={{ label: 'Definir categoria', value: uncategorizedCountLabel(uncategorized.count), tone: 'neutral' }}
          onPress={onOpenUncategorized}
        />
      ) : null}
      {categories.map((category) => (
        <CategoryBudgetRow
          key={`${category.categoryId}:${category.impactType}`}
          name={category.name}
          icon={category.icon}
          color={category.color}
          planned={isDone(category) ? null : category.planned}
          actual={category.actual}
          status={category.status}
          progress={category.progress}
          onPress={() => onOpenCategory(category)}
        />
      ))}
    </TabbedSheet>
  );
}
