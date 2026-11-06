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

export type ReconciliationAction = 'confirm' | 'reject' | 'undo';

export type ReconciliationDecisionInput = {
  plannedEntryId: string;
  transactionId: string;
};

type ReconciliationDecisionResult = {
  action: ReconciliationAction;
  plannedEntryId: string;
  transactionId: string;
  status: 'ok';
};

function formatReconciliationDecisionError(error: unknown): string {
  if (error instanceof FunctionsHttpError) {
    const status = error.context instanceof Response ? error.context.status : null;

    if (status === 404) {
      return 'Esse par de conciliação não foi encontrado.';
    }

    if (status === 409) {
      return 'Essa conciliação já foi decidida ou não há uma correspondência ativa para desfazer.';
    }

    return 'A Edge Function retornou erro ao processar a decisão de conciliação.';
  }

  if (error instanceof FunctionsRelayError) {
    return 'A relay do Supabase não conseguiu encaminhar a decisão.';
  }

  if (error instanceof FunctionsFetchError) {
    return 'O app não conseguiu alcançar a Edge Function de conciliação.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível registrar a decisão de conciliação.';
}

async function invokeReconciliationDecision(
  action: ReconciliationAction,
  input: ReconciliationDecisionInput
): Promise<ReconciliationDecisionResult> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('É preciso estar autenticado para decidir a conciliação.');
  }

  const { data, error } = await supabase.functions.invoke<ReconciliationDecisionResult>(
    'reconcile-transactions',
    {
      body: {
        action,
        plannedEntryId: input.plannedEntryId,
        transactionId: input.transactionId,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('A Edge Function não retornou confirmação da decisão.');
  }

  return data;
}

function useReconciliationDecisionMutation(
  action: ReconciliationAction
): UseMutationResult<ReconciliationDecisionResult, Error, ReconciliationDecisionInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReconciliationDecisionInput) =>
      invokeReconciliationDecision(action, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reconciliation-inbox'] }),
        queryClient.invalidateQueries({ queryKey: ['month-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['planned-entries'] }),
      ]);
    },
    throwOnError: false,
    meta: {
      errorFormatter: formatReconciliationDecisionError,
    },
  });
}

export function useConfirmMatch(): UseMutationResult<
  ReconciliationDecisionResult,
  Error,
  ReconciliationDecisionInput
> {
  return useReconciliationDecisionMutation('confirm');
}

export function useRejectMatch(): UseMutationResult<
  ReconciliationDecisionResult,
  Error,
  ReconciliationDecisionInput
> {
  return useReconciliationDecisionMutation('reject');
}

export function useUndoMatch(): UseMutationResult<
  ReconciliationDecisionResult,
  Error,
  ReconciliationDecisionInput
> {
  return useReconciliationDecisionMutation('undo');
}

export function getFormattedReconciliationDecisionError(error: unknown): string {
  return formatReconciliationDecisionError(error);
}
