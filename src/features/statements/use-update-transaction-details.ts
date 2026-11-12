import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { invalidateMonthData } from '@/shared/lib/query/invalidate-month-data';
import { requireSupabase } from '@/shared/lib/supabase/require-supabase';
import { UNCATEGORIZED_TRANSACTIONS_ROOT_KEY } from '@/features/statements/use-uncategorized-transactions';

export type UpdateTransactionDetailsInput = {
  transactionId: string;
  categoryId: string;
  // Replaces the stored tags, so an empty list clears them.
  tags: string[];
};

async function updateTransactionDetails({ transactionId, categoryId, tags }: UpdateTransactionDetailsInput): Promise<void> {
  const { error } = await requireSupabase()
    .from('imported_transactions')
    .update({ internal_category_id: categoryId, tags })
    .eq('id', transactionId);

  if (error) {
    throw error;
  }
}

// Changes the category and tags of an already imported transaction.
export function useUpdateTransactionDetails(): UseMutationResult<void, Error, UpdateTransactionDetailsInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransactionDetails,
    onSuccess: async () => {
      await Promise.all([
        invalidateMonthData(queryClient),
        queryClient.invalidateQueries({ queryKey: UNCATEGORIZED_TRANSACTIONS_ROOT_KEY }),
      ]);
    },
  });
}
