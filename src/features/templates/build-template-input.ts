import {
  formatDateToIso,
  installmentAmountCents,
  installmentCountFromInput,
  monthKeyFromIsoDate,
} from '@/shared/lib/form-utils';
import type { RecurrenceFrequency } from '@/shared/contracts/finance';
import type { CreatePlanningTemplateInput } from '@/features/templates/contract';
import type { CategoryOption } from '@/features/categories/use-categories';

export type TemplateMode = 'RECURRING' | 'INSTALLMENT';

type TemplateFormValues = {
  mode: TemplateMode;
  title: string;
  category: CategoryOption | undefined;
  hasCategorySelected: boolean;
  startDate: Date | null;
  amountCents: number;
  recurrenceFrequency: RecurrenceFrequency;
  installmentCountInput: string;
};

type BuildResult = { input: CreatePlanningTemplateInput } | { error: string };

// Validates the form and shapes the request. Returns the first problem as a user-facing message.
export function buildTemplateInput(values: TemplateFormValues): BuildResult {
  const { mode, category, startDate, amountCents } = values;
  const title = values.title.trim();

  if (!title) {
    return { error: 'Informe um título.' };
  }
  if (!values.hasCategorySelected) {
    return { error: 'Selecione uma categoria.' };
  }
  if (!category) {
    return { error: 'Categoria inválida. Selecione novamente.' };
  }
  if (!startDate) {
    return { error: 'Selecione a data de início.' };
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
      impactType: category.impactType,
      categoryId: category.id,
      defaultAmountCents: isInstallment ? (perInstallmentCents as number) : amountCents,
      recurrenceFrequency: isInstallment ? 'NONE' : values.recurrenceFrequency,
      recurrenceInterval: 1,
      startMonth,
      installmentTotal: isInstallment ? installmentCount : null,
      installmentAmountCents: perInstallmentCents,
    },
  };
}
