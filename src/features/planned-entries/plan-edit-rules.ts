import type { ImpactType, PlanningStatus } from '@/shared/contracts/finance';
import { monthKeyFromIsoDate } from '@/shared/lib/form-utils';
import {
  buildPaidFields,
  resolveEntryTitle,
  SELECTABLE_PAYMENT_METHODS,
  type EntrySettlement,
  type SelectablePaymentMethod,
} from '@/features/planned-entries/paid-entry-rules';

// What the "Novo lançamento" form needs to open an existing planned entry for editing.
export type EditablePlannedEntry = {
  id: string;
  title: string | null;
  tags: string[];
  impactType: ImpactType;
  categoryId: string;
  amountCents: number;
  dueDate: string | null;
  isPaid: boolean;
  paymentMethod: SelectablePaymentMethod | null;
};

type EditablePlannedEntryInput = {
  id: string;
  title: string | null;
  tags: string[];
  impactType: ImpactType;
  categoryId: string;
  amountCents: number;
  dueDate: string | null;
  status: PlanningStatus;
  manuallyConfirmedAt: string | null;
  paymentMethod: string | null;
};

function toSelectablePaymentMethod(value: string | null): SelectablePaymentMethod | null {
  return SELECTABLE_PAYMENT_METHODS.find((method) => method === value) ?? null;
}

// "Paid" here means the person confirmed it by hand, which is what the form's "Já paguei" stores.
export function buildEditablePlannedEntry(input: EditablePlannedEntryInput): EditablePlannedEntry {
  return {
    id: input.id,
    title: input.title,
    tags: input.tags,
    impactType: input.impactType,
    categoryId: input.categoryId,
    amountCents: input.amountCents,
    dueDate: input.dueDate,
    isPaid: input.status === 'RECONCILED' && input.manuallyConfirmedAt !== null,
    paymentMethod: toSelectablePaymentMethod(input.paymentMethod),
  };
}

export type PlanEditValues = {
  title: string;
  categoryName: string;
  tags: string[];
  impactType: ImpactType;
  categoryId: string;
  amountCents: number;
  dueDate: string;
  settlement: EntrySettlement;
  paymentMethod: SelectablePaymentMethod | null;
  // How the entry was when the form opened, so an untouched status is left alone.
  initialSettlement: EntrySettlement;
};

// The columns to write when an entry is edited. The status is only touched when the paid choice matters.
export function buildPlanEditUpdate(values: PlanEditValues): Record<string, unknown> {
  const title = resolveEntryTitle(values.title, values.categoryName, values.settlement);
  const base = {
    title,
    is_title_manual: title !== null,
    tags: values.tags,
    impact_type: values.impactType,
    category_id: values.categoryId,
    amount_cents: values.amountCents,
    due_date: values.dueDate,
    month: monthKeyFromIsoDate(values.dueDate),
  };

  if (values.settlement === 'PAID') {
    const paid = buildPaidFields('PAID', values.paymentMethod, values.dueDate);
    return { ...base, status: paid.status, manually_confirmed_at: paid.manuallyConfirmedAt, payment_method: paid.paymentMethod };
  }
  if (values.initialSettlement === 'PAID') {
    return { ...base, status: 'PLANNED', manually_confirmed_at: null, payment_method: null };
  }
  return base;
}
