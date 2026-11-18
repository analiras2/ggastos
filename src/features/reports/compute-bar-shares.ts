import { PERCENT_FACTOR } from '@/shared/lib/percent';
import type { AnnualCategoryView } from '@/features/reports/format-annual-summary';

// Keeps a small category visible: its bar is never thinner than this.
const MIN_BAR_PERCENT = 2;

export type CategoryBar = {
  categoryId: string;
  name: string;
  color: string;
  actualCents: number;
  // Share of the total spending, rounded, for the label.
  sharePercent: number;
  // Width of the bar, relative to the largest category.
  barPercent: number;
};

export type CategoryBars = { totalCents: number; bars: CategoryBar[] };

// Spending total and, for each category, its share and bar width. Safe when nothing was spent.
export function computeBarShares(categories: AnnualCategoryView[]): CategoryBars {
  const totalCents = categories.reduce((sum, category) => sum + category.actualCents, 0);
  const largestCents = categories.reduce((max, category) => Math.max(max, category.actualCents), 0);

  const bars = categories.map((category) => ({
    ...category,
    sharePercent: totalCents > 0 ? Math.round((category.actualCents / totalCents) * PERCENT_FACTOR) : 0,
    barPercent:
      largestCents > 0 ? Math.max((category.actualCents / largestCents) * PERCENT_FACTOR, MIN_BAR_PERCENT) : 0,
  }));

  return { totalCents, bars };
}
