import { useCallback, useMemo, useState } from 'react';

import type { CategoryBudget } from '@/features/dashboard/dashboard-data';
import type { CategoryDetailsPanel } from '@/features/dashboard/dashboard-view-model-types';
import { formatCategoryDetails } from '@/features/dashboard/format-category-details';
import { useCategoryDetails } from '@/features/dashboard/use-category-details';
import { usePlannedEntryStatusToggle } from '@/features/dashboard/use-planned-entry-status-toggle';

// The selected category and the details sheet that lists its entries for the month.
export function useCategoryDetailsPanel(monthKey: string) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryBudget | null>(null);
  const categoryId = selectedCategory?.categoryId ?? null;
  const detailsQuery = useCategoryDetails(monthKey, categoryId);
  const { togglingEntryId, handleToggleStatus } = usePlannedEntryStatusToggle(monthKey, categoryId);

  const categoryDetails = useMemo<CategoryDetailsPanel>(
    () => ({
      visible: selectedCategory !== null,
      isLoading: detailsQuery.isLoading,
      isError: detailsQuery.isError,
      details: detailsQuery.data ? formatCategoryDetails(detailsQuery.data) : null,
      togglingEntryId,
      onToggleEntryStatus: handleToggleStatus,
    }),
    [
      selectedCategory,
      detailsQuery.isLoading,
      detailsQuery.isError,
      detailsQuery.data,
      togglingEntryId,
      handleToggleStatus,
    ]
  );

  const handleOpenCategory = useCallback((category: CategoryBudget) => {
    setSelectedCategory(category);
  }, []);

  const handleCloseCategoryDetails = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  return { categoryDetails, handleOpenCategory, handleCloseCategoryDetails };
}
