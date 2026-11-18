import { IMPACT_TYPE_LABELS, type ImpactType } from '@/shared/contracts/finance';

// A category that shows up under more than one entry type is told apart by a suffix.
export function categoryDisplayName(name: string, impactType: ImpactType, isSplit: boolean): string {
  return isSplit ? `${name} · ${IMPACT_TYPE_LABELS[impactType]}` : name;
}

// True for the categories that appear once per entry type in the same month.
export function splitCategoryIds(categories: { categoryId: string }[]): Set<string> {
  const seen = new Set<string>();
  const split = new Set<string>();
  for (const { categoryId } of categories) {
    if (seen.has(categoryId)) {
      split.add(categoryId);
    }
    seen.add(categoryId);
  }
  return split;
}
