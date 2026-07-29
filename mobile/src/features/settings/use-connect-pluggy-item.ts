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
import { useSyncPluggy } from '@/features/dashboard/use-sync-pluggy';
import { connectionsStatusKey } from '@/features/settings/use-connections-status';

type ConnectTokenResult = {
  connectToken: string;
  itemId?: string;
};

type LinkPluggyItemResult = {
  connectionId: string;
  itemId: string;
  status: string;
};

const KNOWN_ERROR_MESSAGES: Record<string, string> = {
  invalid_connection_id: 'Conexão inválida.',
  connection_not_found: 'Conexão não encontrada.',
  invalid_item_id: 'Não foi possível identificar a conexão criada.',
  pluggy_credentials_not_configured: 'Conexão indisponível no momento. Tente novamente mais tarde.',
  pluggy_auth_error: 'Conexão indisponível no momento. Tente novamente mais tarde.',
};

async function formatConnectError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: string; message?: string };

      if (body.error === 'pluggy_api_error' && body.message) {
        return `Não foi possível conectar: ${body.message}`;
      }
      if (body.error && KNOWN_ERROR_MESSAGES[body.error]) {
        return KNOWN_ERROR_MESSAGES[body.error];
      }
    } catch {
      // Response body wasn't JSON — fall through to the generic message below.
    }
    return 'Não foi possível conectar a conta.';
  }

  if (error instanceof FunctionsRelayError) {
    return 'A relay do Supabase não conseguiu encaminhar a conexão.';
  }

  if (error instanceof FunctionsFetchError) {
    return 'O app não conseguiu alcançar a Edge Function de conexão.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível conectar a conta.';
}

async function requireAccessToken(): Promise<string> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('É preciso estar autenticado para conectar uma conta.');
  }

  return session.access_token;
}

async function invokeFetchConnectToken(connectionId?: string): Promise<ConnectTokenResult> {
  const accessToken = await requireAccessToken();

  const { data, error } = await supabase!.functions.invoke<ConnectTokenResult>(
    'pluggy-connect-token',
    {
      body: connectionId ? { connectionId } : {},
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (error) {
    throw new Error(await formatConnectError(error));
  }

  if (!data) {
    throw new Error('A Edge Function não retornou o token de conexão.');
  }

  return data;
}

async function invokeLinkPluggyItem(itemId: string): Promise<LinkPluggyItemResult> {
  const accessToken = await requireAccessToken();

  const { data, error } = await supabase!.functions.invoke<LinkPluggyItemResult>(
    'connect-pluggy-item',
    {
      body: { itemId },
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (error) {
    throw new Error(await formatConnectError(error));
  }

  if (!data) {
    throw new Error('A Edge Function não retornou payload de confirmação.');
  }

  return data;
}

/** Fetches a short-lived Connect Token used to open the Pluggy widget, only while the sheet is open. */
export function usePluggyConnectToken(
  enabled: boolean,
  connectionId?: string | null
): UseQueryResult<ConnectTokenResult, Error> {
  return useQuery({
    queryKey: ['pluggy-connect-token', connectionId ?? 'create'],
    queryFn: () => invokeFetchConnectToken(connectionId ?? undefined),
    enabled,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}

/** Persists the item the widget already created/updated on Pluggy's side. */
export function useLinkPluggyItem(): UseMutationResult<
  LinkPluggyItemResult,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient();
  const syncMutation = useSyncPluggy();

  return useMutation({
    mutationFn: invokeLinkPluggyItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: connectionsStatusKey });
      syncMutation.mutate();
    },
    throwOnError: false,
  });
}
