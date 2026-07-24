import { useCallback, useMemo, useState } from 'react';

import {
  toAnnualCategoryView,
  toAnnualMonthRow,
  type AnnualCategoryView,
  type AnnualMonthRowView,
} from '@/features/reports/format-annual-summary';
import { useAnnualSummary } from '@/features/reports/use-annual-summary';

interface AnnualReportViewModel {
  year: number;
  months: AnnualMonthRowView[];
  categories: AnnualCategoryView[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  handlePrevYear: () => void;
  handleNextYear: () => void;
}

export function useAnnualReportViewModel(): AnnualReportViewModel {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const summaryQuery = useAnnualSummary(year);

  const months = useMemo(
    () => (summaryQuery.data?.months ?? []).map(toAnnualMonthRow),
    [summaryQuery.data]
  );

  const categories = useMemo(
    () => (summaryQuery.data?.categories ?? []).map(toAnnualCategoryView),
    [summaryQuery.data]
  );

  const isEmpty = useMemo(() => {
    if (!summaryQuery.data) return false;
    const noSnapshots = summaryQuery.data.months.every((month) => !month.hasSnapshot);
    return noSnapshots && summaryQuery.data.categories.length === 0;
  }, [summaryQuery.data]);

  const handlePrevYear = useCallback(() => setYear((current) => current - 1), []);
  const handleNextYear = useCallback(() => setYear((current) => current + 1), []);

  return {
    year,
    months,
    categories,
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError,
    isEmpty,
    handlePrevYear,
    handleNextYear,
  };
}
