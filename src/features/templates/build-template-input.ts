import {
  formatDateToIso,
  installmentAmountCents,
  installmentCountFromInput,
  monthKeyFromIsoDate,
} from '@/shared/lib/form-utils';
import type { ImpactType, RecurrenceFrequency } from '@/shared/contracts/finance';
import type { CreatePlanningTemplateInput } from '@/features/templates/contract';

export type TemplateMode = 'RECURRING' | 'INSTALLMENT';

type TemplateFormValues = {
  mode: TemplateMode;
  title: string;
  impactType: ImpactType;
  categoryId: string | null;
  startDate: Date | null;
  amountCents: number;
  recurrenceFrequency: RecurrenceFrequency;
  installmentCountInput: string;
};

type BuildResult = { input: CreatePlanningTemplateInput } | { error: string };

// Validates the form and shapes the request. Returns the first problem as a user-facing message.
export function buildTemplateInput(values: TemplateFormValues): BuildResult {
  const { mode, categoryId, startDate, amountCents } = values;
  const title = values.title.trim();

  if (!title) {
    return { error: 'Informe um título.' };
  }
  if (!categoryId) {
    return { error: 'Selecione uma categoria.' };
  }
  if (!startDate) {
    return { error: 'Selecione a data.' };
  }
  if (amountCents <= 0) {
    return { error: 'Informe um valor maior que zero.' };
  }

  const startMonth = monthKeyFromIsoDate(formatDateToIso(startDate));
  const isInstallment = mode === 'INSTALLMENT';
  const installmentCount = isInstallment ? installmentCountFromInput(values.installmentCountInput) : 0;

  if (isInstallment && installmentCount <= 0) {
    return { error: 'Informe o número de parcelas.' };
  }

  const perInstallmentCents = isInstallment ? installmentAmountCents(amountCents, installmentCount) : null;

  return {
    input: {
      title,
      impactType: values.impactType,
      categoryId,
      defaultAmountCents: isInstallment ? (perInstallmentCents as number) : amountCents,
      recurrenceFrequency: isInstallment ? 'NONE' : values.recurrenceFrequency,
      recurrenceInterval: 1,
      startMonth,
      installmentTotal: isInstallment ? installmentCount : null,
      installmentAmountCents: perInstallmentCents,
    },
  };
}
