import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';
import { categoryDetailsSchema, type CategoryDetails } from '@/features/dashboard/dashboard-schema';

const categoryDetailsKey = (month: string, categoryId: string) => [
  'category-details',
  month,
  categoryId,
];

async function fetchCategoryDetails(month: string, categoryId: string): Promise<CategoryDetails> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const [categoryResult, plannedResult, transactionsResult] = await Promise.all([
    supabase.from('categories').select('code,name,impact_type').eq('id', categoryId).single(),
    supabase
      .from('planned_entries')
      .select('id,title,amount_cents,status,due_date,installment_index,installment_total')
      .eq('month', month)
      .eq('category_id', categoryId)
      .neq('status', 'CANCELLED')
      .order('created_at', { ascending: true }),
    supabase
      .from('imported_transactions')
      .select('id,description,amount_cents,posted_at,merchant_name')
      .eq('competency_month', month)
      .eq('internal_category_id', categoryId)
      .is('deleted_at', null)
      .order('posted_at', { ascending: false }),
  ]);

  if (categoryResult.error) {
    throw categoryResult.error;
  }
  if (plannedResult.error) {
    throw plannedResult.error;
  }
  if (transactionsResult.error) {
    throw transactionsResult.error;
  }

  return categoryDetailsSchema.parse({
    month,
    categoryId,
    categoryCode: categoryResult.data.code,
    name: categoryResult.data.name,
    impactType: categoryResult.data.impact_type,
    plannedEntries: (plannedResult.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      amountCents: row.amount_cents,
      status: row.status,
      dueDate: row.due_date,
      installmentIndex: row.installment_index,
      installmentTotal: row.installment_total,
    })),
    importedTransactions: (transactionsResult.data ?? []).map((row) => ({
      id: row.id,
      description: row.description,
      amountCents: row.amount_cents,
      postedAt: row.posted_at,
      merchantName: row.merchant_name,
    })),
  });
}

export function useCategoryDetails(
  month: string,
  categoryId: string | null
): UseQueryResult<CategoryDetails, Error> {
  return useQuery({
    queryKey: categoryDetailsKey(month, categoryId ?? ''),
    queryFn: () => fetchCategoryDetails(month, categoryId as string),
    enabled: categoryId !== null,
  });
}
