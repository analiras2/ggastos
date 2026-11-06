import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';
import type { CategoryOption } from '@/features/planning/use-categories';

type CategoryPickerListProps = {
  categories: CategoryOption[];
  selectedCategoryId: string | null;
  onSelect: (id: string) => void;
  emptyMessage?: string;
};

export function CategoryPickerList({ categories, selectedCategoryId, onSelect, emptyMessage }: CategoryPickerListProps) {
  if (categories.length === 0) {
    return <Text style={styles.empty}>{emptyMessage ?? 'Nenhuma categoria encontrada.'}</Text>;
  }

  return (
    <View style={styles.list}>
      {categories.map((category) => {
        const isSelected = category.id === selectedCategoryId;
        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(category.id)}
            style={[styles.row, isSelected && styles.rowSelected]}
          >
            <Text style={[styles.name, isSelected && styles.nameSelected]}>{category.name}</Text>
            {isSelected ? <Icon name="check" size={16} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
    borderRadius: GgastosRadius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
    backgroundColor: GgastosColors.bgSurface,
  },
  rowSelected: {
    backgroundColor: GgastosColors.brandPrimarySofter,
  },
  name: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
  nameSelected: {
    fontWeight: '700',
    color: GgastosColors.brandPrimary,
  },
  empty: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkSoft,
    textAlign: 'center',
    paddingVertical: GgastosSpacing.space5,
  },
});
