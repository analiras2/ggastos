import { useCallback, useMemo, useState } from 'react';

import type { CategoryBudget, DashboardData } from '@/features/dashboard/dashboard-data';
import { emptyDashboardData, formatDashboardData } from '@/features/dashboard/format-dashboard';
import {
  formatCategoryDetails,
  type CategoryDetailsView,
} from '@/features/dashboard/format-category-details';
import { currentMonthKey, shiftMonthKey } from '@/features/dashboard/month-utils';
import { useCategoryDetails } from '@/features/dashboard/use-category-details';
import { useMonthDashboard } from '@/features/dashboard/use-month-dashboard';
import {
  getFormattedSyncError,
  useLatestSyncEvent,
  useSyncPluggy,
} from '@/features/dashboard/use-sync-pluggy';

interface CategoryDetailsPanel {
  visible: boolean;
  isLoading: boolean;
  isError: boolean;
  details: CategoryDetailsView | null;
}

interface DashboardViewModel {
  data: DashboardData;
  isSyncing: boolean;
  syncBanner: {
    state: 'ok' | 'pending' | 'error';
    message: string;
    actionLabel?: string;
  };
  categoryDetails: CategoryDetailsPanel;
  isAddPlanVisible: boolean;
  handleSync: () => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleOpenCategory: (category: CategoryBudget) => void;
  handleCloseCategoryDetails: () => void;
  handleAddPlan: () => void;
  handleCloseAddPlan: () => void;
}

export function useDashboardViewModel(): DashboardViewModel {
  const [monthKey, setMonthKey] = useState<string>(currentMonthKey);
  const [selectedCategory, setSelectedCategory] = useState<CategoryBudget | null>(null);
  const [isAddPlanVisible, setIsAddPlanVisible] = useState(false);
  const monthDashboardQuery = useMonthDashboard(monthKey);
  const latestSyncEventQuery = useLatestSyncEvent();
  const syncMutation = useSyncPluggy();
  const categoryDetailsQuery = useCategoryDetails(monthKey, selectedCategory?.categoryId ?? null);

  const categoryDetails = useMemo<CategoryDetailsPanel>(
    () => ({
      visible: selectedCategory !== null,
      isLoading: categoryDetailsQuery.isLoading,
      isError: categoryDetailsQuery.isError,
      details: categoryDetailsQuery.data ? formatCategoryDetails(categoryDetailsQuery.data) : null,
    }),
    [
      selectedCategory,
      categoryDetailsQuery.isLoading,
      categoryDetailsQuery.isError,
      categoryDetailsQuery.data,
    ]
  );

  const data = useMemo<DashboardData>(() => {
    if (monthDashboardQuery.data) {
      return formatDashboardData(monthDashboardQuery.data);
    }
    return emptyDashboardData(monthKey);
  }, [monthDashboardQuery.data, monthKey]);

  const syncBanner = useMemo(() => {
    if (syncMutation.isPending) {
      return {
        state: 'pending' as const,
        message: 'Solicitando sincronização manual...',
      };
    }

    if (syncMutation.isError) {
      return {
        state: 'error' as const,
        message: getFormattedSyncError(syncMutation.error),
        actionLabel: 'Tentar de novo',
      };
    }

    if (monthDashboardQuery.isLoading) {
      return {
        state: 'pending' as const,
        message: 'Carregando o mês...',
      };
    }

    if (monthDashboardQuery.isError) {
      return {
        state: 'error' as const,
        message: 'Não foi possível carregar os dados do mês.',
        actionLabel: 'Tentar de novo',
      };
    }

    if (latestSyncEventQuery.isError) {
      return {
        state: 'error' as const,
        message: 'Não foi possível consultar o último evento de sync.',
        actionLabel: 'Atualizar',
      };
    }

    if (latestSyncEventQuery.data) {
      const event = latestSyncEventQuery.data;
      const receivedAt = new Date(event.receivedAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (event.processingStatus === 'FAILED') {
        return {
          state: 'error' as const,
          message: `Último sync falhou às ${receivedAt}.`,
          actionLabel: 'Tentar de novo',
        };
      }

      if (event.processingStatus === 'RECEIVED') {
        return {
          state: 'pending' as const,
          message: `Último sync solicitado às ${receivedAt}.`,
          actionLabel: 'Sincronizar',
        };
      }

      return {
        state: 'ok' as const,
        message: `Último sync concluído às ${receivedAt}.`,
        actionLabel: 'Sincronizar',
      };
    }

    return {
      state: 'ok' as const,
      message: 'Nenhuma sincronização manual executada ainda.',
      actionLabel: 'Sincronizar',
    };
  }, [
    latestSyncEventQuery.data,
    latestSyncEventQuery.isError,
    monthDashboardQuery.isError,
    monthDashboardQuery.isLoading,
    syncMutation.error,
    syncMutation.isError,
    syncMutation.isPending,
  ]);

  const handleSync = useCallback(() => {
    syncMutation.mutate();
  }, [syncMutation]);

  const handlePrevMonth = useCallback(() => {
    setMonthKey((current) => shiftMonthKey(current, -1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonthKey((current) => shiftMonthKey(current, 1));
  }, []);

  const handleOpenCategory = useCallback((category: CategoryBudget) => {
    setSelectedCategory(category);
  }, []);

  const handleCloseCategoryDetails = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  const handleAddPlan = useCallback(() => {
    setIsAddPlanVisible(true);
  }, []);

  const handleCloseAddPlan = useCallback(() => {
    setIsAddPlanVisible(false);
  }, []);

  return {
    data,
    isSyncing: syncMutation.isPending,
    syncBanner,
    categoryDetails,
    isAddPlanVisible,
    handleSync,
    handlePrevMonth,
    handleNextMonth,
    handleOpenCategory,
    handleCloseCategoryDetails,
    handleAddPlan,
    handleCloseAddPlan,
  };
}
