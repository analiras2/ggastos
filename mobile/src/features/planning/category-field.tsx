import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';
import { CategoryPickerList } from '@/features/planning/category-picker-list';
import type { CategoryOption } from '@/features/planning/use-categories';

type CategoryFieldProps = {
  categories: CategoryOption[];
  isLoading: boolean;
  selectedCategoryId: string | null;
  onSelect: (id: string) => void;
};

export function CategoryField({ categories, isLoading, selectedCategoryId, onSelect }: CategoryFieldProps) {
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

      <Modal visible={isPickerVisible} animationType="slide" onRequestClose={() => setIsPickerVisible(false)}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.modalScreen} edges={['top']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Categoria</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                hitSlop={12}
                onPress={() => setIsPickerVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="x" size={18} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <CategoryPickerList
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelect={handleSelect}
              />
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
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
  modalScreen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  modalTitle: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  closeButton: {
    padding: 6,
  },
  modalContent: {
    padding: GgastosSpacing.space5,
  },
});
