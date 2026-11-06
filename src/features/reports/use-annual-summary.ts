import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';
import { annualSummarySchema, type AnnualSummary } from '@/features/reports/annual-summary-schema';

/** Must stay ['annual-summary', year] — invalidated by use-close-month.ts on close. */
export const annualSummaryKey = (year: number) => ['annual-summary', year];

async function fetchAnnualSummary(year: number): Promise<AnnualSummary> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase.rpc('get_annual_summary', { p_year: year });

  if (error) {
    throw error;
  }

  return annualSummarySchema.parse(data);
}

export function useAnnualSummary(year: number): UseQueryResult<AnnualSummary, Error> {
  return useQuery({
    queryKey: annualSummaryKey(year),
    queryFn: () => fetchAnnualSummary(year),
  });
}
