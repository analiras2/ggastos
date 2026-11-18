import { useCallback, useMemo, useState } from 'react';

import { useCategories, type CategoryOption } from '@/features/categories';
import { parseTagsInput } from '@/shared/lib/parse-tags';
import { merchantKey } from '@/features/statements/merchant-key';
import { useRemoveImportedTransaction } from '@/features/statements/use-remove-imported-transaction';
import {
  useCategorizeTransaction,
  useUncategorizedTransactions,
  type UncategorizedTransaction,
} from '@/features/statements/use-uncategorized-transactions';
import { errorMessageOf } from '@/shared/lib/error-message';

interface UncategorizedTransactionReviewViewModel {
  transaction: UncategorizedTransaction | null;
  remainingCount: number;
  categories: CategoryOption[];
  selectedCategoryId: string | null;
  tagsInput: string;
  saveAsRule: boolean;
  canSaveAsRule: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isConfirmingRemoval: boolean;
  errorMessage: string | null;
  setSelectedCategoryId: (categoryId: string) => void;
  setTagsInput: (value: string) => void;
  setSaveAsRule: (value: boolean) => void;
  handleSave: () => Promise<void>;
  askToRemove: () => void;
  cancelRemoval: () => void;
  handleRemove: () => Promise<void>;
}

export function useUncategorizedTransactionReviewViewModel(
  batchId: string | null | undefined,
  selectedTransactionId?: string | null,
  onSaved?: () => void
): UncategorizedTransactionReviewViewModel {
  const transactionsQuery = useUncategorizedTransactions(batchId);
  const categoriesQuery = useCategories();
  const categorizeMutation = useCategorizeTransaction();
  const removeMutation = useRemoveImportedTransaction();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [saveAsRule, setSaveAsRule] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);
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
        tags: parseTagsInput(tagsInput),
      });
      setSelectedCategoryId(null);
      setTagsInput('');
      onSaved?.();
    } catch (error) {
      setErrorMessage(errorMessageOf(error, 'Não foi possível salvar a categoria.'));
    }
  }, [canSaveAsRule, categorizeMutation, onSaved, saveAsRule, selectedCategoryId, tagsInput, transaction]);

  // The item is not part of the statement the user wants: it leaves the app and stays out on re-import.
  const handleRemove = useCallback(async () => {
    if (!transaction) {
      return;
    }

    setErrorMessage(null);
    try {
      await removeMutation.mutateAsync(transaction.id);
      setIsConfirmingRemoval(false);
      setSelectedCategoryId(null);
      setTagsInput('');
      onSaved?.();
    } catch (error) {
      setIsConfirmingRemoval(false);
      setErrorMessage(errorMessageOf(error, 'Não foi possível remover o item.'));
    }
  }, [onSaved, removeMutation, transaction]);

  const categories = useMemo(
    () => (categoriesQuery.data ?? []).filter((category) => category.impactType === 'EXPENSE'),
    [categoriesQuery.data]
  );

  return {
    transaction,
    remainingCount: transactionsQuery.data?.length ?? 0,
    categories,
    selectedCategoryId,
    tagsInput,
    saveAsRule,
    canSaveAsRule,
    isLoading: transactionsQuery.isLoading || categoriesQuery.isLoading,
    isSaving: categorizeMutation.isPending || removeMutation.isPending,
    isConfirmingRemoval,
    errorMessage: errorMessage ?? (transactionsQuery.isError ? 'Não foi possível carregar os lançamentos.' : null),
    setSelectedCategoryId,
    setTagsInput,
    setSaveAsRule,
    handleSave,
    askToRemove: () => setIsConfirmingRemoval(true),
    cancelRemoval: () => setIsConfirmingRemoval(false),
    handleRemove,
  };
}
