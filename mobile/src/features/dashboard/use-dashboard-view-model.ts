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
import { usePlannedEntryStatusToggle } from '@/features/dashboard/use-planned-entry-status-toggle';
import {
  getFormattedSyncError,
  useLatestSyncEvent,
  useSyncPluggy,
} from '@/features/dashboard/use-sync-pluggy';
import { getFormattedCloseMonthError, useCloseMonth } from '@/features/closing/use-close-month';

interface CategoryDetailsPanel {
  visible: boolean;
  isLoading: boolean;
  isError: boolean;
  details: CategoryDetailsView | null;
  togglingEntryId: string | null;
  onToggleEntryStatus: (entryId: string, isUndo: boolean) => void;
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
  isAddTemplateVisible: boolean;
  isCurrentMonth: boolean;
  isClosingMonth: boolean;
  closeMonthBanner: { state: 'ok' | 'pending' | 'error'; message: string } | null;
  handleSync: () => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleGoToCurrentMonth: () => void;
  handleOpenCategory: (category: CategoryBudget) => void;
  handleCloseCategoryDetails: () => void;
  handleAddPlan: () => void;
  handleCloseAddPlan: () => void;
  handleAddTemplate: () => void;
  handleCloseAddTemplate: () => void;
  handleCloseMonth: () => void;
}

export function useDashboardViewModel(): DashboardViewModel {
  const [monthKey, setMonthKey] = useState<string>(currentMonthKey);
  const [selectedCategory, setSelectedCategory] = useState<CategoryBudget | null>(null);
  const [isAddPlanVisible, setIsAddPlanVisible] = useState(false);
  const [isAddTemplateVisible, setIsAddTemplateVisible] = useState(false);
  const monthDashboardQuery = useMonthDashboard(monthKey);
  const latestSyncEventQuery = useLatestSyncEvent();
  const syncMutation = useSyncPluggy();
  const closeMonthMutation = useCloseMonth();
  const categoryDetailsQuery = useCategoryDetails(monthKey, selectedCategory?.categoryId ?? null);
  const { togglingEntryId, handleToggleStatus } = usePlannedEntryStatusToggle(
    monthKey,
    selectedCategory?.categoryId ?? null
  );

  const categoryDetails = useMemo<CategoryDetailsPanel>(
    () => ({
      visible: selectedCategory !== null,
      isLoading: categoryDetailsQuery.isLoading,
      isError: categoryDetailsQuery.isError,
      details: categoryDetailsQuery.data ? formatCategoryDetails(categoryDetailsQuery.data) : null,
      togglingEntryId,
      onToggleEntryStatus: handleToggleStatus,
    }),
    [
      selectedCategory,
      categoryDetailsQuery.isLoading,
      categoryDetailsQuery.isError,
      categoryDetailsQuery.data,
      togglingEntryId,
      handleToggleStatus,
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

  const closeMonthBanner = useMemo(() => {
    if (closeMonthMutation.isPending) {
      return { state: 'pending' as const, message: 'Fechando o mês...' };
    }

    if (closeMonthMutation.isError) {
      return { state: 'error' as const, message: getFormattedCloseMonthError(closeMonthMutation.error) };
    }

    if (closeMonthMutation.isSuccess) {
      return { state: 'ok' as const, message: 'Mês fechado. O snapshot pode ser recalculado a qualquer momento.' };
    }

    return null;
  }, [closeMonthMutation.isPending, closeMonthMutation.isError, closeMonthMutation.error, closeMonthMutation.isSuccess]);

  const handleSync = useCallback(() => {
    syncMutation.mutate();
  }, [syncMutation]);

  const handleCloseMonth = useCallback(() => {
    closeMonthMutation.mutate(monthKey);
  }, [closeMonthMutation, monthKey]);

  const handlePrevMonth = useCallback(() => {
    setMonthKey((current) => shiftMonthKey(current, -1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonthKey((current) => shiftMonthKey(current, 1));
  }, []);

  const handleGoToCurrentMonth = useCallback(() => {
    setMonthKey(currentMonthKey());
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

  const handleAddTemplate = useCallback(() => {
    setIsAddTemplateVisible(true);
  }, []);

  const handleCloseAddTemplate = useCallback(() => {
    setIsAddTemplateVisible(false);
  }, []);

  return {
    data,
    isSyncing: syncMutation.isPending,
    syncBanner,
    categoryDetails,
    isAddPlanVisible,
    isAddTemplateVisible,
    isCurrentMonth: monthKey === currentMonthKey(),
    isClosingMonth: closeMonthMutation.isPending,
    closeMonthBanner,
    handleSync,
    handlePrevMonth,
    handleNextMonth,
    handleGoToCurrentMonth,
    handleOpenCategory,
    handleCloseCategoryDetails,
    handleAddPlan,
    handleCloseAddPlan,
    handleAddTemplate,
    handleCloseAddTemplate,
    handleCloseMonth,
  };
}
