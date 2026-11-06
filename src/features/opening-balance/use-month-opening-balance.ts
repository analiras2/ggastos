import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { missingSupabaseEnv, supabase } from '@/shared/lib/supabase/client';
import {
  monthOpeningBalanceSchema,
  type MonthOpeningBalance,
} from '@/features/opening-balance/opening-balance-schema';

export const monthOpeningBalanceKey = (month: string) => ['month-opening-balance', month];

const ANNUAL_SUMMARY_KEY_PREFIX = ['annual-summary'];

async function callOpeningBalanceRpc(
  functionName: string,
  args: Record<string, string | number>
): Promise<MonthOpeningBalance> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase.rpc(functionName, args);

  if (error) {
    throw error;
  }

  return monthOpeningBalanceSchema.parse(data);
}

export function useMonthOpeningBalance(month: string): UseQueryResult<MonthOpeningBalance, Error> {
  return useQuery({
    queryKey: monthOpeningBalanceKey(month),
    queryFn: () => callOpeningBalanceRpc('get_month_opening_balance', { p_month: month }),
  });
}

function useOpeningBalanceMutation<TVariables>(
  month: string,
  run: (variables: TVariables) => Promise<MonthOpeningBalance>
): UseMutationResult<MonthOpeningBalance, Error, TVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: run,
    onSuccess: (result) => {
      queryClient.setQueryData(monthOpeningBalanceKey(month), result);
      void queryClient.invalidateQueries({ queryKey: ANNUAL_SUMMARY_KEY_PREFIX });
    },
  });
}

export function useCarryOverOpeningBalance(month: string) {
  return useOpeningBalanceMutation<void>(month, () =>
    callOpeningBalanceRpc('carry_over_opening_balance', { p_month: month })
  );
}

export function useSetOpeningBalance(month: string) {
  return useOpeningBalanceMutation<number>(month, (amountCents) =>
    callOpeningBalanceRpc('set_month_opening_balance', { p_month: month, p_amount_cents: amountCents })
  );
}

export function useClearOpeningBalance(month: string) {
  return useOpeningBalanceMutation<void>(month, () =>
    callOpeningBalanceRpc('clear_month_opening_balance', { p_month: month })
  );
}
