import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { monthDashboardKey } from '@/features/dashboard/use-month-dashboard';
import { useCategories, type CategoryOption } from '@/features/planning/use-categories';
import { useCreatePlannedEntry } from '@/features/planning/use-planned-entries';
import {
  centsFromMaskedInput,
  formatDateToIso,
  monthKeyFromIsoDate,
} from '@/features/planning/planning-form-utils';

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
  errorMessage: string | null;
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

export function useAddPlanViewModel(onSuccess: () => void): AddPlanViewModel {
  const queryClient = useQueryClient();
  const categoriesQuery = useCategories();
  const createPlannedEntry = useCreatePlannedEntry();

  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [amountCents, setAmountCents] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setTitle('');
    setTagsInput('');
    setSelectedDate(new Date());
    setAmountCents(0);
    setSelectedCategoryId(null);
    setErrorMessage(null);
  }, []);

  const handleAmountChange = useCallback((text: string) => {
    setAmountCents(centsFromMaskedInput(text));
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrorMessage(null);

    const trimmedTitle = title.trim();

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
        title: trimmedTitle || null,
        tags: tagsInput.split(/\s+/).filter((tag) => /^#[\p{L}\p{N}_-]+$/u.test(tag)),
        impactType: category.impactType,
        categoryId: category.id,
        amountCents,
        dueDate,
        month: monthKeyFromIsoDate(dueDate),
      });

      await queryClient.invalidateQueries({ queryKey: monthDashboardKey(monthKeyFromIsoDate(dueDate)) });

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
    createPlannedEntry,
    queryClient,
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
    errorMessage,
    isSubmitting: createPlannedEntry.isPending,
    handleSubmit,
    reset,
  };
}
