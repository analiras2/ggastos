import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ImpactType } from '@/shared/contracts/finance';
import { missingSupabaseEnv, supabase } from '@/shared/lib/supabase/client';
import { categoryDetailsSchema, type CategoryDetails } from '@/features/dashboard/contract';

export const categoryDetailsKey = (month: string, categoryId: string, impactType: ImpactType) => [
  'category-details',
  month,
  categoryId,
  impactType,
];

async function fetchCategoryDetails(
  month: string,
  categoryId: string,
  impactType: ImpactType
): Promise<CategoryDetails> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const [categoryResult, plannedResult, transactionsResult] = await Promise.all([
    supabase.from('categories').select('code,name').eq('id', categoryId).single(),
    supabase
      .from('planned_entries')
      .select(
        'id,title,amount_cents,status,due_date,installment_index,installment_total,manually_confirmed_at,payment_method,tags,note,source_batch_id'
      )
      .eq('month', month)
      .eq('category_id', categoryId)
      .eq('impact_type', impactType)
      .neq('status', 'CANCELLED')
      .order('created_at', { ascending: true }),
    supabase
      .from('imported_transactions')
      .select(
        'id,description,amount_cents,posted_at,merchant_name,payment_method,tags,note,description_raw,statement_installment_index,statement_installment_total,statement_source_bank'
      )
      .eq('competency_month', month)
      .eq('internal_category_id', categoryId)
      .eq('impact_type', impactType)
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
    impactType,
    plannedEntries: (plannedResult.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      amountCents: row.amount_cents,
      status: row.status,
      dueDate: row.due_date,
      installmentIndex: row.installment_index,
      installmentTotal: row.installment_total,
      manuallyConfirmedAt: row.manually_confirmed_at,
      paymentMethod: row.payment_method,
      tags: row.tags ?? [],
      note: row.note,
      sourceBatchId: row.source_batch_id,
    })),
    importedTransactions: (transactionsResult.data ?? []).map((row) => ({
      id: row.id,
      description: row.description,
      amountCents: row.amount_cents,
      postedAt: row.posted_at,
      merchantName: row.merchant_name,
      paymentMethod: row.payment_method,
      tags: row.tags ?? [],
      note: row.note,
      descriptionRaw: row.description_raw,
      installmentIndex: row.statement_installment_index,
      installmentTotal: row.statement_installment_total,
      sourceBank: row.statement_source_bank,
    })),
  });
}

export function useCategoryDetails(
  month: string,
  categoryId: string | null,
  impactType: ImpactType | null
): UseQueryResult<CategoryDetails, Error> {
  return useQuery({
    queryKey: categoryDetailsKey(month, categoryId ?? '', impactType ?? 'EXPENSE'),
    queryFn: () => fetchCategoryDetails(month, categoryId as string, impactType as ImpactType),
    enabled: categoryId !== null && impactType !== null,
  });
}
