import type { ImpactType } from '@/shared/contracts/finance';

const IMPACT_LABELS: Record<ImpactType, string> = {
  EXPENSE: 'Despesa',
  INCOME: 'Receita',
  INVESTMENT: 'Investimento',
  TRANSFER: 'Transferência',
};

// A category that shows up under more than one entry type is told apart by a suffix.
export function categoryDisplayName(name: string, impactType: ImpactType, isSplit: boolean): string {
  return isSplit ? `${name} · ${IMPACT_LABELS[impactType]}` : name;
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
