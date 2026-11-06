import { useCallback, useState } from 'react';

// Which of the month tab's full-screen sheets is open. Pure UI state, no data.
export function useDashboardSheets() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isAddPlanVisible, setIsAddPlanVisible] = useState(false);
  const [isStatementImportVisible, setIsStatementImportVisible] = useState(false);
  const [categoryReviewBatchId, setCategoryReviewBatchId] = useState<string | null>(null);

  const handleOpenSearch = useCallback(() => setIsSearchVisible(true), []);
  const handleCloseSearch = useCallback(() => setIsSearchVisible(false), []);
  const handleAddPlan = useCallback(() => setIsAddPlanVisible(true), []);
  const handleCloseAddPlan = useCallback(() => setIsAddPlanVisible(false), []);
  const handleOpenStatementImport = useCallback(() => setIsStatementImportVisible(true), []);
  const handleCloseStatementImport = useCallback(() => setIsStatementImportVisible(false), []);
  const handleCloseCategoryReview = useCallback(() => setCategoryReviewBatchId(null), []);

  const handleOpenCategoryReview = useCallback((batchId: string) => {
    setIsStatementImportVisible(false);
    setCategoryReviewBatchId(batchId);
  }, []);

  return {
    isSearchVisible,
    isAddPlanVisible,
    isStatementImportVisible,
    categoryReviewBatchId,
    handleOpenSearch,
    handleCloseSearch,
    handleAddPlan,
    handleCloseAddPlan,
    handleOpenStatementImport,
    handleCloseStatementImport,
    handleOpenCategoryReview,
    handleCloseCategoryReview,
  };
}
