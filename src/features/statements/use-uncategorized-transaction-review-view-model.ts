import { useCallback, useMemo, useState } from 'react';

import { useCategories, type CategoryOption } from '@/features/planning/use-categories';
import { merchantKey } from '@/features/statements/merchant-key';
import {
  useCategorizeTransaction,
  useUncategorizedTransactions,
  type UncategorizedTransaction,
} from '@/features/statements/use-uncategorized-transactions';

interface UncategorizedTransactionReviewViewModel {
  transaction: UncategorizedTransaction | null;
  remainingCount: number;
  categories: CategoryOption[];
  selectedCategoryId: string | null;
  saveAsRule: boolean;
  canSaveAsRule: boolean;
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  setSelectedCategoryId: (categoryId: string) => void;
  setSaveAsRule: (value: boolean) => void;
  handleSave: () => Promise<void>;
}

export function useUncategorizedTransactionReviewViewModel(
  batchId: string | null | undefined,
  selectedTransactionId?: string | null,
  onSaved?: () => void
): UncategorizedTransactionReviewViewModel {
  const transactionsQuery = useUncategorizedTransactions(batchId);
  const categoriesQuery = useCategories();
  const categorizeMutation = useCategorizeTransaction();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [saveAsRule, setSaveAsRule] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const transaction = selectedTransactionId
    ? transactionsQuery.data?.find((item) => item.id === selectedTransactionId) ?? null
    : transactionsQuery.data?.[0] ?? null;

  const canSaveAsRule = transaction !== null && merchantKey(transaction.description) !== null;

  const handleSave = useCallback(async () => {
    if (!transaction || !selectedCategoryId) {
      setErrorMessage('Selecione uma categoria antes de continuar.');
      return;
    }

    setErrorMessage(null);
    try {
      await categorizeMutation.mutateAsync({
        batchId: transaction.batchId,
        transactionId: transaction.id,
        description: transaction.description,
        categoryId: selectedCategoryId,
        saveAsRule: saveAsRule && canSaveAsRule,
      });
      setSelectedCategoryId(null);
      onSaved?.();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a categoria.');
    }
  }, [canSaveAsRule, categorizeMutation, onSaved, saveAsRule, selectedCategoryId, transaction]);

  const categories = useMemo(
    () => (categoriesQuery.data ?? []).filter((category) => category.impactType === 'EXPENSE'),
    [categoriesQuery.data]
  );

  return {
    transaction,
    remainingCount: transactionsQuery.data?.length ?? 0,
    categories,
    selectedCategoryId,
    saveAsRule,
    canSaveAsRule,
    isLoading: transactionsQuery.isLoading || categoriesQuery.isLoading,
    isSaving: categorizeMutation.isPending,
    errorMessage: errorMessage ?? (transactionsQuery.isError ? 'Não foi possível carregar os lançamentos.' : null),
    setSelectedCategoryId,
    setSaveAsRule,
    handleSave,
  };
}
