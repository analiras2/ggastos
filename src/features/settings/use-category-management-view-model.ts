import { useCallback, useMemo, useState } from 'react';

import { categoryColor } from '@/shared/theme/category-colors';
import { useManagedCategories, useUpdateCategory, type CategoryOption } from '@/features/categories';
import { errorMessageOf } from '@/shared/lib/error-message';

export type CategoryManagementViewModel = {
  activeCategories: CategoryOption[];
  hiddenCategories: CategoryOption[];
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

export function useCategoryManagementViewModel(): CategoryManagementViewModel {
  const categoriesQuery = useManagedCategories();
  const updateCategory = useUpdateCategory();
  const [editingCategory, setEditingCategory] = useState<CategoryOption | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIcon, setEditingIcon] = useState(DEFAULT_CATEGORY_ICON);
  const [editingColor, setEditingColor] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const categories = categoriesQuery.data;
  const activeCategories = useMemo(() => (categories ?? []).filter((category) => category.isActive), [categories]);
  const hiddenCategories = useMemo(() => (categories ?? []).filter((category) => !category.isActive), [categories]);

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
      setActionErrorMessage(errorMessageOf(error, 'Não foi possível salvar a categoria.'));
    }
  }, [closeEditor, editingCategory, editingColor, editingIcon, editingName, updateCategory]);

  const toggleVisibility = useCallback(async () => {
    if (!editingCategory) return;
    try {
      await updateCategory.mutateAsync({ id: editingCategory.id, isActive: !editingCategory.isActive });
      closeEditor();
    } catch (error) {
      setActionErrorMessage(errorMessageOf(error, 'Não foi possível atualizar a categoria.'));
    }
  }, [closeEditor, editingCategory, updateCategory]);

  return useMemo(() => ({
    activeCategories,
    hiddenCategories,
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
  }), [actionErrorMessage, activeCategories, categoriesQuery.isError, categoriesQuery.isLoading, closeEditor, editingCategory, editingColor, editingIcon, editingName, hiddenCategories, openEditor, save, toggleVisibility, updateCategory.isPending]);
}
