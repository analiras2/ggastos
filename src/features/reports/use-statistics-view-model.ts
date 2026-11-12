import { useCallback, useMemo, useState } from 'react';

import type { ImpactType } from '@/shared/contracts/finance';
import { currentMonthKey, monthLabel, parseMonthKey, shiftMonthKey } from '@/shared/lib/month';
import { buildDonutSlices, type DonutSlice } from '@/features/reports/donut-slices';
import { toAnnualMonthRow, type AnnualMonthRowView } from '@/features/reports/format-annual-summary';
import { filterByImpactType, type StatisticsCategory } from '@/features/reports/statistics-categories';
import {
  quarterLabel,
  quarterOfMonth,
  shiftQuarter,
  type Quarter,
  type StatisticsPeriod,
} from '@/features/reports/statistics-period-rules';
import { useStatisticsData } from '@/features/reports/use-statistics-data';

export type ChartView = 'donut' | 'bars';
export type StatisticsImpactType = Extract<ImpactType, 'EXPENSE' | 'INCOME' | 'INVESTMENT'>;

export function useStatisticsViewModel() {
  const [period, setPeriod] = useState<StatisticsPeriod>('month');
  const [impactType, setImpactType] = useState<StatisticsImpactType>('EXPENSE');
  const [chartView, setChartView] = useState<ChartView>('bars');
  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const [quarter, setQuarter] = useState<Quarter>(() => quarterOfMonth(currentMonthKey()));
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [showMonths, setShowMonths] = useState(false);

  const data = useStatisticsData({ period, monthKey, quarter, year });

  const categories = useMemo<StatisticsCategory[]>(
    () => filterByImpactType(data.categories, impactType),
    [data.categories, impactType]
  );
  const slices = useMemo<DonutSlice[]>(() => buildDonutSlices(categories), [categories]);
  const totalCents = useMemo(() => categories.reduce((sum, category) => sum + category.actualCents, 0), [categories]);
  const yearMonths = useMemo<AnnualMonthRowView[]>(() => data.yearMonths.map(toAnnualMonthRow), [data.yearMonths]);

  const shift = useCallback(
    (delta: number) => {
      if (period === 'month') setMonthKey((current) => shiftMonthKey(current, delta));
      if (period === 'quarter') setQuarter((current) => shiftQuarter(current, delta));
      if (period === 'year') setYear((current) => current + delta);
    },
    [period]
  );

  const handleGoToCurrentMonth = useCallback(() => setMonthKey(currentMonthKey()), []);
  const handleToggleMonths = useCallback(() => setShowMonths((current) => !current), []);

  return {
    period,
    impactType,
    chartView,
    monthKey,
    monthTitle: monthLabel(monthKey),
    isCurrentMonth: monthKey === currentMonthKey(),
    periodLabel: period === 'year' ? String(year) : quarterLabel(quarter),
    selectedYear: period === 'month' ? parseMonthKey(monthKey).year : year,
    categories,
    slices,
    totalCents,
    yearMonths,
    showMonths,
    isLoading: data.isLoading,
    isError: data.isError,
    isEmpty: !data.isLoading && !data.isError && categories.length === 0,
    setPeriod,
    setImpactType,
    setChartView,
    handlePrevious: () => shift(-1),
    handleNext: () => shift(1),
    handleSelectMonth: setMonthKey,
    handleGoToCurrentMonth,
    handleToggleMonths,
  };
}

export type StatisticsViewModel = ReturnType<typeof useStatisticsViewModel>;
