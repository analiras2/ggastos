import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';
import { connectionsStatusKey } from '@/features/settings/use-connections-status';

export type SyncEventPreview = {
  id: string;
  eventType: string;
  processingStatus: 'RECEIVED' | 'PROCESSED' | 'FAILED' | 'IGNORED';
  receivedAt: string;
};

type SyncInvocationResult = {
  syncEventId: string;
  status: 'RECEIVED' | 'PROCESSED' | 'FAILED' | 'IGNORED';
};

const latestSyncEventKey = ['sync-events', 'latest'];

function formatSyncError(error: unknown): string {
  if (error instanceof FunctionsRelayError) {
    return 'A relay do Supabase não conseguiu encaminhar o sync.';
  }

  if (error instanceof FunctionsFetchError) {
    return 'O app não conseguiu alcançar a Edge Function de sync.';
  }

  if (error instanceof FunctionsHttpError) {
    return 'A Edge Function retornou erro ao iniciar o sync.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível iniciar a sincronização.';
}

async function readLatestSyncEvent(): Promise<SyncEventPreview | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('sync_events')
    .select('id,event_type,processing_status,received_at')
    .order('received_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    eventType: data.event_type,
    processingStatus: data.processing_status,
    receivedAt: data.received_at,
  };
}

async function invokeSyncPluggy(): Promise<SyncInvocationResult> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('É preciso estar autenticado para iniciar a sincronização.');
  }

  const { data, error } = await supabase.functions.invoke<SyncInvocationResult>(
    'sync-pluggy',
    {
      body: { mode: 'manual' },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('A Edge Function não retornou payload de confirmação.');
  }

  return data;
}

export function useLatestSyncEvent(): UseQueryResult<SyncEventPreview | null, Error> {
  return useQuery({
    queryKey: latestSyncEventKey,
    queryFn: readLatestSyncEvent,
  });
}

export function useSyncPluggy(): UseMutationResult<
  SyncInvocationResult,
  Error,
  void,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invokeSyncPluggy,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: latestSyncEventKey }),
        queryClient.invalidateQueries({ queryKey: connectionsStatusKey }),
      ]);
    },
    throwOnError: false,
    meta: {
      errorFormatter: formatSyncError,
    },
  });
}

export function getFormattedSyncError(error: unknown): string {
  return formatSyncError(error);
}
