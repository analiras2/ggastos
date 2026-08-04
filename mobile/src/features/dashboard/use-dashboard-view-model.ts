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
  importBanner: {
    state: 'ok' | 'pending' | 'error';
    message: string;
    actionLabel?: string;
  };
  categoryDetails: CategoryDetailsPanel;
  isAddPlanVisible: boolean;
  isAddTemplateVisible: boolean;
  isStatementImportVisible: boolean;
  isCurrentMonth: boolean;
  isClosingMonth: boolean;
  closeMonthBanner: { state: 'ok' | 'pending' | 'error'; message: string } | null;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleGoToCurrentMonth: () => void;
  handleOpenCategory: (category: CategoryBudget) => void;
  handleCloseCategoryDetails: () => void;
  handleAddPlan: () => void;
  handleCloseAddPlan: () => void;
  handleAddTemplate: () => void;
  handleCloseAddTemplate: () => void;
  handleOpenStatementImport: () => void;
  handleCloseStatementImport: () => void;
  handleCloseMonth: () => void;
}

export function useDashboardViewModel(): DashboardViewModel {
  const [monthKey, setMonthKey] = useState<string>(currentMonthKey);
  const [selectedCategory, setSelectedCategory] = useState<CategoryBudget | null>(null);
  const [isAddPlanVisible, setIsAddPlanVisible] = useState(false);
  const [isAddTemplateVisible, setIsAddTemplateVisible] = useState(false);
  const [isStatementImportVisible, setIsStatementImportVisible] = useState(false);
  const monthDashboardQuery = useMonthDashboard(monthKey);
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

  const importBanner = useMemo(() => {
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

    return {
      state: 'ok' as const,
      message: 'Importe a fatura do cartão para atualizar os gastos realizados.',
      actionLabel: 'Importar CSV',
    };
  }, [monthDashboardQuery.isError, monthDashboardQuery.isLoading]);

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

  const handleOpenStatementImport = useCallback(() => {
    setIsStatementImportVisible(true);
  }, []);

  const handleCloseStatementImport = useCallback(() => {
    setIsStatementImportVisible(false);
  }, []);

  return {
    data,
    importBanner,
    categoryDetails,
    isAddPlanVisible,
    isAddTemplateVisible,
    isStatementImportVisible,
    isCurrentMonth: monthKey === currentMonthKey(),
    isClosingMonth: closeMonthMutation.isPending,
    closeMonthBanner,
    handlePrevMonth,
    handleNextMonth,
    handleGoToCurrentMonth,
    handleOpenCategory,
    handleCloseCategoryDetails,
    handleAddPlan,
    handleCloseAddPlan,
    handleAddTemplate,
    handleCloseAddTemplate,
    handleOpenStatementImport,
    handleCloseStatementImport,
    handleCloseMonth,
  };
}
