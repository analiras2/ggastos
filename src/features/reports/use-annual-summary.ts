import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/lib/supabase/require-supabase';
import { annualSummarySchema, type AnnualSummary } from '@/features/reports/contract';

/** Must stay ['annual-summary', year] — invalidated by use-close-month.ts on close. */
export const annualSummaryKey = (year: number) => ['annual-summary', year];

async function fetchAnnualSummary(year: number): Promise<AnnualSummary> {
  const supabase = requireSupabase();

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
