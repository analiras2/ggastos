import type { AnnualCategoryView } from '@/features/reports/format-annual-summary';

export type CategorySortOrder = 'desc' | 'asc';

// Only categories with spending are charted; order decides which sits at the top.
export function sortAnnualCategories(
  categories: AnnualCategoryView[],
  order: CategorySortOrder
): AnnualCategoryView[] {
  const direction = order === 'desc' ? -1 : 1;

  return categories
    .filter((category) => category.actualCents > 0)
    .sort((a, b) => direction * (a.actualCents - b.actualCents));
}
