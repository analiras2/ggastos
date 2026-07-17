import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';
import { impactTypeSchema, type ImpactType } from '@/features/planning/planning-schema';

export type CategoryOption = {
  id: string;
  code: string;
  name: string;
  impactType: ImpactType;
};

const categoriesKey = ['categories'];

async function listCategories(): Promise<CategoryOption[]> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id,code,name,impact_type')
    .eq('is_active', true)
    .not('parent_id', 'is', null)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    impactType: impactTypeSchema.parse(row.impact_type),
  }));
}

export function useCategories(): UseQueryResult<CategoryOption[], Error> {
  return useQuery({ queryKey: categoriesKey, queryFn: listCategories });
}
