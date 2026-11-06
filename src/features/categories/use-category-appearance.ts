import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { CategoryAppearanceMap } from '@/features/categories/category-appearance';
import { categoriesKey } from '@/features/planning/use-categories';
import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';

// Under the ['categories'] prefix so creating or editing a category refreshes it.
export const categoryAppearanceKey = [...categoriesKey, 'appearance'];

async function fetchCategoryAppearance(): Promise<CategoryAppearanceMap> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase.from('categories').select('id,icon,color');

  if (error) {
    throw error;
  }

  const appearanceById: CategoryAppearanceMap = {};
  for (const row of data ?? []) {
    appearanceById[row.id as string] = {
      icon: (row.icon as string | null) ?? null,
      color: (row.color as string | null) ?? null,
    };
  }
  return appearanceById;
}

export function useCategoryAppearance(): UseQueryResult<CategoryAppearanceMap, Error> {
  return useQuery({ queryKey: categoryAppearanceKey, queryFn: fetchCategoryAppearance });
}
