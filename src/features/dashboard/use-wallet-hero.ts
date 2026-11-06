import { useMemo } from 'react';

import { emptyDashboardData, formatDashboardData } from '@/features/dashboard/format-dashboard';
import type { DashboardData } from '@/features/dashboard/dashboard-data';
import { useMonthDashboard } from '@/features/dashboard/use-month-dashboard';
import { useMonthOpeningBalance } from '@/features/opening-balance';
import { currentMonthKey } from '@/shared/lib/month';

// Wallet shown at the top: always the current month, whichever month is being viewed.
export function useWalletHero(): DashboardData['hero'] {
  const monthKey = currentMonthKey();
  const dashboardQuery = useMonthDashboard(monthKey);
  const openingBalanceQuery = useMonthOpeningBalance(monthKey);
  const dashboard = dashboardQuery.data;
  const openingBalanceCents = openingBalanceQuery.data?.openingBalanceCents ?? 0;

  return useMemo(
    () =>
      dashboard
        ? formatDashboardData(dashboard, openingBalanceCents).hero
        : emptyDashboardData(monthKey).hero,
    [dashboard, openingBalanceCents, monthKey]
  );
}
