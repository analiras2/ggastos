import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

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

async function saveCategoryRule(input: CategorizeTransactionInput): Promise<void> {
  if (!supabase || !input.saveAsRule) {
    return;
  }

  const ruleValue = input.description.trim();
  const { data: existingRule, error: existingRuleError } = await supabase
    .from('user_category_rules')
    .select('id')
    .eq('rule_type', 'DESCRIPTION_CONTAINS')
    .eq('rule_value', ruleValue)
    .maybeSingle();

  if (existingRuleError) {
    throw existingRuleError;
  }

  if (existingRule) {
    const { error } = await supabase
      .from('user_category_rules')
      .update({ target_category_id: input.categoryId, is_active: true })
      .eq('id', existingRule.id);

    if (error) {
      throw error;
    }
    return;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw userError;
  }
  if (!userData.user) {
    throw new Error('É preciso estar autenticado para salvar uma regra de categoria.');
  }

  const { error } = await supabase.from('user_category_rules').insert({
    user_id: userData.user.id,
    rule_type: 'DESCRIPTION_CONTAINS',
    rule_value: ruleValue,
    target_category_id: input.categoryId,
    priority: 0,
    is_active: true,
  });

  if (error) {
    throw error;
  }
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

  await saveCategoryRule(input);
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
