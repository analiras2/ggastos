import { describe, expect, it } from 'vitest';

import type { AnnualCategoryView } from '@/features/reports/format-annual-summary';
import { sortAnnualCategories } from '@/features/reports/sort-annual-categories';

const category = (categoryId: string, actualCents: number): AnnualCategoryView => ({
  categoryId,
  name: categoryId,
  color: '#000000',
  actualCents,
});

const categories = [category('a', 300), category('b', 900), category('c', 0), category('d', 100)];

describe('sortAnnualCategories', () => {
  it('puts the largest spend first by default order', () => {
    expect(sortAnnualCategories(categories, 'desc').map((item) => item.categoryId)).toEqual(['b', 'a', 'd']);
  });

  it('puts the smallest spend first in ascending order', () => {
    expect(sortAnnualCategories(categories, 'asc').map((item) => item.categoryId)).toEqual(['d', 'a', 'b']);
  });

  it('drops categories with no spending', () => {
    expect(sortAnnualCategories(categories, 'desc').some((item) => item.actualCents === 0)).toBe(false);
  });
});
