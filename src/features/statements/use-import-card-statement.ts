import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { FunctionsHttpError } from '@supabase/supabase-js';

import { invalidateMonthData } from '@/shared/lib/query/invalidate-month-data';
import { requireSupabase } from '@/shared/lib/supabase/require-supabase';
import {
  formatImportError,
  getHttpErrorMessage,
} from '@/features/statements/import-card-statement-errors';
import { UNCATEGORIZED_TRANSACTIONS_ROOT_KEY } from '@/features/statements/use-uncategorized-transactions';
import { STATEMENT_INVOICES_KEY } from '@/features/statements/use-statement-invoices';

export type StatementBank = 'NUBANK' | 'BRADESCO' | 'MERCADO_PAGO';
export type StatementPaymentStatus = 'PAID' | 'OPEN';
// Where the applied payment status came from: the user, the file, the due date or the default.
export type StatementPaymentStatusSource = 'USER' | 'FILE' | 'DUE_DATE' | 'DEFAULT';

export type ImportCardStatementInput = {
  // Leave it out: the server recognizes the bank from the file.
  bank?: StatementBank;
  fileName: string;
  contents: string;
  invoiceMonth?: string | null;
  fileHash?: string | null;
  // Omit it to let the app suggest one from the file or the due date.
  paymentStatus?: StatementPaymentStatus | null;
};

export type ImportCardStatementResult = {
  batchId: string;
  bank: StatementBank;
  accountId: string;
  rowsRead: number;
  rowsImported: number;
  rowsDuplicated: number;
  rowsSkipped: number;
  rowsFailed: number;
  matchesCreated: number;
  paymentStatus: StatementPaymentStatus;
  paymentStatusSource: StatementPaymentStatusSource;
};

const reconciliationInboxKeyPrefix = ['reconciliation-inbox'];

async function invokeImportCardStatement(
  input: ImportCardStatementInput
): Promise<ImportCardStatementResult> {
  const client = requireSupabase();

  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session?.access_token) {
    throw new Error('É preciso estar autenticado para importar a fatura.');
  }

  const { data, error } = await client.functions.invoke<ImportCardStatementResult>(
    'import-card-statement',
    {
      body: input,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const message = await getHttpErrorMessage(error);
      if (message) {
        throw new Error(message);
      }
    }

    throw error;
  }

  if (!data) {
    throw new Error('A Edge Function não retornou o resumo da importação.');
  }

  return data;
}

export function useImportCardStatement(): UseMutationResult<
  ImportCardStatementResult,
  Error,
  ImportCardStatementInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invokeImportCardStatement,
    onSuccess: async () => {
      await Promise.all([
        invalidateMonthData(queryClient),
        queryClient.invalidateQueries({ queryKey: reconciliationInboxKeyPrefix }),
        // The pending count (tab badge and the Pendências list) comes from these two.
        queryClient.invalidateQueries({ queryKey: UNCATEGORIZED_TRANSACTIONS_ROOT_KEY }),
        queryClient.invalidateQueries({ queryKey: STATEMENT_INVOICES_KEY }),
      ]);
    },
    throwOnError: false,
    meta: {
      errorFormatter: formatImportError,
    },
  });
}

export function getFormattedImportCardStatementError(error: unknown): string {
  return formatImportError(error);
}
