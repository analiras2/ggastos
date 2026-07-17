import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';
import {
  reconciliationInboxResponseSchema,
  type ReconciliationSuggestion,
} from '@/features/reconciliation/reconciliation-schema';

export const reconciliationInboxKey = (month: string) => ['reconciliation-inbox', month];

async function fetchReconciliationInbox(month: string): Promise<ReconciliationSuggestion[]> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('É preciso estar autenticado para consultar a conciliação.');
  }

  const { data, error } = await supabase.functions.invoke(
    `reconciliation-inbox?month=${encodeURIComponent(month)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('A Edge Function não retornou a caixa de conciliação.');
  }

  return reconciliationInboxResponseSchema.parse(data).suggestions;
}

export function useReconciliationInbox(
  month: string
): UseQueryResult<ReconciliationSuggestion[], Error> {
  return useQuery({
    queryKey: reconciliationInboxKey(month),
    queryFn: () => fetchReconciliationInbox(month),
  });
}
