import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { impactTypeSchema, type ImpactType } from '@/features/planning/planning-schema';
import { categoriesKey, categoryNamesKey, type CategoryOption } from '@/features/planning/use-categories';
import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';

type CategoryManagementViewModel = {
  categories: CategoryOption[];
  isLoading: boolean;
  errorMessage: string | null;
  actionErrorMessage: string | null;
  editingCategory: CategoryOption | null;
  editingName: string;
  setEditingName: (value: string) => void;
  openEditor: (category: CategoryOption) => void;
  closeEditor: () => void;
  save: () => Promise<void>;
  toggleVisibility: () => Promise<void>;
  isSaving: boolean;
};

const managementKey = [...categoriesKey, 'management'];

async function listManagedCategories(): Promise<CategoryOption[]> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id,code,name,impact_type,user_id,is_active,parent_id')
    .or('user_id.not.is.null,parent_id.is.null')
    .order('is_active', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    impactType: impactTypeSchema.parse(row.impact_type) as ImpactType,
    isPersonal: row.user_id !== null,
    isActive: row.is_active as boolean,
  }));
}

export function useCategoryManagementViewModel(): CategoryManagementViewModel {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: managementKey, queryFn: listManagedCategories });
  const [editingCategory, setEditingCategory] = useState<CategoryOption | null>(null);
  const [editingName, setEditingName] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const updateCategory = useMutation({
    mutationFn: async ({ id, name, isActive }: { id: string; name?: string; isActive?: boolean }) => {
      if (!supabase) {
        throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
      }
      const updates: { name?: string; is_active?: boolean } = {};
      if (name !== undefined) updates.name = name.trim();
      if (isActive !== undefined) updates.is_active = isActive;
      const { error } = await supabase.from('categories').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoriesKey }),
        queryClient.invalidateQueries({ queryKey: categoryNamesKey }),
        queryClient.invalidateQueries({ queryKey: managementKey }),
      ]);
    },
  });

  const openEditor = useCallback((category: CategoryOption) => {
    if (!category.isPersonal) return;
    setEditingCategory(category);
    setEditingName(category.name);
    setActionErrorMessage(null);
  }, []);

  const closeEditor = useCallback(() => {
    setEditingCategory(null);
    setEditingName('');
    setActionErrorMessage(null);
  }, []);

  const save = useCallback(async () => {
    if (!editingCategory || !editingName.trim()) return;
    try {
      await updateCategory.mutateAsync({ id: editingCategory.id, name: editingName });
      closeEditor();
    } catch (error) {
      setActionErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a categoria.');
    }
  }, [closeEditor, editingCategory, editingName, updateCategory]);

  const toggleVisibility = useCallback(async () => {
    if (!editingCategory) return;
    try {
      await updateCategory.mutateAsync({ id: editingCategory.id, isActive: !editingCategory.isActive });
      closeEditor();
    } catch (error) {
      setActionErrorMessage(error instanceof Error ? error.message : 'Não foi possível atualizar a categoria.');
    }
  }, [closeEditor, editingCategory, updateCategory]);

  return useMemo(() => ({
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    errorMessage: categoriesQuery.isError ? 'Não foi possível carregar as categorias.' : null,
    actionErrorMessage,
    editingCategory,
    editingName,
    setEditingName,
    openEditor,
    closeEditor,
    save,
    toggleVisibility,
    isSaving: updateCategory.isPending,
  }), [actionErrorMessage, categoriesQuery.data, categoriesQuery.isError, categoriesQuery.isLoading, closeEditor, editingCategory, editingName, openEditor, save, toggleVisibility, updateCategory.isPending]);
}
