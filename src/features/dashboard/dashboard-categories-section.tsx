import { TabbedSheet } from '@/shared/ui/cards/tabbed-sheet';
import { CategoryBudgetRow } from '@/shared/ui/rows/category-budget-row';
import type { CategoryBudget } from '@/features/dashboard/dashboard-data';

type DashboardCategoriesSectionProps = {
  categories: CategoryBudget[];
  onOpenCategory: (category: CategoryBudget) => void;
};

// A finished category shows only its total: "R$ 80,00 de R$ 80,00" would repeat the same number.
function isDone(category: CategoryBudget): boolean {
  return category.status !== null && category.status.value === null;
}

export function DashboardCategoriesSection({ categories, onOpenCategory }: DashboardCategoriesSectionProps) {
  return (
    <TabbedSheet title="Categorias">
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
