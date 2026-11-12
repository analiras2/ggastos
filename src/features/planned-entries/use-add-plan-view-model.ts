import { useCallback, useState } from 'react';

import { useCategories, type CategoryOption } from '@/features/categories';
import type { ImpactType } from '@/shared/contracts/finance';
import { usePaidEntryState, type PaidEntryState } from '@/features/planned-entries/use-paid-entry-state';
import {
  usePlanRecurrenceState,
  type PlanRecurrenceState,
} from '@/features/planned-entries/use-plan-recurrence-state';
import { useSubmitPlan } from '@/features/planned-entries/use-submit-plan';
import type { EditablePlannedEntry } from '@/features/planned-entries/plan-edit-rules';
import { useSavePlanEdit } from '@/features/planned-entries/use-save-plan-edit';
import { centsFromMaskedInput } from '@/shared/lib/form-utils';

interface AddPlanViewModel {
  isEditing: boolean;
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
}

function dateFromIso(isoDate: string | null): Date | null {
  if (!isoDate) {
    return null;
  }
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// With `entry`, the form edits that planned entry instead of creating a new one.
export function useAddPlanViewModel(onSuccess: () => void, entry?: EditablePlannedEntry): AddPlanViewModel {
  const categoriesQuery = useCategories();
  const { submit, isSubmitting: isCreating } = useSubmitPlan();
  const { save: saveEditedPlan, isSaving } = useSavePlanEdit();

  const [title, setTitle] = useState(entry?.title ?? '');
  const [tagsInput, setTagsInput] = useState(entry?.tags.join(' ') ?? '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => (entry ? dateFromIso(entry.dueDate) : new Date()));
  const [amountCents, setAmountCents] = useState(entry?.amountCents ?? 0);
  const [impactType, setImpactType] = useState<ImpactType>(entry?.impactType ?? 'EXPENSE');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(entry?.categoryId ?? null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recurrence = usePlanRecurrenceState();
  const paidEntry = usePaidEntryState(impactType, selectedDate, entry);
  const handleAmountChange = useCallback((text: string) => {
    setAmountCents(centsFromMaskedInput(text));
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrorMessage(null);
    const category = categoriesQuery.data?.find((item) => item.id === selectedCategoryId);

    if (entry) {
      const editError = await saveEditedPlan({
        target: entry,
        category,
        title,
        tagsInput,
        impactType,
        date: selectedDate,
        amountCents,
        settlement: paidEntry.settlement,
        paymentMethod: paidEntry.paymentMethod,
      });
      if (editError) {
        setErrorMessage(editError);
        return;
      }
      onSuccess();
      return;
    }

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
    onSuccess();
  }, [
    submit,
    saveEditedPlan,
    entry,
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
    onSuccess,
  ]);

  return {
    isEditing: entry !== undefined,
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
    isSubmitting: isCreating || isSaving,
    handleSubmit,
  };
}
