import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';
import { monthSnapshotKey, type MonthSnapshotResult } from '@/features/closing/use-close-month';

async function fetchMonthSnapshot(month: string): Promise<MonthSnapshotResult | null> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('month_snapshots')
    .select('id,month,status,computed_at')
    .eq('month', month)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    month: data.month,
    status: data.status as MonthSnapshotResult['status'],
    computedAt: data.computed_at,
  };
}

export function useMonthSnapshot(month: string): UseQueryResult<MonthSnapshotResult | null, Error> {
  return useQuery({
    queryKey: monthSnapshotKey(month),
    queryFn: () => fetchMonthSnapshot(month),
  });
}
