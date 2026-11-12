import type { StatisticsCategory } from '@/features/reports/statistics-categories';

export type DonutSlice = {
  id: string;
  name: string;
  color: string;
  cents: number;
  fraction: number;
  startDegrees: number;
  endDegrees: number;
};

export const MAX_DONUT_SLICES = 8;
export const OTHERS_SLICE_ID = 'others';
const OTHERS_LABEL = 'Outros';
const OTHERS_COLOR = '#9A8F84';
const FULL_CIRCLE_DEGREES = 360;

// Largest categories first; everything past the limit is folded into one "Outros" slice.
export function buildDonutSlices(categories: StatisticsCategory[]): DonutSlice[] {
  const sorted = [...categories].sort((first, second) => second.actualCents - first.actualCents);
  const total = sorted.reduce((sum, category) => sum + category.actualCents, 0);
  if (total <= 0) {
    return [];
  }

  const visible = sorted.slice(0, MAX_DONUT_SLICES);
  const rest = sorted.slice(MAX_DONUT_SLICES);
  const entries = visible.map((category) => ({
    id: `${category.categoryId}:${category.impactType}`,
    name: category.name,
    color: category.color,
    cents: category.actualCents,
  }));
  if (rest.length > 0) {
    const restCents = rest.reduce((sum, category) => sum + category.actualCents, 0);
    entries.push({ id: OTHERS_SLICE_ID, name: OTHERS_LABEL, color: OTHERS_COLOR, cents: restCents });
  }

  let cursor = 0;
  return entries.map((entry) => {
    const fraction = entry.cents / total;
    const startDegrees = cursor;
    cursor += fraction * FULL_CIRCLE_DEGREES;
    return { ...entry, fraction, startDegrees, endDegrees: cursor };
  });
}
