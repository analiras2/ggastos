import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';
import { monthDashboardSchema, type MonthDashboard } from '@/features/dashboard/dashboard-schema';

export const monthDashboardKey = (month: string) => ['month-dashboard', month];

async function fetchMonthDashboard(month: string): Promise<MonthDashboard> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { error: generateError } = await supabase.rpc('generate_planned_entries', {
    p_month: month,
  });

  if (generateError) {
    throw generateError;
  }

  const { data, error } = await supabase.rpc('get_month_dashboard', { p_month: month });

  if (error) {
    throw error;
  }

  return monthDashboardSchema.parse(data);
}

export function useMonthDashboard(month: string): UseQueryResult<MonthDashboard, Error> {
  return useQuery({
    queryKey: monthDashboardKey(month),
    queryFn: () => fetchMonthDashboard(month),
  });
}
