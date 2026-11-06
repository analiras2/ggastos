import { useCallback, useState } from 'react';

import { useCategories, type CategoryOption } from '@/features/categories';
import { useCreatePlannedEntry } from '@/features/planned-entries/use-planned-entries';
import { resolveEntryTitle } from '@/features/planned-entries/paid-entry-rules';
import { usePaidEntryState, type PaidEntryState } from '@/features/planned-entries/use-paid-entry-state';
import {
  centsFromMaskedInput,
  formatDateToIso,
  monthKeyFromIsoDate,
} from '@/shared/lib/form-utils';

interface AddPlanViewModel {
  title: string;
  setTitle: (value: string) => void;
  tagsInput: string;
  setTagsInput: (value: string) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  amountCents: number;
  handleAmountChange: (text: string) => void;
  categories: CategoryOption[];
  isLoadingCategories: boolean;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string) => void;
  paidEntry: PaidEntryState;
  errorMessage: string | null;
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

export function useAddPlanViewModel(onSuccess: () => void): AddPlanViewModel {
  const categoriesQuery = useCategories();
  const createPlannedEntry = useCreatePlannedEntry();

  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [amountCents, setAmountCents] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCategory = categoriesQuery.data?.find((item) => item.id === selectedCategoryId);
  const paidEntry = usePaidEntryState(selectedCategory?.impactType, selectedDate);
  const { settlement, paymentMethod, reset: resetPaidEntry } = paidEntry;

  const reset = useCallback(() => {
    setTitle('');
    setTagsInput('');
    setSelectedDate(new Date());
    setAmountCents(0);
    setSelectedCategoryId(null);
    resetPaidEntry();
    setErrorMessage(null);
  }, [resetPaidEntry]);

  const handleAmountChange = useCallback((text: string) => {
    setAmountCents(centsFromMaskedInput(text));
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrorMessage(null);

    if (!selectedCategoryId) {
      setErrorMessage('Selecione uma categoria.');
      return;
    }

    const category = categoriesQuery.data?.find((item) => item.id === selectedCategoryId);
    if (!category) {
      setErrorMessage('Categoria inválida. Selecione novamente.');
      return;
    }

    if (!selectedDate) {
      setErrorMessage('Selecione uma data.');
      return;
    }

    if (amountCents <= 0) {
      setErrorMessage('Informe um valor maior que zero.');
      return;
    }

    const dueDate = formatDateToIso(selectedDate);

    try {
      await createPlannedEntry.mutateAsync({
        title: resolveEntryTitle(title, category.name, settlement),
        tags: tagsInput.split(/\s+/).filter((tag) => /^#[\p{L}\p{N}_-]+$/u.test(tag)),
        impactType: category.impactType,
        categoryId: category.id,
        amountCents,
        dueDate,
        month: monthKeyFromIsoDate(dueDate),
        settlement,
        paymentMethod: settlement === 'PAID' ? paymentMethod : null,
      });

      reset();
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível criar o planejamento.';
      setErrorMessage(message);
    }
  }, [
    title,
    tagsInput,
    selectedCategoryId,
    categoriesQuery.data,
    selectedDate,
    amountCents,
    settlement,
    paymentMethod,
    createPlannedEntry,
    reset,
    onSuccess,
  ]);

  return {
    title,
    setTitle,
    tagsInput,
    setTagsInput,
    selectedDate,
    setSelectedDate,
    amountCents,
    handleAmountChange,
    categories: categoriesQuery.data ?? [],
    isLoadingCategories: categoriesQuery.isLoading,
    selectedCategoryId,
    setSelectedCategoryId,
    paidEntry,
    errorMessage,
    isSubmitting: createPlannedEntry.isPending,
    handleSubmit,
    reset,
  };
}
