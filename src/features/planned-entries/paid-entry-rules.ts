// Rules for an entry that was already paid or received when it is created. Pure functions, no I/O.

export type EntrySettlement = 'PLANNED' | 'PAID';

// Offered in the form. Credit card is also a valid payment method in the database, but card
// purchases arrive through the imported statements, so it is never chosen by hand.
export const SELECTABLE_PAYMENT_METHODS = ['CASH', 'PIX', 'DEBIT_TRANSFER', 'OTHER'] as const;
export type SelectablePaymentMethod = (typeof SELECTABLE_PAYMENT_METHODS)[number];

// An entry created already paid is stored as manually confirmed, which the dashboard already
// counts as actual. Confirmation happens at midday UTC of the chosen date so that the day does
// not change in any time zone.
const CONFIRMATION_TIME = 'T12:00:00Z';

export type PaidFields = {
  status: 'PLANNED' | 'RECONCILED';
  manuallyConfirmedAt: string | null;
  paymentMethod: SelectablePaymentMethod | null;
};

export function buildPaidFields(
  settlement: EntrySettlement,
  paymentMethod: SelectablePaymentMethod | null,
  dueDate: string,
): PaidFields {
  if (settlement === 'PLANNED') {
    return { status: 'PLANNED', manuallyConfirmedAt: null, paymentMethod: null };
  }

  return { status: 'RECONCILED', manuallyConfirmedAt: `${dueDate}${CONFIRMATION_TIME}`, paymentMethod };
}

// A planned entry without a title is named by the statement import later. A paid one has no
// import to name it, so it falls back to the category name.
export function resolveEntryTitle(
  title: string,
  categoryName: string,
  settlement: EntrySettlement,
): string | null {
  const trimmedTitle = title.trim();
  if (trimmedTitle) {
    return trimmedTitle;
  }

  return settlement === 'PAID' ? categoryName : null;
}

export function settlementLabel(impactType: string): string {
  return impactType === 'INCOME' ? 'Já recebi' : 'Já paguei';
}

// `dueDate` and `today` are YYYY-MM-DD strings.
export function isFutureDate(dueDate: string, today: string): boolean {
  return dueDate > today;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Dinheiro',
  PIX: 'Pix',
  DEBIT_TRANSFER: 'Débito/transferência',
  CREDIT_CARD: 'Cartão de crédito',
  OTHER: 'Outro',
};

// Null for no payment method or one this version does not know.
export function paymentMethodLabel(paymentMethod: string | null): string | null {
  return paymentMethod ? (PAYMENT_METHOD_LABELS[paymentMethod] ?? null) : null;
}
