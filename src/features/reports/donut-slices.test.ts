import { describe, expect, it } from 'vitest';

import { buildDonutSlices, MAX_DONUT_SLICES, OTHERS_SLICE_ID } from '@/features/reports/donut-slices';
import {
  filterByImpactType,
  mergeStatisticsCategories,
  type StatisticsCategory,
} from '@/features/reports/statistics-categories';

const category = (categoryId: string, actualCents: number, impactType: StatisticsCategory['impactType'] = 'EXPENSE'): StatisticsCategory => ({
  categoryId,
  impactType,
  name: categoryId,
  color: '#000000',
  actualCents,
});

describe('donut slices', () => {
  it('orders by amount and covers the full circle', () => {
    const slices = buildDonutSlices([category('a', 100), category('b', 300)]);

    expect(slices.map((slice) => slice.name)).toEqual(['b', 'a']);
    expect(slices[0].fraction).toBeCloseTo(0.75);
    expect(slices[0].startDegrees).toBe(0);
    expect(slices[1].endDegrees).toBeCloseTo(360);
  });

  it('returns nothing when there is no amount', () => {
    expect(buildDonutSlices([])).toEqual([]);
    expect(buildDonutSlices([category('a', 0)])).toEqual([]);
  });

  it('folds the smallest categories into one "Outros" slice', () => {
    const categories = Array.from({ length: MAX_DONUT_SLICES + 2 }, (_, index) => category(`c${index}`, 1000 - index));
    const slices = buildDonutSlices(categories);

    expect(slices).toHaveLength(MAX_DONUT_SLICES + 1);
    const others = slices[slices.length - 1];
    expect(others.id).toBe(OTHERS_SLICE_ID);
    expect(others.cents).toBe(1000 - MAX_DONUT_SLICES + (1000 - MAX_DONUT_SLICES - 1));
  });
});

describe('statistics categories', () => {
  it('sums the same category across months', () => {
    const merged = mergeStatisticsCategories([[category('a', 100)], [category('a', 50), category('b', 10)]]);

    expect(merged).toHaveLength(2);
    expect(merged.find((item) => item.categoryId === 'a')?.actualCents).toBe(150);
  });

  it('keeps the same category apart per entry type', () => {
    const merged = mergeStatisticsCategories([[category('a', 100, 'EXPENSE'), category('a', 40, 'INCOME')]]);

    expect(merged).toHaveLength(2);
  });

  it('filters by type and drops empty rows', () => {
    const filtered = filterByImpactType([category('a', 100), category('b', 0), category('c', 30, 'INCOME')], 'EXPENSE');

    expect(filtered.map((item) => item.categoryId)).toEqual(['a']);
  });
});
