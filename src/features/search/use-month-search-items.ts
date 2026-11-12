import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ImpactType } from '@/shared/contracts/finance';
import { missingSupabaseEnv, supabase } from '@/shared/lib/supabase/client';

export type MonthSearchItem = {
  id: string;
  source: 'PLANNED' | 'REALIZED';
  // Planned entries created by hand may have no title.
  title: string | null;
  categoryId: string | null;
  // Type of the entry itself, which can differ from its category's.
  impactType: ImpactType | null;
  amountCents: number;
  // ISO date or timestamp used for ordering and display.
  date: string | null;
  status: string | null;
  paymentMethod: string | null;
  tags: string[];
};

export const monthSearchKey = (month: string) => ['month-search', month];

async function fetchMonthSearchItems(month: string): Promise<MonthSearchItem[]> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const [plannedResult, transactionsResult] = await Promise.all([
    supabase
      .from('planned_entries')
      .select('id,title,amount_cents,status,due_date,category_id,impact_type,payment_method,tags')
      .eq('month', month)
      .neq('status', 'CANCELLED'),
    supabase
      .from('imported_transactions')
      .select('id,description,merchant_name,amount_cents,posted_at,internal_category_id,impact_type,payment_method,tags')
      .eq('competency_month', month)
      .is('deleted_at', null),
  ]);

  if (plannedResult.error) {
    throw plannedResult.error;
  }
  if (transactionsResult.error) {
    throw transactionsResult.error;
  }

  const planned = (plannedResult.data ?? []).map((row): MonthSearchItem => ({
    id: row.id,
    source: 'PLANNED',
    title: row.title,
    categoryId: row.category_id,
    impactType: row.impact_type,
    amountCents: row.amount_cents,
    date: row.due_date,
    status: row.status,
    paymentMethod: row.payment_method,
    tags: row.tags ?? [],
  }));

  const realized = (transactionsResult.data ?? []).map((row): MonthSearchItem => ({
    id: row.id,
    source: 'REALIZED',
    title: row.merchant_name ?? row.description,
    categoryId: row.internal_category_id,
    impactType: row.impact_type,
    amountCents: row.amount_cents,
    date: row.posted_at,
    status: null,
    paymentMethod: row.payment_method,
    tags: row.tags ?? [],
  }));

  return [...planned, ...realized];
}

export function useMonthSearchItems(
  month: string,
  enabled: boolean
): UseQueryResult<MonthSearchItem[], Error> {
  return useQuery({
    queryKey: monthSearchKey(month),
    queryFn: () => fetchMonthSearchItems(month),
    enabled,
  });
}
