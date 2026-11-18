import { describe, expect, it } from 'vitest';

import {
  filterByImpactType,
  mergeStatisticsCategories,
  type StatisticsCategory,
} from '@/features/reports/statistics-categories';

const category = (
  categoryId: string,
  impactType: StatisticsCategory['impactType'],
  actualCents: number
): StatisticsCategory => ({ categoryId, impactType, name: categoryId, color: '#000000', actualCents });

describe('mergeStatisticsCategories', () => {
  it('sums the same category and type across months', () => {
    const merged = mergeStatisticsCategories([
      [category('food', 'EXPENSE', 100), category('pay', 'INCOME', 500)],
      [category('food', 'EXPENSE', 250)],
    ]);

    expect(merged).toHaveLength(2);
    expect(merged.find((item) => item.categoryId === 'food')?.actualCents).toBe(350);
  });

  it('keeps the same category apart when the entry type differs', () => {
    const merged = mergeStatisticsCategories([[category('misc', 'EXPENSE', 10)], [category('misc', 'INCOME', 20)]]);

    expect(merged).toHaveLength(2);
  });

  it('does not change the input groups', () => {
    const first = category('food', 'EXPENSE', 100);

    mergeStatisticsCategories([[first], [category('food', 'EXPENSE', 50)]]);

    expect(first.actualCents).toBe(100);
  });
});

describe('filterByImpactType', () => {
  it('keeps only the chosen type with something actually spent or received', () => {
    const result = filterByImpactType(
      [category('a', 'EXPENSE', 100), category('b', 'EXPENSE', 0), category('c', 'EXPENSE', -5), category('d', 'INCOME', 9)],
      'EXPENSE'
    );

    expect(result.map((item) => item.categoryId)).toEqual(['a']);
  });
});
