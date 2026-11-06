import { useCallback, useMemo, useState } from 'react';

import { useCategoryAppearance } from '@/features/categories';
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
  showMonths: boolean;
  handlePrevYear: () => void;
  handleNextYear: () => void;
  handleToggleMonths: () => void;
}

export function useAnnualReportViewModel(): AnnualReportViewModel {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const summaryQuery = useAnnualSummary(year);

  const months = useMemo(
    () => (summaryQuery.data?.months ?? []).map(toAnnualMonthRow),
    [summaryQuery.data]
  );

  const categoryAppearanceQuery = useCategoryAppearance();

  const categories = useMemo(
    () => (summaryQuery.data?.categories ?? []).filter((category) => category.impactType === 'EXPENSE').map((category) => toAnnualCategoryView(category, categoryAppearanceQuery.data)),
    [summaryQuery.data, categoryAppearanceQuery.data]
  );

  const isEmpty = useMemo(() => {
    if (!summaryQuery.data) return false;
    const noSnapshots = summaryQuery.data.months.every((month) => !month.hasSnapshot);
    return noSnapshots && summaryQuery.data.categories.length === 0;
  }, [summaryQuery.data]);

  const handlePrevYear = useCallback(() => setYear((current) => current - 1), []);
  const handleNextYear = useCallback(() => setYear((current) => current + 1), []);
  const [showMonths, setShowMonths] = useState(false);
  const handleToggleMonths = useCallback(() => setShowMonths((current) => !current), []);

  return {
    showMonths,
    handleToggleMonths,
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
