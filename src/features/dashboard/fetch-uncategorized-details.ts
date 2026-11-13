import { missingSupabaseEnv, supabase } from '@/shared/lib/supabase/client';
import { categoryDetailsSchema, type CategoryDetails } from '@/features/dashboard/contract';
import { UNCATEGORIZED_CATEGORY_ID } from '@/features/dashboard/uncategorized';

const UNCATEGORIZED_NAME = 'Sem categoria';

// The purchases of the month that still have no category, shaped like a category's details.
export async function fetchUncategorizedDetails(month: string): Promise<CategoryDetails> {
  if (!supabase) {
    throw new Error(`Missing env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('imported_transactions')
    .select(
      'id,description,amount_cents,posted_at,merchant_name,payment_method,tags,note,description_raw,statement_installment_index,statement_installment_total,statement_source_bank,impact_type'
    )
    .eq('competency_month', month)
    .is('internal_category_id', null)
    .is('deleted_at', null)
    .eq('is_hidden_from_budget', false)
    .eq('is_internal_transfer', false)
    .order('posted_at', { ascending: false });

  if (error) {
    throw error;
  }

  return categoryDetailsSchema.parse({
    month,
    categoryId: UNCATEGORIZED_CATEGORY_ID,
    categoryCode: 'uncategorized',
    name: UNCATEGORIZED_NAME,
    impactType: 'EXPENSE',
    plannedEntries: [],
    importedTransactions: (data ?? []).map((row) => ({
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
      impactType: row.impact_type,
    })),
  });
}
