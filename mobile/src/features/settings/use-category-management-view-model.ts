import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { categoryColor } from '@/constants/category-colors';
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
  editingIcon: string;
  editingColor: string;
  setEditingName: (value: string) => void;
  setEditingIcon: (value: string) => void;
  setEditingColor: (value: string) => void;
  openEditor: (category: CategoryOption) => void;
  closeEditor: () => void;
  save: () => Promise<void>;
  toggleVisibility: () => Promise<void>;
  isSaving: boolean;
};

const DEFAULT_CATEGORY_ICON = 'tag';

const managementKey = [...categoriesKey, 'management'];

async function listManagedCategories(): Promise<CategoryOption[]> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id,code,name,impact_type,user_id,is_active,parent_id,icon,color')
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
    icon: (row.icon as string | null) ?? null,
    color: (row.color as string | null) ?? null,
  }));
}

export function useCategoryManagementViewModel(): CategoryManagementViewModel {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: managementKey, queryFn: listManagedCategories });
  const [editingCategory, setEditingCategory] = useState<CategoryOption | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIcon, setEditingIcon] = useState(DEFAULT_CATEGORY_ICON);
  const [editingColor, setEditingColor] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const updateCategory = useMutation({
    mutationFn: async ({ id, name, isActive, icon, color }: { id: string; name?: string; isActive?: boolean; icon?: string; color?: string }) => {
      if (!supabase) {
        throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
      }
      const updates: { name?: string; is_active?: boolean; icon?: string; color?: string } = {};
      if (name !== undefined) updates.name = name.trim();
      if (isActive !== undefined) updates.is_active = isActive;
      if (icon !== undefined) updates.icon = icon;
      if (color !== undefined) updates.color = color;
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
    setEditingIcon(category.icon ?? DEFAULT_CATEGORY_ICON);
    setEditingColor(category.color ?? categoryColor(category.id));
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
      await updateCategory.mutateAsync({ id: editingCategory.id, name: editingName, icon: editingIcon, color: editingColor });
      closeEditor();
    } catch (error) {
      setActionErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a categoria.');
    }
  }, [closeEditor, editingCategory, editingColor, editingIcon, editingName, updateCategory]);

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
    editingIcon,
    editingColor,
    setEditingName,
    setEditingIcon,
    setEditingColor,
    openEditor,
    closeEditor,
    save,
    toggleVisibility,
    isSaving: updateCategory.isPending,
  }), [actionErrorMessage, categoriesQuery.data, categoriesQuery.isError, categoriesQuery.isLoading, closeEditor, editingCategory, editingColor, editingIcon, editingName, openEditor, save, toggleVisibility, updateCategory.isPending]);
}
