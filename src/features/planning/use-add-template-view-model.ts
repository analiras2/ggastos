import { useCallback, useState } from 'react';

import { buildTemplateInput, type TemplateMode } from '@/features/planning/build-template-input';
import { centsFromMaskedInput } from '@/features/planning/planning-form-utils';
import type { RecurrenceFrequency } from '@/features/planning/planning-schema';
import { useCategories, type CategoryOption } from '@/features/planning/use-categories';
import { useCreatePlanningTemplate } from '@/features/planning/use-planning-templates';

export type { TemplateMode } from '@/features/planning/build-template-input';

interface AddTemplateViewModel {
  mode: TemplateMode;
  setMode: (mode: TemplateMode) => void;
  title: string;
  setTitle: (value: string) => void;
  startDate: Date | null;
  setStartDate: (date: Date) => void;
  amountCents: number;
  handleAmountChange: (text: string) => void;
  recurrenceFrequency: RecurrenceFrequency;
  setRecurrenceFrequency: (frequency: RecurrenceFrequency) => void;
  installmentCountInput: string;
  handleInstallmentCountChange: (text: string) => void;
  categories: CategoryOption[];
  isLoadingCategories: boolean;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string) => void;
  errorMessage: string | null;
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

export function useAddTemplateViewModel(onSuccess: () => void): AddTemplateViewModel {
  const categoriesQuery = useCategories();
  const createTemplate = useCreatePlanningTemplate();

  const [mode, setMode] = useState<TemplateMode>('RECURRING');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [amountCents, setAmountCents] = useState(0);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('MONTHLY');
  const [installmentCountInput, setInstallmentCountInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setMode('RECURRING');
    setTitle('');
    setStartDate(null);
    setAmountCents(0);
    setRecurrenceFrequency('MONTHLY');
    setInstallmentCountInput('');
    setSelectedCategoryId(null);
    setErrorMessage(null);
  }, []);

  const handleAmountChange = useCallback((text: string) => {
    setAmountCents(centsFromMaskedInput(text));
  }, []);

  const handleInstallmentCountChange = useCallback((text: string) => {
    setInstallmentCountInput(text.replace(/\D/g, ''));
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrorMessage(null);

    const result = buildTemplateInput({
      mode,
      title,
      category: categoriesQuery.data?.find((item) => item.id === selectedCategoryId),
      hasCategorySelected: selectedCategoryId !== null,
      startDate,
      amountCents,
      recurrenceFrequency,
      installmentCountInput,
    });

    if ('error' in result) {
      setErrorMessage(result.error);
      return;
    }

    try {
      // The mutation refreshes the month data itself.
      await createTemplate.mutateAsync(result.input);
      reset();
      onSuccess();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar o template.');
    }
  }, [
    mode,
    title,
    selectedCategoryId,
    categoriesQuery.data,
    startDate,
    amountCents,
    recurrenceFrequency,
    installmentCountInput,
    createTemplate,
    reset,
    onSuccess,
  ]);

  return {
    mode,
    setMode,
    title,
    setTitle,
    startDate,
    setStartDate,
    amountCents,
    handleAmountChange,
    recurrenceFrequency,
    setRecurrenceFrequency,
    installmentCountInput,
    handleInstallmentCountChange,
    categories: categoriesQuery.data ?? [],
    isLoadingCategories: categoriesQuery.isLoading,
    selectedCategoryId,
    setSelectedCategoryId,
    errorMessage,
    isSubmitting: createTemplate.isPending,
    handleSubmit,
    reset,
  };
}
