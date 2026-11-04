import { useCallback, useMemo, useState } from 'react';

import { useCategories, type CategoryOption } from '@/features/planning/use-categories';
import {
  collectRuleValues,
  describeBulkCategorizeError,
  type BulkCategorizeResult,
} from '@/features/statements/bulk-categorization';
import { merchantKey } from '@/features/statements/merchant-key';
import { useBulkCategorizeTransactions } from '@/features/statements/use-bulk-categorize-transactions';
import type { UncategorizedTransaction } from '@/features/statements/use-uncategorized-transactions';

export interface BulkCategorizeViewModel {
  categories: CategoryOption[];
  selectedCategoryId: string | null;
  createRules: boolean;
  ruleCount: number;
  withoutRuleCount: number;
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  setSelectedCategoryId: (categoryId: string) => void;
  setCreateRules: (value: boolean) => void;
  handleConfirm: () => Promise<void>;
  resetForm: () => void;
}

export function useBulkCategorizeViewModel(
  selectedTransactions: readonly UncategorizedTransaction[],
  onCompleted: (result: BulkCategorizeResult) => void
): BulkCategorizeViewModel {
  const categoriesQuery = useCategories();
  const bulkMutation = useBulkCategorizeTransactions();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [createRules, setCreateRules] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = useMemo(
    () => (categoriesQuery.data ?? []).filter((category) => category.impactType === 'EXPENSE'),
    [categoriesQuery.data]
  );

  const ruleValues = useMemo(
    () =>
      collectRuleValues(
        selectedTransactions.map((transaction) => transaction.description),
        merchantKey
      ),
    [selectedTransactions]
  );
  const withoutRuleCount = useMemo(
    () => selectedTransactions.filter((transaction) => merchantKey(transaction.description) === null).length,
    [selectedTransactions]
  );

  const resetForm = useCallback(() => {
    setSelectedCategoryId(null);
    setErrorMessage(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (selectedTransactions.length === 0) {
      setErrorMessage('Selecione ao menos um lançamento.');
      return;
    }
    if (!selectedCategoryId) {
      setErrorMessage('Selecione uma categoria antes de continuar.');
      return;
    }

    setErrorMessage(null);
    try {
      const result = await bulkMutation.mutateAsync({
        transactions: selectedTransactions,
        categoryId: selectedCategoryId,
        createRules: createRules && ruleValues.length > 0,
      });
      setSelectedCategoryId(null);
      onCompleted(result);
    } catch (error) {
      setErrorMessage(describeBulkCategorizeError(error));
    }
  }, [bulkMutation, createRules, onCompleted, ruleValues.length, selectedCategoryId, selectedTransactions]);

  return {
    categories,
    selectedCategoryId,
    createRules: createRules && ruleValues.length > 0,
    ruleCount: ruleValues.length,
    withoutRuleCount,
    isLoading: categoriesQuery.isLoading,
    isSaving: bulkMutation.isPending,
    errorMessage,
    setSelectedCategoryId,
    setCreateRules,
    handleConfirm,
    resetForm,
  };
}
