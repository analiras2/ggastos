import { useCallback, useMemo, useState } from 'react';

import type { AddMenuAction } from '@/shared/ui/navigation/add-menu';

// State of the global "+" menu and of the sheets its actions open.
export function useAddMenuViewModel() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddPlanVisible, setIsAddPlanVisible] = useState(false);
  const [isImportVisible, setIsImportVisible] = useState(false);
  const [reviewBatchId, setReviewBatchId] = useState<string | null>(null);

  const toggleMenu = useCallback(() => setIsMenuOpen((current) => !current), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const closeAddPlan = useCallback(() => setIsAddPlanVisible(false), []);
  const closeImport = useCallback(() => setIsImportVisible(false), []);
  const closeReview = useCallback(() => setReviewBatchId(null), []);

  const actions = useMemo<AddMenuAction[]>(
    () => [
      { label: 'Novo lançamento', icon: 'plus', onPress: () => setIsAddPlanVisible(true) },
      { label: 'Importar fatura', icon: 'upload', onPress: () => setIsImportVisible(true) },
    ],
    []
  );

  return {
    actions,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    isAddPlanVisible,
    closeAddPlan,
    isImportVisible,
    closeImport,
    reviewBatchId,
    openReview: setReviewBatchId,
    closeReview,
  };
}
