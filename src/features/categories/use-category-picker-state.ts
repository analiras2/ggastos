import { useMemo, useState } from 'react';

import type { ImpactType } from '@/shared/contracts/finance';
import { useCreatePersonalCategory, type CategoryOption } from '@/features/categories/use-categories';
import { normalizeSearchText } from '@/shared/lib/search-text';

type CategoryPickerStateInput = {
  categories: CategoryOption[];
  initialImpactType: ImpactType;
  // When true every category is listed, whatever its type; new ones get `initialImpactType`.
  showAllTypes?: boolean;
  onSelect: (id: string) => void;
};

// Search, impact type and "create category" flow of the category picker.
export function useCategoryPickerState({
  categories,
  initialImpactType,
  showAllTypes = false,
  onSelect,
}: CategoryPickerStateInput) {
  const [search, setSearchState] = useState('');
  const [creationError, setCreationError] = useState<string | null>(null);
  const [isChoosingAppearance, setIsChoosingAppearance] = useState(false);
  const [impactType, setImpactType] = useState<ImpactType>(initialImpactType);
  const createCategory = useCreatePersonalCategory();
  const normalizedSearch = normalizeSearchText(search);

  const matchingCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          (showAllTypes || category.impactType === impactType) &&
          normalizeSearchText(category.name).includes(normalizedSearch)
      ),
    [categories, impactType, normalizedSearch, showAllTypes]
  );

  const canCreate =
    search.trim().length > 0 &&
    !matchingCategories.some((category) => normalizeSearchText(category.name) === normalizedSearch);

  function setSearch(value: string) {
    setSearchState(value);
    setCreationError(null);
    setIsChoosingAppearance(false);
  }

  async function handleCreate(icon: string, color: string) {
    try {
      const category = await createCategory.mutateAsync({ name: search, impactType, icon, color });
      onSelect((category as { id: string }).id);
    } catch (error) {
      setCreationError(error instanceof Error ? error.message : 'Não foi possível criar a categoria.');
    }
  }

  return {
    search,
    setSearch,
    impactType,
    setImpactType,
    matchingCategories,
    canCreate,
    isChoosingAppearance,
    setIsChoosingAppearance,
    creationError,
    isCreating: createCategory.isPending,
    handleCreate,
  };
}
