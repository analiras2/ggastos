import { useMemo, useState } from 'react';

import { computeBarShares } from '@/features/reports/compute-bar-shares';
import type { AnnualCategoryView } from '@/features/reports/format-annual-summary';
import { sortAnnualCategories, type CategorySortOrder } from '@/features/reports/sort-annual-categories';

// The sorted bars of the spending per category and the sort order the user picked.
export function useAnnualBars(categories: AnnualCategoryView[]) {
  const [order, setOrder] = useState<CategorySortOrder>('desc');
  const { totalCents, bars } = useMemo(
    () => computeBarShares(sortAnnualCategories(categories, order)),
    [categories, order]
  );
  const isDescending = order === 'desc';

  return {
    totalCents,
    bars,
    isDescending,
    sortLabel: isDescending ? 'Ordenar do menor para o maior' : 'Ordenar do maior para o menor',
    toggleOrder: () => setOrder(isDescending ? 'asc' : 'desc'),
  };
}
