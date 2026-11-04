import { useCallback, useMemo, useState } from 'react';

import type { ReconciliationSuggestionView } from '@/features/reconciliation/format-reconciliation';
import { useReconciliationInboxViewModel } from '@/features/reconciliation/use-reconciliation-inbox-view-model';
import type { BulkCategorizeResult } from '@/features/statements/bulk-categorization';
import { signedAmountCents } from '@/features/statements/selection-state';
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
  isBulkSheetVisible: boolean;
  bulkTransactionCount: number;
  bulkTotalCents: number;
  openBulkSheet: () => void;
  closeBulkSheet: () => void;
}

export function usePendingViewModel(): PendingViewModel {
  const reconciliation = useReconciliationInboxViewModel();
  const uncategorizedTransactionsQuery = useUncategorizedTransactions();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [lastBulkResult, setLastBulkResult] = useState<BulkCategorizeResult | null>(null);
  const [isBulkSheetVisible, setIsBulkSheetVisible] = useState(false);
  // Copy of the selection taken when the sheet opens, so its content does not change while it
  // slides out after the selection is cleared.
  const [bulkTransactions, setBulkTransactions] = useState<readonly UncategorizedTransaction[]>([]);
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
      setIsBulkSheetVisible(false);
      clearSelection();
    },
    [clearSelection]
  );
  const bulkCategorize = useBulkCategorizeViewModel(bulkTransactions, handleBulkCompleted);
  const bulkTotalCents = useMemo(
    () => bulkTransactions.reduce((total, transaction) => total + signedAmountCents(transaction), 0),
    [bulkTransactions]
  );
  const dismissBulkResult = useCallback(() => setLastBulkResult(null), []);
  const openBulkSheet = useCallback(() => {
    setBulkTransactions(selectedTransactions);
    setIsBulkSheetVisible(true);
  }, [selectedTransactions]);
  const { resetForm: resetBulkForm } = bulkCategorize;
  const closeBulkSheet = useCallback(() => {
    setIsBulkSheetVisible(false);
    resetBulkForm();
  }, [resetBulkForm]);

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
    isBulkSheetVisible,
    bulkTransactionCount: bulkTransactions.length,
    bulkTotalCents,
    openBulkSheet,
    closeBulkSheet,
  };
}
