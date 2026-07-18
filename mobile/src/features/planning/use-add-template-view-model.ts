import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { monthDashboardKey } from '@/features/dashboard/use-month-dashboard';
import type { RecurrenceFrequency } from '@/features/planning/planning-schema';
import { useCategories, type CategoryOption } from '@/features/planning/use-categories';
import { useCreatePlanningTemplate } from '@/features/planning/use-planning-templates';
import {
  centsFromMaskedInput,
  formatDateToIso,
  installmentAmountCents,
  installmentCountFromInput,
  monthKeyFromIsoDate,
} from '@/features/planning/planning-form-utils';

export type TemplateMode = 'RECURRING' | 'INSTALLMENT';

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
  const queryClient = useQueryClient();
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

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Informe um título.');
      return;
    }

    if (!selectedCategoryId) {
      setErrorMessage('Selecione uma categoria.');
      return;
    }

    const category = categoriesQuery.data?.find((item) => item.id === selectedCategoryId);
    if (!category) {
      setErrorMessage('Categoria inválida. Selecione novamente.');
      return;
    }

    if (!startDate) {
      setErrorMessage('Selecione a data de início.');
      return;
    }

    if (amountCents <= 0) {
      setErrorMessage('Informe um valor maior que zero.');
      return;
    }

    const startMonth = monthKeyFromIsoDate(formatDateToIso(startDate));

    const installmentCount =
      mode === 'INSTALLMENT' ? installmentCountFromInput(installmentCountInput) : 0;

    if (mode === 'INSTALLMENT' && installmentCount <= 0) {
      setErrorMessage('Informe o número de parcelas.');
      return;
    }

    const perInstallmentCents =
      mode === 'INSTALLMENT' ? installmentAmountCents(amountCents, installmentCount) : null;

    try {
      await createTemplate.mutateAsync({
        title: trimmedTitle,
        impactType: category.impactType,
        categoryId: category.id,
        defaultAmountCents: mode === 'INSTALLMENT' ? (perInstallmentCents as number) : amountCents,
        recurrenceFrequency: mode === 'RECURRING' ? recurrenceFrequency : 'NONE',
        recurrenceInterval: 1,
        startMonth,
        installmentTotal: mode === 'INSTALLMENT' ? installmentCount : null,
        installmentAmountCents: mode === 'INSTALLMENT' ? perInstallmentCents : null,
      });

      await queryClient.invalidateQueries({ queryKey: monthDashboardKey(startMonth) });

      reset();
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível criar o template.';
      setErrorMessage(message);
    }
  }, [
    title,
    selectedCategoryId,
    categoriesQuery.data,
    startDate,
    amountCents,
    mode,
    installmentCountInput,
    recurrenceFrequency,
    createTemplate,
    queryClient,
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
