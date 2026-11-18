import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { requireSupabase } from '@/shared/lib/supabase/require-supabase';
import { CATEGORY_COLUMNS, categoryOptionFromRow, type CategoryOption } from '@/features/categories/category-row';
import { categoriesKey, categoryNamesKey } from '@/features/categories/use-categories';

const managedCategoriesKey = [...categoriesKey, 'management'];

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  isActive?: boolean;
  icon?: string;
  color?: string;
};

// Every category the user can manage: the personal ones and the defaults, hidden ones included.
async function listManagedCategories(): Promise<CategoryOption[]> {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .or('user_id.not.is.null,parent_id.is.null')
    .order('is_active', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(categoryOptionFromRow);
}

async function updateCategory({ id, name, isActive, icon, color }: UpdateCategoryInput): Promise<void> {
  const supabase = requireSupabase();
  const updates: { name?: string; is_active?: boolean; icon?: string; color?: string } = {};
  if (name !== undefined) updates.name = name.trim();
  if (isActive !== undefined) updates.is_active = isActive;
  if (icon !== undefined) updates.icon = icon;
  if (color !== undefined) updates.color = color;

  const { error } = await supabase.from('categories').update(updates).eq('id', id);
  if (error) throw error;
}

export function useManagedCategories(): UseQueryResult<CategoryOption[], Error> {
  return useQuery({ queryKey: managedCategoriesKey, queryFn: listManagedCategories });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoriesKey }),
        queryClient.invalidateQueries({ queryKey: categoryNamesKey }),
        queryClient.invalidateQueries({ queryKey: managedCategoriesKey }),
      ]);
    },
  });
}
