import { describe, expect, it } from 'vitest';

import { categoryDisplayName, splitCategoryIds } from '@/features/dashboard/category-display-name';

describe('categoryDisplayName', () => {
  it('keeps the name when the category has a single type', () => {
    expect(categoryDisplayName('Mercado', 'EXPENSE', false)).toBe('Mercado');
  });

  it('adds the type when the category is split by entry type', () => {
    expect(categoryDisplayName('Mercado', 'INCOME', true)).toBe('Mercado · Receita');
  });
});

describe('splitCategoryIds', () => {
  it('finds the categories listed more than once', () => {
    const rows = [{ categoryId: 'a' }, { categoryId: 'b' }, { categoryId: 'a' }];

    expect([...splitCategoryIds(rows)]).toEqual(['a']);
  });

  it('is empty when every category appears once', () => {
    expect(splitCategoryIds([{ categoryId: 'a' }, { categoryId: 'b' }]).size).toBe(0);
  });
});
