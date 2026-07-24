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
import { monthDashboardKey } from '@/features/dashboard/use-month-dashboard';

export type MonthSnapshotResult = {
  id: string;
  month: string;
  status: 'OPEN' | 'CLOSED';
  computedAt: string;
};

/** T7's annual-summary hook should key its query as ['annual-summary', year] to match this prefix. */
const annualSummaryKeyPrefix = ['annual-summary'];

function formatCloseMonthError(error: unknown): string {
  if (error instanceof FunctionsRelayError) {
    return 'A relay do Supabase não conseguiu encaminhar o fechamento do mês.';
  }

  if (error instanceof FunctionsFetchError) {
    return 'O app não conseguiu alcançar a Edge Function de fechamento.';
  }

  if (error instanceof FunctionsHttpError) {
    return 'A Edge Function retornou erro ao fechar o mês.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível fechar o mês.';
}

async function invokeCloseMonth(month: string): Promise<MonthSnapshotResult> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('É preciso estar autenticado para fechar o mês.');
  }

  const { data, error } = await supabase.functions.invoke<MonthSnapshotResult>(
    'recalculate-month-snapshot',
    {
      body: { month },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('A Edge Function não retornou o snapshot do mês.');
  }

  return data;
}

export function useCloseMonth(): UseMutationResult<
  MonthSnapshotResult,
  Error,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invokeCloseMonth,
    onSuccess: async (_data, month) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: monthDashboardKey(month) }),
        queryClient.invalidateQueries({ queryKey: annualSummaryKeyPrefix }),
      ]);
    },
    throwOnError: false,
    meta: {
      errorFormatter: formatCloseMonthError,
    },
  });
}

export function getFormattedCloseMonthError(error: unknown): string {
  return formatCloseMonthError(error);
}
