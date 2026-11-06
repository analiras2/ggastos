import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { missingSupabaseEnv, supabase } from '@/shared/lib/supabase/client';
import { invalidateMonthData } from '@/shared/lib/query/invalidate-month-data';
import { currentMonthKey } from '@/shared/lib/month';
import { walletSchema, type Wallet } from '@/features/wallet/contract';

export const walletKey = (month: string) => ['wallet', month];

async function callWalletRpc(functionName: string, args: Record<string, string | number>): Promise<Wallet> {
  if (!supabase) {
    throw new Error(`Missing env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase.rpc(functionName, args);
  if (error) {
    throw error;
  }

  return walletSchema.parse(data);
}

// The wallet is the balance of today, so it always uses the current month.
export function useWallet(): UseQueryResult<Wallet, Error> {
  const month = currentMonthKey();
  return useQuery({
    queryKey: walletKey(month),
    queryFn: () => callWalletRpc('get_wallet', { p_current_month: month }),
  });
}

// Makes the wallet show `balanceCents` now.
export function useSetWalletBalance(): UseMutationResult<Wallet, Error, number> {
  const queryClient = useQueryClient();
  const month = currentMonthKey();

  return useMutation({
    mutationFn: (balanceCents) =>
      callWalletRpc('set_wallet_balance', { p_current_month: month, p_balance_cents: balanceCents }),
    onSuccess: (wallet) => {
      queryClient.setQueryData(walletKey(month), wallet);
      void invalidateMonthData(queryClient);
    },
  });
}
