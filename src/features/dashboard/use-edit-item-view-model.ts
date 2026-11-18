import { useCallback, useMemo, useState } from 'react';

import { useCategories } from '@/features/categories';
import { useUpdatePlannedEntryDetails } from '@/features/planned-entries';
import {
  merchantKey,
  useRecategorizeSimilarTransactions,
  useSimilarTransactionsCount,
  useUpdateTransactionDetails,
} from '@/features/statements';
import { parseTagsInput } from '@/shared/lib/parse-tags';
import type { EditTarget } from '@/features/dashboard/format-item-details';
import { errorMessageOf } from '@/shared/lib/error-message';

// Edits the category and tags of one planned entry or imported transaction. For an imported one the
// category can also be applied to every similar item and to the next statements.
export function useEditItemViewModel(target: EditTarget, onSaved: () => void) {
  const categoriesQuery = useCategories();
  const updatePlanned = useUpdatePlannedEntryDetails();
  const updateTransaction = useUpdateTransactionDetails();
  const recategorizeSimilar = useRecategorizeSimilarTransactions();
  const [categoryId, setCategoryId] = useState<string | null>(target.categoryId);
  const [tagsInput, setTagsInput] = useState(target.tags.join(' '));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [applyToSimilar, setApplyToSimilar] = useState(false);

  // Null for a planned entry and for a description too generic to identify a merchant.
  const ruleValue = useMemo(
    () => (target.source === 'IMPORTED' && target.description !== null ? merchantKey(target.description) : null),
    [target]
  );
  const similarCount = useSimilarTransactionsCount(ruleValue);

  const handleSave = useCallback(async () => {
    if (!categoryId) {
      setErrorMessage('Selecione uma categoria antes de salvar.');
      return;
    }

    setErrorMessage(null);
    const tags = parseTagsInput(tagsInput);
    try {
      if (target.source === 'PLANNED') {
        await updatePlanned.mutateAsync({ id: target.id, categoryId, tags });
      } else {
        await updateTransaction.mutateAsync({ transactionId: target.id, categoryId, tags });
        if (applyToSimilar && ruleValue !== null) {
          await recategorizeSimilar.mutateAsync({ transactionId: target.id, categoryId, ruleValue });
        }
      }
      onSaved();
    } catch (error) {
      setErrorMessage(errorMessageOf(error, 'Não foi possível salvar as alterações.'));
    }
  }, [applyToSimilar, categoryId, onSaved, recategorizeSimilar, ruleValue, tagsInput, target, updatePlanned, updateTransaction]);

  return {
    categories: categoriesQuery.data ?? [],
    isLoadingCategories: categoriesQuery.isLoading,
    categoryId,
    tagsInput,
    errorMessage,
    isSaving: updatePlanned.isPending || updateTransaction.isPending || recategorizeSimilar.isPending,
    canApplyToSimilar: ruleValue !== null,
    applyToSimilar: applyToSimilar && ruleValue !== null,
    similarCount: similarCount.data,
    setApplyToSimilar,
    setCategoryId,
    setTagsInput,
    handleSave,
  };
}
