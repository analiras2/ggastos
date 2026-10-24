import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { saveCategoryRule } from '@/features/statements/save-category-rule';
import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';

export type UncategorizedTransaction = {
  id: string;
  batchId: string;
  description: string;
  amountCents: number;
  postedAt: string;
};

export type CategorizeTransactionInput = {
  batchId: string;
  transactionId: string;
  description: string;
  categoryId: string;
  saveAsRule: boolean;
};

export const uncategorizedTransactionsKey = (batchId?: string | null) => [
  'uncategorized-transactions',
  batchId ?? 'all',
];

async function listUncategorizedTransactions(batchId?: string | null): Promise<UncategorizedTransaction[]> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  let query = supabase
    .from('imported_transactions')
    .select('id,statement_import_batch_id,description,amount_cents,posted_at')
    .is('internal_category_id', null)
    .eq('is_hidden_from_budget', false)
    .order('posted_at', { ascending: false });

  if (batchId) {
    query = query.eq('statement_import_batch_id', batchId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    batchId: row.statement_import_batch_id as string,
    description: row.description as string,
    amountCents: row.amount_cents as number,
    postedAt: row.posted_at as string,
  }));
}

async function categorizeTransaction(input: CategorizeTransactionInput): Promise<void> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { error } = await supabase
    .from('imported_transactions')
    .update({ internal_category_id: input.categoryId })
    .eq('id', input.transactionId);

  if (error) {
    throw error;
  }

  if (input.saveAsRule) {
    await saveCategoryRule({ description: input.description, categoryId: input.categoryId });
  }
}

export function useUncategorizedTransactions(
  batchId?: string | null
): UseQueryResult<UncategorizedTransaction[], Error> {
  return useQuery({
    queryKey: uncategorizedTransactionsKey(batchId),
    queryFn: () => listUncategorizedTransactions(batchId),
    enabled: batchId !== null,
  });
}

export function useCategorizeTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categorizeTransaction,
    onSuccess: async (_, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: uncategorizedTransactionsKey(input.batchId) }),
        queryClient.invalidateQueries({ queryKey: uncategorizedTransactionsKey() }),
        queryClient.invalidateQueries({ queryKey: ['month-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['annual-summary'] }),
      ]);
    },
  });
}
