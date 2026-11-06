import { useCallback, useState } from 'react';

// Which of the month tab's full-screen sheets is open. Pure UI state, no data.
export function useDashboardSheets() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isAddPlanVisible, setIsAddPlanVisible] = useState(false);
  const [isAddTemplateVisible, setIsAddTemplateVisible] = useState(false);
  const [isStatementImportVisible, setIsStatementImportVisible] = useState(false);
  const [categoryReviewBatchId, setCategoryReviewBatchId] = useState<string | null>(null);

  const handleOpenSearch = useCallback(() => setIsSearchVisible(true), []);
  const handleCloseSearch = useCallback(() => setIsSearchVisible(false), []);
  const handleAddPlan = useCallback(() => setIsAddPlanVisible(true), []);
  const handleCloseAddPlan = useCallback(() => setIsAddPlanVisible(false), []);
  const handleAddTemplate = useCallback(() => setIsAddTemplateVisible(true), []);
  const handleCloseAddTemplate = useCallback(() => setIsAddTemplateVisible(false), []);
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
    isAddTemplateVisible,
    isStatementImportVisible,
    categoryReviewBatchId,
    handleOpenSearch,
    handleCloseSearch,
    handleAddPlan,
    handleCloseAddPlan,
    handleAddTemplate,
    handleCloseAddTemplate,
    handleOpenStatementImport,
    handleCloseStatementImport,
    handleOpenCategoryReview,
    handleCloseCategoryReview,
  };
}
