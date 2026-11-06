import type { PaymentChoice } from '@/features/statements/payment-status-labels';
import type {
  ImportCardStatementResult,
  StatementBank,
} from '@/features/statements/use-import-card-statement';

export type ImportSummaryRow = {
  label: string;
  value: string;
};

export interface StatementImportViewModel {
  selectedBank: StatementBank;
  setSelectedBank: (bank: string) => void;
  paymentChoice: PaymentChoice;
  setPaymentChoice: (choice: string) => void;
  paymentStatusMessage: string | null;
  selectedFileName: string | null;
  importBatchId: string | null;
  errorMessage: string | null;
  successMessage: string | null;
  importSummary: ImportSummaryRow[];
  isPickingFile: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  handlePickFile: () => Promise<void>;
  clearSelectedFile: () => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

export function isStatementBank(value: string): value is StatementBank {
  return value === 'NUBANK' || value === 'BRADESCO';
}

function formatBankName(bank: StatementBank): string {
  return bank === 'NUBANK' ? 'Nubank' : 'Bradesco';
}

export function buildImportSummary(result: ImportCardStatementResult | null): ImportSummaryRow[] {
  if (!result) {
    return [];
  }

  return [
    { label: 'Lidas', value: String(result.rowsRead) },
    { label: 'Importadas', value: String(result.rowsImported) },
    { label: 'Duplicadas', value: String(result.rowsDuplicated) },
    { label: 'Ignoradas', value: String(result.rowsSkipped) },
    { label: 'Falhas', value: String(result.rowsFailed) },
    { label: 'Matches', value: String(result.matchesCreated) },
  ];
}

export function buildSuccessMessage(result: ImportCardStatementResult | null): string | null {
  return result
    ? `${formatBankName(result.bank)} importado. ${result.rowsImported} novas linhas e ${result.rowsDuplicated} duplicadas.`
    : null;
}
