import { useCallback, useMemo, useState } from 'react';

import { MOCK_DASHBOARD_DATA } from '@/features/dashboard/dashboard-data';
import type { CategoryBudget, DashboardData } from '@/features/dashboard/dashboard-data';
import {
  getFormattedSyncError,
  useLatestSyncEvent,
  useSyncPluggy,
} from '@/features/dashboard/use-sync-pluggy';

interface DashboardViewModel {
  data: DashboardData;
  isSyncing: boolean;
  syncBanner: {
    state: 'ok' | 'pending' | 'error';
    message: string;
    actionLabel?: string;
  };
  handleSync: () => void;
  handleOpenCategory: (category: CategoryBudget) => void;
  handleAddPlan: () => void;
  handleReview: () => void;
}

export function useDashboardViewModel(): DashboardViewModel {
  const [data] = useState<DashboardData>(MOCK_DASHBOARD_DATA);
  const latestSyncEventQuery = useLatestSyncEvent();
  const syncMutation = useSyncPluggy();

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
    syncMutation.error,
    syncMutation.isError,
    syncMutation.isPending,
  ]);

  const handleSync = useCallback(() => {
    syncMutation.mutate();
  }, [syncMutation]);

  const handleOpenCategory = useCallback((_category: CategoryBudget) => {
    // Navigation to category detail wires up once expo-router routes exist for it.
  }, []);

  const handleAddPlan = useCallback(() => {
    // Opens the planning bottom sheet once the planning feature is implemented.
  }, []);

  const handleReview = useCallback(() => {
    // Navigates to the review/reconciliation screen once its route exists.
  }, []);

  return {
    data,
    isSyncing: syncMutation.isPending,
    syncBanner,
    handleSync,
    handleOpenCategory,
    handleAddPlan,
    handleReview,
  };
}
