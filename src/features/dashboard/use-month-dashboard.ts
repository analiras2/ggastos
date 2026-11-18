import { useQueries, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/lib/supabase/require-supabase';
import { monthDashboardSchema, type MonthDashboard } from '@/features/dashboard/contract';

export const monthDashboardKey = (month: string) => ['month-dashboard', month];

async function fetchMonthDashboard(month: string): Promise<MonthDashboard> {
  const supabase = requireSupabase();

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

// Several months at once (a quarter), sharing the cache of the single-month query.
export function useMonthDashboards(months: string[]): UseQueryResult<MonthDashboard, Error>[] {
  return useQueries({
    queries: months.map((month) => ({
      queryKey: monthDashboardKey(month),
      queryFn: () => fetchMonthDashboard(month),
    })),
  });
}

export function useMonthDashboard(month: string): UseQueryResult<MonthDashboard, Error> {
  return useQuery({
    queryKey: monthDashboardKey(month),
    queryFn: () => fetchMonthDashboard(month),
  });
}
