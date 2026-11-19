import { skipToken, useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';

import { invalidateMonthData } from '@/shared/lib/query/invalidate-month-data';
import { requireSupabase } from '@/shared/lib/supabase/require-supabase';
import { UNCATEGORIZED_TRANSACTIONS_ROOT_KEY } from '@/features/statements/use-uncategorized-transactions';

const SIMILAR_TRANSACTIONS_ROOT_KEY = ['similar-transactions'];

export type RecategorizeSimilarInput = {
  // The item the user edited; it is always included.
  transactionId: string;
  categoryId: string;
  // The merchant key of the item (see merchantKey), saved as the rule for the next statements.
  ruleValue: string;
};

export type RecategorizeSimilarResult = { updatedCount: number; rulesUpserted: number };

async function countSimilarTransactions(ruleValue: string): Promise<number> {
  const { data, error } = await requireSupabase().rpc('count_similar_imported_transactions', {
    p_rule_value: ruleValue,
  });

  if (error) {
    throw error;
  }

  return typeof data === 'number' ? data : 0;
}

async function recategorizeSimilar(input: RecategorizeSimilarInput): Promise<RecategorizeSimilarResult> {
  const { data, error } = await requireSupabase().rpc('recategorize_similar_imported_transactions', {
    p_transaction_id: input.transactionId,
    p_category_id: input.categoryId,
    p_rule_value: input.ruleValue,
  });

  if (error) {
    throw error;
  }

  const [row] = (data ?? []) as { updated_count: number; rules_upserted: number }[];
  return { updatedCount: row?.updated_count ?? 0, rulesUpserted: row?.rules_upserted ?? 0 };
}

// How many statement items share the merchant, to tell the user before changing them all.
export function useSimilarTransactionsCount(ruleValue: string | null): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: [...SIMILAR_TRANSACTIONS_ROOT_KEY, ruleValue],
    queryFn: ruleValue === null ? skipToken : () => countSimilarTransactions(ruleValue),
  });
}

// Moves every item of the same merchant to a category and keeps the choice for the next statements.
export function useRecategorizeSimilarTransactions(): UseMutationResult<
  RecategorizeSimilarResult,
  Error,
  RecategorizeSimilarInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recategorizeSimilar,
    onSuccess: async () => {
      await Promise.all([
        invalidateMonthData(queryClient),
        queryClient.invalidateQueries({ queryKey: UNCATEGORIZED_TRANSACTIONS_ROOT_KEY }),
        queryClient.invalidateQueries({ queryKey: SIMILAR_TRANSACTIONS_ROOT_KEY }),
      ]);
    },
  });
}
