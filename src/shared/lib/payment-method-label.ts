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
