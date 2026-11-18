import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/lib/supabase/require-supabase';
import type { ImpactType } from '@/shared/contracts/finance';
import { CATEGORY_COLUMNS, categoryOptionFromRow, type CategoryOption } from '@/features/categories/category-row';

export type { CategoryOption };

export const categoriesKey = ['categories'];
export const categoryNamesKey = ['category-names'];

export type CategoryName = { id: string; name: string };

async function listCategories(): Promise<CategoryOption[]> {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).filter((row) => row.user_id !== null).map(categoryOptionFromRow);
}

export function useCategories(): UseQueryResult<CategoryOption[], Error> {
  return useQuery({ queryKey: categoriesKey, queryFn: listCategories });
}

async function listCategoryNames(): Promise<CategoryName[]> {
  const supabase = requireSupabase();

  const { data, error } = await supabase.from('categories').select('id,name');
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id as string, name: row.name as string }));
}

export function useCategoryNames(): UseQueryResult<CategoryName[], Error> {
  return useQuery({ queryKey: categoryNamesKey, queryFn: listCategoryNames });
}

type CreateCategoryInput = { name: string; impactType: ImpactType; icon: string | null; color: string | null };

export function useCreatePersonalCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, impactType, icon, color }: CreateCategoryInput) => {
      const supabase = requireSupabase();

      const { data, error } = await supabase.rpc('create_personal_category', {
        p_name: name.trim(),
        p_impact_type: impactType,
        p_icon: icon,
        p_color: color,
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
