import { useCallback, useMemo, useState } from 'react';

import type { ReconciliationSuggestionView } from '@/features/reconciliation/format-reconciliation';
import { useReconciliationInboxViewModel } from '@/features/reconciliation/use-reconciliation-inbox-view-model';
import type { BulkCategorizeResult } from '@/features/statements/bulk-categorization';
import {
  useBulkCategorizeViewModel,
  type BulkCategorizeViewModel,
} from '@/features/statements/use-bulk-categorize-view-model';
import {
  useSelectionViewModel,
  type SelectionViewModel,
} from '@/features/statements/use-selection-view-model';
import {
  useUncategorizedTransactions,
  type UncategorizedTransaction,
} from '@/features/statements/use-uncategorized-transactions';

interface PendingViewModel {
  reconciliationSuggestions: ReconciliationSuggestionView[];
  uncategorizedTransactions: UncategorizedTransaction[];
  selectedTransactionId: string | null;
  isLoading: boolean;
  isError: boolean;
  isCategoryReviewVisible: boolean;
  pendingReconciliationTransactionId: string | null;
  reconciliationErrorMessage: string | null;
  handleConfirmReconciliation: (suggestion: ReconciliationSuggestionView) => void;
  handleRejectReconciliation: (suggestion: ReconciliationSuggestionView) => void;
  handleOpenCategoryReview: (transactionId: string) => void;
  handleCloseCategoryReview: () => void;
  selection: SelectionViewModel;
  bulkCategorize: BulkCategorizeViewModel;
  lastBulkResult: BulkCategorizeResult | null;
  dismissBulkResult: () => void;
}

export function usePendingViewModel(): PendingViewModel {
  const reconciliation = useReconciliationInboxViewModel();
  const uncategorizedTransactionsQuery = useUncategorizedTransactions();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [lastBulkResult, setLastBulkResult] = useState<BulkCategorizeResult | null>(null);
  const uncategorizedTransactions = useMemo(
    () => uncategorizedTransactionsQuery.data ?? [],
    [uncategorizedTransactionsQuery.data]
  );
  const selection = useSelectionViewModel(uncategorizedTransactions);
  const { clear: clearSelection, selectedIds } = selection;
  const selectedTransactions = useMemo(
    () => uncategorizedTransactions.filter((transaction) => selectedIds.has(transaction.id)),
    [selectedIds, uncategorizedTransactions]
  );

  const handleBulkCompleted = useCallback(
    (result: BulkCategorizeResult) => {
      setLastBulkResult(result);
      clearSelection();
    },
    [clearSelection]
  );
  const bulkCategorize = useBulkCategorizeViewModel(selectedTransactions, handleBulkCompleted);
  const dismissBulkResult = useCallback(() => setLastBulkResult(null), []);

  const handleOpenCategoryReview = useCallback((transactionId: string) => {
    setSelectedTransactionId(transactionId);
  }, []);

  const handleCloseCategoryReview = useCallback(() => {
    setSelectedTransactionId(null);
  }, []);

  return {
    reconciliationSuggestions: reconciliation.suggestions,
    uncategorizedTransactions,
    selectedTransactionId,
    isLoading: reconciliation.isLoading || uncategorizedTransactionsQuery.isLoading,
    isError: reconciliation.isError || uncategorizedTransactionsQuery.isError,
    isCategoryReviewVisible: selectedTransactionId !== null,
    pendingReconciliationTransactionId: reconciliation.pendingTransactionId,
    reconciliationErrorMessage: reconciliation.decisionErrorMessage,
    handleConfirmReconciliation: reconciliation.handleConfirm,
    handleRejectReconciliation: reconciliation.handleReject,
    handleOpenCategoryReview,
    handleCloseCategoryReview,
    selection,
    bulkCategorize,
    lastBulkResult,
    dismissBulkResult,
  };
}
