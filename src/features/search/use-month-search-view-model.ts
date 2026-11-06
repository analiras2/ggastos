import { useCallback, useMemo, useState } from 'react';

import type { EntryKind } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { paymentMethodLabel } from '@/features/planned-entries';
import { formatIsoDateToBrazilian } from '@/shared/lib/form-utils';
import type { ImpactType } from '@/shared/contracts/finance';
import { useCategories } from '@/features/categories';
import { matchesSearch, normalizeSearchText } from '@/shared/lib/search-text';
import { useMonthSearchItems, type MonthSearchItem } from '@/features/search/use-month-search-items';

const KIND_BY_IMPACT: Record<ImpactType, EntryKind> = {
  INCOME: 'receita',
  EXPENSE: 'despesa',
  INVESTMENT: 'investimento',
  TRANSFER: 'transferencia',
};

const NO_CATEGORY_LABEL = 'Sem categoria';
const PLANNED_LABEL = 'Previsto';
const NO_DATE_LABEL = 'Sem data';

export type MonthSearchResult = {
  id: string;
  categoryId: string | null;
  title: string;
  category: string;
  amount: string;
  kind: EntryKind;
  date: string;
};

interface MonthSearchViewModel {
  query: string;
  setQuery: (value: string) => void;
  results: MonthSearchResult[];
  hasQuery: boolean;
  isLoading: boolean;
  isError: boolean;
}

function formatItemDate(item: MonthSearchItem): string {
  if (!item.date) {
    return NO_DATE_LABEL;
  }
  const isoDate = item.date.slice(0, 10);
  return formatIsoDateToBrazilian(isoDate);
}

function withDetails(item: MonthSearchItem): string {
  const parts = [item.source === 'PLANNED' ? PLANNED_LABEL : null, formatItemDate(item), paymentMethodLabel(item.paymentMethod)];
  return parts.filter(Boolean).join(' · ');
}

export function useMonthSearchViewModel(month: string, visible: boolean): MonthSearchViewModel {
  const [query, setQueryState] = useState('');
  const itemsQuery = useMonthSearchItems(month, visible);
  const categoriesQuery = useCategories();
  const normalizedQuery = normalizeSearchText(query);

  const setQuery = useCallback((value: string) => setQueryState(value), []);

  const results = useMemo(() => {
    const categories = new Map((categoriesQuery.data ?? []).map((category) => [category.id, category]));

    // Manually created entries can have no title (it is filled in by the import), so they
    // are found and shown by their category name instead.
    const displayTitle = (item: MonthSearchItem) =>
      item.title?.trim() || (item.categoryId ? categories.get(item.categoryId)?.name : undefined) || NO_CATEGORY_LABEL;

    return (itemsQuery.data ?? [])
      .filter((item) => matchesSearch(displayTitle(item), normalizedQuery))
      .map((item): MonthSearchResult => {
        const category = item.categoryId ? categories.get(item.categoryId) : undefined;
        return {
          id: `${item.source}-${item.id}`,
          categoryId: item.categoryId,
          title: displayTitle(item),
          category: category?.name ?? NO_CATEGORY_LABEL,
          amount: formatCurrencyCents(item.amountCents),
          kind: KIND_BY_IMPACT[item.impactType ?? category?.impactType ?? 'EXPENSE'],
          date: withDetails(item),
        };
      });
  }, [itemsQuery.data, categoriesQuery.data, normalizedQuery]);

  return {
    query,
    setQuery,
    results,
    hasQuery: normalizedQuery.length > 0,
    isLoading: itemsQuery.isLoading,
    isError: itemsQuery.isError,
  };
}
