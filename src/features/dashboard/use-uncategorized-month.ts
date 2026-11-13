import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { missingSupabaseEnv, supabase } from '@/shared/lib/supabase/client';
import { summarizeUncategorized, type UncategorizedSummary } from '@/features/dashboard/uncategorized';

// Same prefix as the month dashboard, so saving a category refreshes it with everything else.
export const uncategorizedMonthKey = (month: string) => ['month-dashboard', 'uncategorized', month];

async function fetchUncategorizedMonth(month: string): Promise<UncategorizedSummary | null> {
  if (!supabase) {
    throw new Error(`Missing env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('imported_transactions')
    .select('amount_cents,direction')
    .eq('competency_month', month)
    .is('internal_category_id', null)
    .is('deleted_at', null)
    .eq('is_hidden_from_budget', false)
    .eq('is_internal_transfer', false);

  if (error) {
    throw error;
  }

  return summarizeUncategorized(
    (data ?? []).map((row) => ({
      amountCents: Math.abs(row.amount_cents as number),
      direction: row.direction === 'CREDIT' ? 'CREDIT' : 'DEBIT',
    }))
  );
}

export function useUncategorizedMonth(month: string): UseQueryResult<UncategorizedSummary | null, Error> {
  return useQuery({
    queryKey: uncategorizedMonthKey(month),
    queryFn: () => fetchUncategorizedMonth(month),
  });
}
