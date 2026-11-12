import { useCallback } from 'react';

import type { CategoryOption } from '@/features/categories';
import type { ImpactType } from '@/shared/contracts/finance';
import { formatDateToIso } from '@/shared/lib/form-utils';
import { parseTagsInput } from '@/shared/lib/parse-tags';
import type { EntrySettlement, SelectablePaymentMethod } from '@/features/planned-entries/paid-entry-rules';
import { buildPlanEditUpdate, type EditablePlannedEntry } from '@/features/planned-entries/plan-edit-rules';
import { useUpdatePlannedEntry } from '@/features/planned-entries/use-planned-entries';

export type PlanEditForm = {
  target: EditablePlannedEntry;
  category: CategoryOption | undefined;
  title: string;
  tagsInput: string;
  impactType: ImpactType;
  date: Date | null;
  amountCents: number;
  settlement: EntrySettlement;
  paymentMethod: SelectablePaymentMethod | null;
};

// Validates the form of an edited planned entry and saves it. Resolves to a message, or null when saved.
export function useSavePlanEdit() {
  const updatePlannedEntry = useUpdatePlannedEntry();

  const save = useCallback(
    async (form: PlanEditForm): Promise<string | null> => {
      if (!form.category) {
        return 'Selecione uma categoria.';
      }
      if (!form.date) {
        return 'Selecione uma data.';
      }
      if (form.amountCents <= 0) {
        return 'Informe um valor maior que zero.';
      }

      try {
        await updatePlannedEntry.mutateAsync({
          id: form.target.id,
          values: buildPlanEditUpdate({
            title: form.title,
            categoryName: form.category.name,
            tags: parseTagsInput(form.tagsInput),
            impactType: form.impactType,
            categoryId: form.category.id,
            amountCents: form.amountCents,
            dueDate: formatDateToIso(form.date),
            settlement: form.settlement,
            paymentMethod: form.paymentMethod,
            initialSettlement: form.target.isPaid ? 'PAID' : 'PLANNED',
          }),
        });
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : 'Não foi possível salvar o lançamento.';
      }
    },
    [updatePlannedEntry]
  );

  return { save, isSaving: updatePlannedEntry.isPending };
}
