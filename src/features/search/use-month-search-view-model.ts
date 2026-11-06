import { useCallback, useMemo, useState } from 'react';

import type { EntryKind } from '@/constants/ggastos-theme';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import { paymentMethodLabel } from '@/features/planning/paid-entry-rules';
import { formatIsoDateToBrazilian } from '@/features/planning/planning-form-utils';
import type { ImpactType } from '@/features/planning/planning-schema';
import { useCategories } from '@/features/planning/use-categories';
import { matchesSearch, normalizeSearchText } from '@/features/search/search-text';
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

    return (itemsQuery.data ?? [])
      .filter((item) => matchesSearch(item.title, normalizedQuery))
      .map((item): MonthSearchResult => {
        const category = item.categoryId ? categories.get(item.categoryId) : undefined;
        return {
          id: `${item.source}-${item.id}`,
          categoryId: item.categoryId,
          title: item.title,
          category: category?.name ?? NO_CATEGORY_LABEL,
          amount: formatCurrencyCents(item.amountCents),
          kind: category ? KIND_BY_IMPACT[category.impactType] : 'despesa',
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
