import type { ImpactType } from '@/shared/contracts/finance';

// A category's realized amount for one entry type, in any period.
export type StatisticsCategory = {
  categoryId: string;
  impactType: ImpactType;
  name: string;
  color: string;
  actualCents: number;
};

// Sums the same category and type across several months.
export function mergeStatisticsCategories(groups: StatisticsCategory[][]): StatisticsCategory[] {
  const merged = new Map<string, StatisticsCategory>();

  for (const category of groups.flat()) {
    const key = `${category.categoryId}:${category.impactType}`;
    const existing = merged.get(key);
    merged.set(key, existing ? { ...existing, actualCents: existing.actualCents + category.actualCents } : category);
  }

  return [...merged.values()];
}

// Only what was actually spent/received counts, so empty and negative rows are dropped.
export function filterByImpactType(categories: StatisticsCategory[], impactType: ImpactType): StatisticsCategory[] {
  return categories.filter((category) => category.impactType === impactType && category.actualCents > 0);
}
