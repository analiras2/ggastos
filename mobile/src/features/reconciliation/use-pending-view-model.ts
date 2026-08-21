import { useCallback, useState } from 'react';

import type { ReconciliationSuggestionView } from '@/features/reconciliation/format-reconciliation';
import { useReconciliationInboxViewModel } from '@/features/reconciliation/use-reconciliation-inbox-view-model';
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
}

export function usePendingViewModel(): PendingViewModel {
  const reconciliation = useReconciliationInboxViewModel();
  const uncategorizedTransactionsQuery = useUncategorizedTransactions();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const handleOpenCategoryReview = useCallback((transactionId: string) => {
    setSelectedTransactionId(transactionId);
  }, []);

  const handleCloseCategoryReview = useCallback(() => {
    setSelectedTransactionId(null);
  }, []);

  return {
    reconciliationSuggestions: reconciliation.suggestions,
    uncategorizedTransactions: uncategorizedTransactionsQuery.data ?? [],
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
  };
}
