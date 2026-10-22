import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';

export type StatementBank = 'NUBANK' | 'BRADESCO';

export type ImportCardStatementInput = {
  bank: StatementBank;
  fileName: string;
  contents: string;
  invoiceMonth?: string | null;
  fileHash?: string | null;
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
};

const monthDashboardKeyPrefix = ['month-dashboard'];
const reconciliationInboxKeyPrefix = ['reconciliation-inbox'];

type HttpErrorResponse = {
  json: () => Promise<unknown>;
};

function isHttpErrorResponse(value: unknown): value is HttpErrorResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'json' in value && typeof value.json === 'function';
}

function getHttpErrorMessage(error: FunctionsHttpError): Promise<string | null> {
  const response = error.context;
  if (!isHttpErrorResponse(response)) {
    return Promise.resolve(null);
  }

  return response.json()
    .then((body: unknown) => {
      if (!body || typeof body !== 'object' || !('message' in body)) {
        return null;
      }

      const { message } = body;
      return typeof message === 'string' && message.trim().length > 0 ? message : null;
    })
    .catch(() => null);
}

function formatImportError(error: unknown): string {
  if (error instanceof FunctionsRelayError) {
    return 'A relay do Supabase não conseguiu encaminhar a importação.';
  }

  if (error instanceof FunctionsFetchError) {
    return 'O app não conseguiu alcançar a Edge Function de importação.';
  }

  if (error instanceof FunctionsHttpError) {
    return 'A fatura não pôde ser importada. Verifique o banco selecionado e o arquivo CSV.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível importar a fatura.';
}

async function invokeImportCardStatement(
  input: ImportCardStatementInput
): Promise<ImportCardStatementResult> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('É preciso estar autenticado para importar a fatura.');
  }

  const { data, error } = await supabase.functions.invoke<ImportCardStatementResult>(
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
        queryClient.invalidateQueries({ queryKey: monthDashboardKeyPrefix }),
        queryClient.invalidateQueries({ queryKey: reconciliationInboxKeyPrefix }),
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
