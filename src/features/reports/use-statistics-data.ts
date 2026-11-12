import { resolveCategoryColor, useCategoryAppearance } from '@/features/categories';
import { useMonthDashboards } from '@/features/dashboard';
import type { AnnualMonth } from '@/features/reports/contract';
import {
  mergeStatisticsCategories,
  type StatisticsCategory,
} from '@/features/reports/statistics-categories';
import { monthsOfQuarter, type Quarter, type StatisticsPeriod } from '@/features/reports/statistics-period-rules';
import { useAnnualSummary } from '@/features/reports/use-annual-summary';

type StatisticsSelection = { period: StatisticsPeriod; monthKey: string; quarter: Quarter; year: number };

export type StatisticsData = {
  categories: StatisticsCategory[];
  // The twelve months of the year, only filled for the yearly view.
  yearMonths: AnnualMonth[];
  isLoading: boolean;
  isError: boolean;
};

// Realized amounts per category for the chosen period: a month, the three months of a quarter, or a year.
export function useStatisticsData({ period, monthKey, quarter, year }: StatisticsSelection): StatisticsData {
  const appearanceQuery = useCategoryAppearance();
  const annualQuery = useAnnualSummary(year);
  const dashboardMonths = period === 'month' ? [monthKey] : period === 'quarter' ? monthsOfQuarter(quarter) : [];
  const dashboardQueries = useMonthDashboards(dashboardMonths);
  const appearance = appearanceQuery.data;

  const monthlyData = dashboardQueries.map((query) => query.data);
  const annualData = annualQuery.data;

  const toCategory = (item: { categoryId: string; impactType: StatisticsCategory['impactType']; name: string; actualCents: number }): StatisticsCategory => ({
    categoryId: item.categoryId,
    impactType: item.impactType,
    name: item.name,
    color: resolveCategoryColor(item.categoryId, appearance),
    actualCents: item.actualCents,
  });

  // Cheap to recompute: at most a few dozen rows.
  const categories =
    period === 'year'
      ? (annualData?.categories ?? []).map(toCategory)
      : mergeStatisticsCategories(monthlyData.map((data) => (data?.categories ?? []).map(toCategory)));

  const activeQueries = period === 'year' ? [annualQuery] : dashboardQueries;

  return {
    categories,
    yearMonths: annualData?.months ?? [],
    isLoading: activeQueries.some((query) => query.isLoading),
    isError: activeQueries.some((query) => query.isError),
  };
}
