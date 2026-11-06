import { useCallback, useMemo, useState } from 'react';

import { useCategoryAppearance } from '@/features/categories';
import { useMonthSnapshot } from '@/features/closing';
import type { DashboardData } from '@/features/dashboard/dashboard-data';
import type { DashboardViewModel } from '@/features/dashboard/dashboard-view-model-types';
import { emptyDashboardData, formatDashboardData } from '@/features/dashboard/format-dashboard';
import { currentMonthKey, shiftMonthKey } from '@/shared/lib/month';
import { useCategoryDetailsPanel } from '@/features/dashboard/use-category-details-panel';
import { useCloseMonthBanner } from '@/features/dashboard/use-close-month-banner';
import { useDashboardSheets } from '@/features/dashboard/use-dashboard-sheets';
import { useMonthDashboard } from '@/features/dashboard/use-month-dashboard';
import { useMonthOpeningBalance } from '@/features/opening-balance';

export function useDashboardViewModel(): DashboardViewModel {
  const [monthKey, setMonthKey] = useState<string>(currentMonthKey);
  const monthDashboardQuery = useMonthDashboard(monthKey);
  const openingBalanceQuery = useMonthOpeningBalance(monthKey);
  const categoryAppearanceQuery = useCategoryAppearance();
  const monthSnapshotQuery = useMonthSnapshot(monthKey);
  const sheets = useDashboardSheets();
  const { categoryDetails, handleOpenCategory, handleCloseCategoryDetails } =
    useCategoryDetailsPanel(monthKey);
  const { closeMonthBanner, isClosingMonth, handleCloseMonth } = useCloseMonthBanner(
    monthKey,
    monthDashboardQuery.data?.summary.openExpenseCents ?? 0
  );

  const data = useMemo<DashboardData>(() => {
    if (monthDashboardQuery.data) {
      return formatDashboardData(
        monthDashboardQuery.data,
        openingBalanceQuery.data?.openingBalanceCents ?? 0,
        categoryAppearanceQuery.data
      );
    }
    return emptyDashboardData(monthKey);
  }, [monthDashboardQuery.data, openingBalanceQuery.data?.openingBalanceCents, categoryAppearanceQuery.data, monthKey]);

  const importBanner = useMemo(() => {
    if (monthDashboardQuery.isLoading) {
      return { state: 'pending' as const, message: 'Carregando o mês...' };
    }

    if (monthDashboardQuery.isError) {
      return { state: 'error' as const, message: 'Não foi possível carregar os dados do mês.' };
    }

    return {
      state: 'ok' as const,
      message: 'Importe a fatura do cartão para atualizar os gastos realizados.',
      actionLabel: 'Importar CSV',
    };
  }, [monthDashboardQuery.isError, monthDashboardQuery.isLoading]);

  const handlePrevMonth = useCallback(() => setMonthKey((current) => shiftMonthKey(current, -1)), []);
  const handleNextMonth = useCallback(() => setMonthKey((current) => shiftMonthKey(current, 1)), []);
  const handleGoToCurrentMonth = useCallback(() => setMonthKey(currentMonthKey()), []);
  const handleSelectMonth = useCallback((selectedMonthKey: string) => setMonthKey(selectedMonthKey), []);

  const { handleCloseSearch } = sheets;
  const handleSelectSearchCategory = useCallback(
    (categoryId: string) => {
      const category = data.categories.find((item) => item.categoryId === categoryId);
      handleCloseSearch();
      if (category) {
        handleOpenCategory(category);
      }
    },
    [data.categories, handleCloseSearch, handleOpenCategory]
  );

  return {
    ...sheets,
    data,
    monthKey,
    importBanner,
    categoryDetails,
    isCurrentMonth: monthKey === currentMonthKey(),
    isMonthClosed: monthSnapshotQuery.data?.status === 'CLOSED',
    isClosingMonth,
    closeMonthBanner,
    handlePrevMonth,
    handleNextMonth,
    handleGoToCurrentMonth,
    handleSelectMonth,
    handleOpenCategory,
    handleCloseCategoryDetails,
    handleSelectSearchCategory,
    handleCloseMonth,
  };
}
