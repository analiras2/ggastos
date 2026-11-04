import type {
  StatementPaymentStatus,
  StatementPaymentStatusSource,
} from '@/features/statements/use-import-card-statement';

export type PaymentChoice = 'AUTO' | StatementPaymentStatus;

export function isPaymentChoice(value: string): value is PaymentChoice {
  return value === 'AUTO' || value === 'PAID' || value === 'OPEN';
}

// What goes in the request: automatic means the function decides.
export function toRequestedStatus(choice: PaymentChoice): StatementPaymentStatus | null {
  return choice === 'AUTO' ? null : choice;
}

const SOURCE_LABELS: Record<StatementPaymentStatusSource, string> = {
  USER: 'Definida por você',
  FILE: 'Detectada no arquivo',
  DUE_DATE: 'Sugerida pelo vencimento',
  DEFAULT: 'Padrão, sem informação no arquivo',
};

export function describePaymentStatus(
  status: StatementPaymentStatus,
  source: StatementPaymentStatusSource,
): string {
  const statusLabel = status === 'PAID' ? 'paga' : 'em aberto';
  return `Fatura ${statusLabel}. ${SOURCE_LABELS[source]}.`;
}
