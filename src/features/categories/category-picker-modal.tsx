import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/shared/ui/core/icon';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { NewCategoryPanel } from '@/features/categories/new-category-panel';
import { CategoryPickerList } from '@/features/categories/category-picker-list';
import type { ImpactType } from '@/shared/contracts/finance';
import { SegmentedToggle } from '@/shared/ui/forms/segmented-toggle';
import type { CategoryOption } from '@/features/categories/use-categories';
import { useCategoryPickerState } from '@/features/categories/use-category-picker-state';

type CategoryPickerModalProps = {
  categories: CategoryOption[];
  selectedCategoryId: string | null;
  impactTypes: ImpactType[];
  initialImpactType: ImpactType;
  showAllTypes?: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
};

const IMPACT_TYPE_OPTIONS: { value: ImpactType; label: string }[] = [
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'INCOME', label: 'Receita' },
  { value: 'INVESTMENT', label: 'Investimento' },
  { value: 'TRANSFER', label: 'Transferência' },
];

// Mounted only while open, so every opening starts with a clean search.
export function CategoryPickerModal({
  categories,
  selectedCategoryId,
  impactTypes,
  initialImpactType,
  showAllTypes = false,
  onSelect,
  onClose,
}: CategoryPickerModalProps) {
  const picker = useCategoryPickerState({ categories, initialImpactType, showAllTypes, onSelect });
  const { search, impactType, canCreate, isChoosingAppearance, creationError } = picker;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>Categoria</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={12}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Icon name="x" size={18} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {showAllTypes ? null : (
              <SegmentedToggle
                options={IMPACT_TYPE_OPTIONS.filter((option) => impactTypes.includes(option.value))}
                value={impactType}
                onChange={picker.setImpactType}
              />
            )}
            <TextInput
              autoFocus
              onChangeText={picker.setSearch}
              placeholder="Pesquisar ou criar categoria"
              placeholderTextColor={GgastosColors.inkFaint}
              style={styles.searchInput}
              value={search}
            />
            <CategoryPickerList
              categories={picker.matchingCategories}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              emptyMessage={search ? 'Nenhuma categoria encontrada.' : undefined}
            />
            {canCreate && !isChoosingAppearance ? (
              <Pressable accessibilityRole="button" onPress={() => picker.setIsChoosingAppearance(true)} style={styles.createRow}>
                <Text style={styles.createText}>{`Criar “${search.trim()}”`}</Text>
              </Pressable>
            ) : null}
            {canCreate && isChoosingAppearance ? (
              <NewCategoryPanel
                name={search.trim()}
                isPending={picker.isCreating}
                onConfirm={picker.handleCreate}
                onCancel={() => picker.setIsChoosingAppearance(false)}
              />
            ) : null}
            {creationError ? <Text style={styles.error}>{creationError}</Text> : null}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  title: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  closeButton: {
    padding: 6,
  },
  content: {
    padding: GgastosSpacing.space5,
    gap: GgastosSpacing.space4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
    backgroundColor: GgastosColors.bgSurface,
  },
  createRow: {
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space4,
    backgroundColor: GgastosColors.brandPrimarySofter,
  },
  createText: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.brandPrimary },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
