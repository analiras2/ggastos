import { useCallback } from 'react';

import { buildTemplateInput, useCreatePlanningTemplate } from '@/features/templates';
import type { ImpactType, RecurrenceFrequency } from '@/shared/contracts/finance';
import { formatDateToIso, monthKeyFromIsoDate } from '@/shared/lib/form-utils';
import { parseTagsInput } from '@/shared/lib/parse-tags';
import { resolveEntryTitle, type EntrySettlement, type SelectablePaymentMethod } from '@/features/planned-entries/paid-entry-rules';
import type { PlanKind } from '@/features/planned-entries/use-plan-recurrence-state';
import { useCreatePlannedEntry } from '@/features/planned-entries/use-planned-entries';

export type PlanFormValues = {
  kind: PlanKind;
  title: string;
  tagsInput: string;
  impactType: ImpactType;
  categoryId: string | null;
  categoryName: string | undefined;
  date: Date | null;
  amountCents: number;
  frequency: RecurrenceFrequency;
  installmentCountInput: string;
  settlement: EntrySettlement;
  paymentMethod: SelectablePaymentMethod | null;
};

// Saves the form either as a single entry or as a template (recurring / installments).
// Resolves to a user-facing error message, or null when it was saved.
export function useSubmitPlan() {
  const createPlannedEntry = useCreatePlannedEntry();
  const createTemplate = useCreatePlanningTemplate();

  const submit = useCallback(
    async (values: PlanFormValues): Promise<string | null> => {
      if (!values.categoryId || !values.categoryName) {
        return 'Selecione uma categoria.';
      }

      try {
        if (values.kind !== 'ONE_OFF') {
          const result = buildTemplateInput({
            mode: values.kind,
            title: values.title,
            impactType: values.impactType,
            categoryId: values.categoryId,
            startDate: values.date,
            amountCents: values.amountCents,
            recurrenceFrequency: values.frequency,
            installmentCountInput: values.installmentCountInput,
          });
          if ('error' in result) {
            return result.error;
          }
          await createTemplate.mutateAsync(result.input);
          return null;
        }

        if (!values.date) {
          return 'Selecione uma data.';
        }
        if (values.amountCents <= 0) {
          return 'Informe um valor maior que zero.';
        }

        const dueDate = formatDateToIso(values.date);
        await createPlannedEntry.mutateAsync({
          title: resolveEntryTitle(values.title, values.categoryName, values.settlement),
          tags: parseTagsInput(values.tagsInput),
          impactType: values.impactType,
          categoryId: values.categoryId,
          amountCents: values.amountCents,
          dueDate,
          month: monthKeyFromIsoDate(dueDate),
          settlement: values.settlement,
          paymentMethod: values.settlement === 'PAID' ? values.paymentMethod : null,
        });
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : 'Não foi possível salvar o lançamento.';
      }
    },
    [createPlannedEntry, createTemplate]
  );

  return { submit, isSubmitting: createPlannedEntry.isPending || createTemplate.isPending };
}
