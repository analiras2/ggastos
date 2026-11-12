import { useCallback, useState } from 'react';

import { useCategories } from '@/features/categories';
import { useUpdatePlannedEntryDetails } from '@/features/planned-entries';
import { useUpdateTransactionDetails } from '@/features/statements';
import { parseTagsInput } from '@/shared/lib/parse-tags';
import type { EditTarget } from '@/features/dashboard/format-item-details';

// Edits the category and tags of one planned entry or imported transaction.
export function useEditItemViewModel(target: EditTarget, onSaved: () => void) {
  const categoriesQuery = useCategories();
  const updatePlanned = useUpdatePlannedEntryDetails();
  const updateTransaction = useUpdateTransactionDetails();
  const [categoryId, setCategoryId] = useState<string | null>(target.categoryId);
  const [tagsInput, setTagsInput] = useState(target.tags.join(' '));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      }
      onSaved();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar as alterações.');
    }
  }, [categoryId, onSaved, tagsInput, target, updatePlanned, updateTransaction]);

  return {
    categories: categoriesQuery.data ?? [],
    isLoadingCategories: categoriesQuery.isLoading,
    categoryId,
    tagsInput,
    errorMessage,
    isSaving: updatePlanned.isPending || updateTransaction.isPending,
    setCategoryId,
    setTagsInput,
    handleSave,
  };
}
