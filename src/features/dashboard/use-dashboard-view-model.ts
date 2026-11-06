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
import { useWalletPanel } from '@/features/dashboard/use-wallet-panel';

export function useDashboardViewModel(): DashboardViewModel {
  const [monthKey, setMonthKey] = useState<string>(currentMonthKey);
  const monthDashboardQuery = useMonthDashboard(monthKey);
  const categoryAppearanceQuery = useCategoryAppearance();
  const monthSnapshotQuery = useMonthSnapshot(monthKey);
  const sheets = useDashboardSheets();
  const { categoryDetails, handleOpenCategory, handleCloseCategoryDetails } =
    useCategoryDetailsPanel(monthKey);
  const { closeMonthBanner, isClosingMonth, handleCloseMonth } = useCloseMonthBanner(
    monthKey,
    monthDashboardQuery.data?.summary.openExpenseCents ?? 0
  );
  const walletPanel = useWalletPanel(handleCloseMonth);

  const data = useMemo<DashboardData>(() => {
    if (monthDashboardQuery.data) {
      return formatDashboardData(monthDashboardQuery.data, categoryAppearanceQuery.data);
    }
    return emptyDashboardData(monthKey);
  }, [monthDashboardQuery.data, categoryAppearanceQuery.data, monthKey]);

  const loadStatus: DashboardViewModel['loadStatus'] = monthDashboardQuery.isLoading
    ? 'loading'
    : monthDashboardQuery.isError
      ? 'error'
      : 'ready';

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
    loadStatus,
    categoryDetails,
    isCurrentMonth: monthKey === currentMonthKey(),
    canCloseMonth: monthKey <= currentMonthKey(),
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
    ...walletPanel,
    handleCloseMonth: walletPanel.handleRequestCloseMonth,
  };
}
