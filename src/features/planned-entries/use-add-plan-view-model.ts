import { useCallback, useState } from 'react';

import { useCategories, type CategoryOption } from '@/features/categories';
import type { ImpactType } from '@/shared/contracts/finance';
import { usePaidEntryState, type PaidEntryState } from '@/features/planned-entries/use-paid-entry-state';
import {
  usePlanRecurrenceState,
  type PlanRecurrenceState,
} from '@/features/planned-entries/use-plan-recurrence-state';
import { useSubmitPlan } from '@/features/planned-entries/use-submit-plan';
import { centsFromMaskedInput } from '@/shared/lib/form-utils';

interface AddPlanViewModel {
  title: string;
  setTitle: (value: string) => void;
  tagsInput: string;
  setTagsInput: (value: string) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  amountCents: number;
  handleAmountChange: (text: string) => void;
  impactType: ImpactType;
  setImpactType: (value: ImpactType) => void;
  categories: CategoryOption[];
  isLoadingCategories: boolean;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string) => void;
  recurrence: PlanRecurrenceState;
  paidEntry: PaidEntryState;
  errorMessage: string | null;
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

export function useAddPlanViewModel(onSuccess: () => void): AddPlanViewModel {
  const categoriesQuery = useCategories();
  const { submit, isSubmitting } = useSubmitPlan();

  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [amountCents, setAmountCents] = useState(0);
  const [impactType, setImpactType] = useState<ImpactType>('EXPENSE');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recurrence = usePlanRecurrenceState();
  const paidEntry = usePaidEntryState(impactType, selectedDate);
  const { reset: resetRecurrence } = recurrence;
  const { reset: resetPaidEntry } = paidEntry;

  const reset = useCallback(() => {
    setTitle('');
    setTagsInput('');
    setSelectedDate(new Date());
    setAmountCents(0);
    setImpactType('EXPENSE');
    setSelectedCategoryId(null);
    resetRecurrence();
    resetPaidEntry();
    setErrorMessage(null);
  }, [resetRecurrence, resetPaidEntry]);

  const handleAmountChange = useCallback((text: string) => {
    setAmountCents(centsFromMaskedInput(text));
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrorMessage(null);
    const category = categoriesQuery.data?.find((item) => item.id === selectedCategoryId);

    const error = await submit({
      kind: recurrence.kind,
      title,
      tagsInput,
      impactType,
      categoryId: category?.id ?? null,
      categoryName: category?.name,
      date: selectedDate,
      amountCents,
      frequency: recurrence.frequency,
      installmentCountInput: recurrence.installmentCountInput,
      settlement: paidEntry.settlement,
      paymentMethod: paidEntry.paymentMethod,
    });

    if (error) {
      setErrorMessage(error);
      return;
    }
    reset();
    onSuccess();
  }, [
    submit,
    categoriesQuery.data,
    selectedCategoryId,
    recurrence.kind,
    recurrence.frequency,
    recurrence.installmentCountInput,
    title,
    tagsInput,
    impactType,
    selectedDate,
    amountCents,
    paidEntry.settlement,
    paidEntry.paymentMethod,
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
    impactType,
    setImpactType,
    categories: categoriesQuery.data ?? [],
    isLoadingCategories: categoriesQuery.isLoading,
    selectedCategoryId,
    setSelectedCategoryId,
    recurrence,
    paidEntry,
    errorMessage,
    isSubmitting,
    handleSubmit,
    reset,
  };
}
