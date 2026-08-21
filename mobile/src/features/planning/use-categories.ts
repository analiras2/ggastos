import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';
import { impactTypeSchema, type ImpactType } from '@/features/planning/planning-schema';

export type CategoryOption = {
  id: string;
  code: string;
  name: string;
  impactType: ImpactType;
  isPersonal: boolean;
  isActive: boolean;
};

export const categoriesKey = ['categories'];
export const categoryNamesKey = ['category-names'];

export type CategoryName = { id: string; name: string };

async function listCategories(): Promise<CategoryOption[]> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id,code,name,impact_type,user_id,is_active,parent_id')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).filter((row) => row.user_id !== null).map((row) => ({
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    impactType: impactTypeSchema.parse(row.impact_type),
    isPersonal: row.user_id !== null,
    isActive: row.is_active as boolean,
  }));
}

export function useCategories(): UseQueryResult<CategoryOption[], Error> {
  return useQuery({ queryKey: categoriesKey, queryFn: listCategories });
}

async function listCategoryNames(): Promise<CategoryName[]> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase.from('categories').select('id,name');
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id as string, name: row.name as string }));
}

export function useCategoryNames(): UseQueryResult<CategoryName[], Error> {
  return useQuery({ queryKey: categoryNamesKey, queryFn: listCategoryNames });
}

type CreateCategoryInput = { name: string; impactType: ImpactType };

export function useCreatePersonalCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, impactType }: CreateCategoryInput) => {
      if (!supabase) {
        throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
      }

      const { data, error } = await supabase.rpc('create_personal_category', {
        p_name: name.trim(),
        p_impact_type: impactType,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoriesKey }),
        queryClient.invalidateQueries({ queryKey: categoryNamesKey }),
      ]);
    },
  });
}
