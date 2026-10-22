import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';
import { CategoryPickerList } from '@/features/planning/category-picker-list';
import { SegmentedToggle } from '@/features/planning/segmented-toggle';
import { useCreatePersonalCategory, type CategoryOption } from '@/features/planning/use-categories';
import type { ImpactType } from '@/features/planning/planning-schema';

type CategoryFieldProps = {
  categories: CategoryOption[];
  isLoading: boolean;
  selectedCategoryId: string | null;
  onSelect: (id: string) => void;
  impactTypes?: ImpactType[];
};

const impactTypeOptions: { value: ImpactType; label: string }[] = [
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'INCOME', label: 'Receita' },
  { value: 'INVESTMENT', label: 'Investimento' },
  { value: 'TRANSFER', label: 'Transferência' },
];

export function CategoryField({ categories, isLoading, selectedCategoryId, onSelect, impactTypes = ['EXPENSE', 'INCOME', 'INVESTMENT', 'TRANSFER'] }: CategoryFieldProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [creationError, setCreationError] = useState<string | null>(null);
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const [impactType, setImpactType] = useState<ImpactType>(selectedCategory?.impactType ?? impactTypes[0]);
  const createCategory = useCreatePersonalCategory();
  const normalizedSearch = normalizeSearch(search);
  const matchingCategories = useMemo(
    () => categories.filter((category) => category.impactType === impactType && normalizeSearch(category.name).includes(normalizedSearch)),
    [categories, impactType, normalizedSearch]
  );
  const canCreate = search.trim().length > 0 && !matchingCategories.some((category) => normalizeSearch(category.name) === normalizedSearch);

  function handleSelect(id: string) {
    onSelect(id);
    setIsPickerVisible(false);
  }

  async function handleCreate() {
    try {
      const category = await createCategory.mutateAsync({ name: search, impactType });
      handleSelect((category as { id: string }).id);
      setSearch('');
    } catch (error) {
      setCreationError(error instanceof Error ? error.message : 'Não foi possível criar a categoria.');
    }
  }

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        disabled={isLoading}
        onPress={() => {
          setImpactType(selectedCategory?.impactType ?? impactTypes[0]);
          setIsPickerVisible(true);
        }}
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
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent}>
              <SegmentedToggle
                options={impactTypeOptions.filter((option) => impactTypes.includes(option.value))}
                value={impactType}
                onChange={setImpactType}
              />
              <TextInput
                autoFocus
                onChangeText={(value) => {
                  setSearch(value);
                  setCreationError(null);
                }}
                placeholder="Pesquisar ou criar categoria"
                placeholderTextColor={GgastosColors.inkFaint}
                style={styles.searchInput}
                value={search}
              />
              <CategoryPickerList
                categories={matchingCategories}
                selectedCategoryId={selectedCategoryId}
                onSelect={handleSelect}
                emptyMessage={search ? 'Nenhuma categoria encontrada.' : undefined}
              />
              {canCreate ? <Pressable accessibilityRole="button" disabled={createCategory.isPending} onPress={handleCreate} style={styles.createRow}><Text style={styles.createText}>{createCategory.isPending ? 'Criando...' : `Criar “${search.trim()}”`}</Text></Pressable> : null}
              {creationError ? <Text style={styles.error}>{creationError}</Text> : null}
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

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
}
