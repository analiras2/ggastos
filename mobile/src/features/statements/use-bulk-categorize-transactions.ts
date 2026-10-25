import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  collectRuleValues,
  runBulkCategorization,
  type BulkCategorizeCall,
  type BulkCategorizeResult,
} from '@/features/statements/bulk-categorization';
import { merchantKey } from '@/features/statements/merchant-key';
import {
  UNCATEGORIZED_TRANSACTIONS_ROOT_KEY,
  type UncategorizedTransaction,
} from '@/features/statements/use-uncategorized-transactions';
import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';

export type BulkCategorizeInput = {
  transactions: readonly UncategorizedTransaction[];
  categoryId: string;
  createRules: boolean;
};

const rpcRowSchema = z.object({
  updated_count: z.number().int(),
  skipped_count: z.number().int(),
  rules_upserted: z.number().int(),
});

const callCategorizeRpc: BulkCategorizeCall = async ({ transactionIds, categoryId, ruleValues }) => {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase.rpc('categorize_imported_transactions', {
    p_transaction_ids: transactionIds,
    p_category_id: categoryId,
    p_rule_values: ruleValues,
  });
  if (error) {
    throw error;
  }

  const row = rpcRowSchema.parse(Array.isArray(data) ? data[0] : data);
  return { updatedCount: row.updated_count, skippedCount: row.skipped_count, rulesUpserted: row.rules_upserted };
};

type CachedPendingList = [readonly unknown[], UncategorizedTransaction[] | undefined];

export function useBulkCategorizeTransactions() {
  const queryClient = useQueryClient();

  return useMutation<BulkCategorizeResult, Error, BulkCategorizeInput, { snapshots: CachedPendingList[] }>({
    mutationFn: ({ transactions, categoryId, createRules }) =>
      runBulkCategorization(callCategorizeRpc, {
        transactionIds: transactions.map((transaction) => transaction.id),
        categoryId,
        ruleValues: createRules
          ? collectRuleValues(
              transactions.map((transaction) => transaction.description),
              merchantKey
            )
          : [],
      }),
    // Optimistic update: the categorized rows leave every pending list right away and come back
    // if the call fails. The final state always comes from the refetch in onSettled.
    onMutate: async ({ transactions }) => {
      await queryClient.cancelQueries({ queryKey: UNCATEGORIZED_TRANSACTIONS_ROOT_KEY });
      const snapshots = queryClient.getQueriesData<UncategorizedTransaction[]>({
        queryKey: UNCATEGORIZED_TRANSACTIONS_ROOT_KEY,
      });
      const removedIds = new Set(transactions.map((transaction) => transaction.id));
      for (const [queryKey, list] of snapshots) {
        if (list) {
          queryClient.setQueryData(
            queryKey,
            list.filter((transaction) => !removedIds.has(transaction.id))
          );
        }
      }
      return { snapshots };
    },
    onError: (_error, _input, context) => {
      for (const [queryKey, list] of context?.snapshots ?? []) {
        queryClient.setQueryData(queryKey, list);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: UNCATEGORIZED_TRANSACTIONS_ROOT_KEY }),
        queryClient.invalidateQueries({ queryKey: ['month-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['annual-summary'] }),
      ]);
    },
  });
}
