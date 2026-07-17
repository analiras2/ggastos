import { useCallback, useMemo } from 'react';

import { currentMonthKey } from '@/features/dashboard/month-utils';
import {
  formatReconciliationSuggestion,
  type ReconciliationSuggestionView,
} from '@/features/reconciliation/format-reconciliation';
import type { ReconciliationSuggestion } from '@/features/reconciliation/reconciliation-schema';
import {
  getFormattedReconciliationDecisionError,
  useConfirmMatch,
  useRejectMatch,
} from '@/features/reconciliation/use-reconciliation-decisions';
import { useReconciliationInbox } from '@/features/reconciliation/use-reconciliation-inbox';

interface ReconciliationInboxViewModel {
  suggestions: ReconciliationSuggestionView[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  pendingTransactionId: string | null;
  decisionErrorMessage: string | null;
  handleConfirm: (suggestion: ReconciliationSuggestionView) => void;
  handleReject: (suggestion: ReconciliationSuggestionView) => void;
}

export function useReconciliationInboxViewModel(): ReconciliationInboxViewModel {
  const monthKey = currentMonthKey();
  const inboxQuery = useReconciliationInbox(monthKey);
  const confirmMutation = useConfirmMatch();
  const rejectMutation = useRejectMatch();

  const suggestions = useMemo<ReconciliationSuggestionView[]>(
    () => (inboxQuery.data ?? []).map(formatReconciliationSuggestion),
    [inboxQuery.data]
  );

  const pendingTransactionId = useMemo(() => {
    if (confirmMutation.isPending) {
      return confirmMutation.variables?.transactionId ?? null;
    }
    if (rejectMutation.isPending) {
      return rejectMutation.variables?.transactionId ?? null;
    }
    return null;
  }, [confirmMutation.isPending, confirmMutation.variables, rejectMutation.isPending, rejectMutation.variables]);

  const decisionErrorMessage = useMemo(() => {
    if (confirmMutation.isError) {
      return getFormattedReconciliationDecisionError(confirmMutation.error);
    }
    if (rejectMutation.isError) {
      return getFormattedReconciliationDecisionError(rejectMutation.error);
    }
    return null;
  }, [confirmMutation.isError, confirmMutation.error, rejectMutation.isError, rejectMutation.error]);

  const toDecisionInput = (
    suggestion: ReconciliationSuggestionView
  ): Pick<ReconciliationSuggestion, 'plannedEntryId' | 'transactionId'> => ({
    plannedEntryId: suggestion.plannedEntryId,
    transactionId: suggestion.transactionId,
  });

  const handleConfirm = useCallback(
    (suggestion: ReconciliationSuggestionView) => {
      confirmMutation.mutate(toDecisionInput(suggestion));
    },
    [confirmMutation]
  );

  const handleReject = useCallback(
    (suggestion: ReconciliationSuggestionView) => {
      rejectMutation.mutate(toDecisionInput(suggestion));
    },
    [rejectMutation]
  );

  return {
    suggestions,
    isLoading: inboxQuery.isLoading,
    isError: inboxQuery.isError,
    isEmpty: !inboxQuery.isLoading && !inboxQuery.isError && suggestions.length === 0,
    pendingTransactionId,
    decisionErrorMessage,
    handleConfirm,
    handleReject,
  };
}
