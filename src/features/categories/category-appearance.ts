import { categoryColor } from '@/constants/category-colors';

export type CategoryAppearance = { icon: string | null; color: string | null };
export type CategoryAppearanceMap = Record<string, CategoryAppearance>;

// Stored color wins; otherwise the stable color derived from the id.
export function resolveCategoryColor(categoryId: string, appearance?: CategoryAppearanceMap): string {
  return appearance?.[categoryId]?.color ?? categoryColor(categoryId);
}

export function resolveCategoryIcon(
  categoryId: string,
  fallbackIcon: string,
  appearance?: CategoryAppearanceMap
): string {
  return appearance?.[categoryId]?.icon ?? fallbackIcon;
}
