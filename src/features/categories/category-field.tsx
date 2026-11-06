import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { CategoryPickerModal } from '@/features/categories/category-picker-modal';
import type { ImpactType } from '@/shared/contracts/finance';
import type { CategoryOption } from '@/features/categories/use-categories';

type CategoryFieldProps = {
  categories: CategoryOption[];
  isLoading: boolean;
  selectedCategoryId: string | null;
  onSelect: (id: string) => void;
  impactTypes?: ImpactType[];
  // Lists every category whatever its type; `newCategoryImpactType` is the type of ones created here.
  newCategoryImpactType?: ImpactType;
};

const ALL_IMPACT_TYPES: ImpactType[] = ['EXPENSE', 'INCOME', 'INVESTMENT', 'TRANSFER'];

// A field that shows the chosen category and opens the picker to change or create one.
export function CategoryField({
  categories,
  isLoading,
  selectedCategoryId,
  onSelect,
  impactTypes = ALL_IMPACT_TYPES,
  newCategoryImpactType,
}: CategoryFieldProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);

  function handleSelect(id: string) {
    onSelect(id);
    setIsPickerVisible(false);
  }

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        disabled={isLoading}
        onPress={() => setIsPickerVisible(true)}
        style={styles.input}
      >
        <Text style={selectedCategory ? styles.value : styles.placeholder}>
          {isLoading ? 'Carregando categorias...' : (selectedCategory?.name ?? 'Selecionar categoria')}
        </Text>
      </Pressable>

      {isPickerVisible ? (
        <CategoryPickerModal
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          impactTypes={impactTypes}
          initialImpactType={newCategoryImpactType ?? selectedCategory?.impactType ?? impactTypes[0]}
          showAllTypes={newCategoryImpactType !== undefined}
          onSelect={handleSelect}
          onClose={() => setIsPickerVisible(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    backgroundColor: GgastosColors.bgSurface,
  },
  value: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
  placeholder: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkFaint,
  },
});
