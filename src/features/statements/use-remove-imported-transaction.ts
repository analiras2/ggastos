import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { invalidateMonthData } from '@/shared/lib/query/invalidate-month-data';
import { requireSupabase } from '@/shared/lib/supabase/require-supabase';
import { STATEMENT_INVOICES_KEY } from '@/features/statements/use-statement-invoices';
import { UNCATEGORIZED_TRANSACTIONS_ROOT_KEY } from '@/features/statements/use-uncategorized-transactions';

async function removeImportedTransaction(transactionId: string): Promise<void> {
  const { error } = await requireSupabase().rpc('remove_imported_transaction', {
    p_transaction_id: transactionId,
  });

  if (error) {
    throw error;
  }
}

// Removes one item of a statement from the app. It stays stored as deleted, so importing the same
// file again does not bring it back.
export function useRemoveImportedTransaction(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeImportedTransaction,
    onSuccess: async () => {
      await Promise.all([
        invalidateMonthData(queryClient),
        queryClient.invalidateQueries({ queryKey: UNCATEGORIZED_TRANSACTIONS_ROOT_KEY }),
        queryClient.invalidateQueries({ queryKey: STATEMENT_INVOICES_KEY }),
      ]);
    },
  });
}
