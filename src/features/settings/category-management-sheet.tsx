import { ScrollView, StyleSheet, Text } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { SheetModal } from '@/shared/ui/core/sheet-modal';
import { CategoryEditorModal } from '@/features/settings/category-editor-modal';
import { CategoryManagementRow } from '@/features/settings/category-management-row';
import { useCategoryManagementViewModel } from '@/features/settings/use-category-management-view-model';


type CategoryManagementSheetProps = { visible: boolean; onClose: () => void };

export function CategoryManagementSheet({ visible, onClose }: CategoryManagementSheetProps) {
  const viewModel = useCategoryManagementViewModel();
  const activeCategories = viewModel.categories.filter((category) => category.isActive);
  const hiddenCategories = viewModel.categories.filter((category) => !category.isActive);

  return (
    <SheetModal visible={visible} title="Categorias" subtitle="Toque em uma categoria pessoal para editar." onClose={onClose}>
      <ScrollView contentContainerStyle={styles.content}>
        {viewModel.isLoading ? <Text style={styles.status}>Carregando categorias...</Text> : null}
        {viewModel.errorMessage ? <Text style={styles.error}>{viewModel.errorMessage}</Text> : null}
        {activeCategories.map((category) => (
          <CategoryManagementRow key={category.id} category={category} onPress={() => viewModel.openEditor(category)} />
        ))}
        {hiddenCategories.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Ocultas</Text>
            {hiddenCategories.map((category) => (
              <CategoryManagementRow key={category.id} category={category} onPress={() => viewModel.openEditor(category)} />
            ))}
          </>
        ) : null}
      </ScrollView>
      <CategoryEditorModal viewModel={viewModel} />
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space2 },
  sectionTitle: { ...GgastosType.labelCaps, color: GgastosColors.inkSoft, marginTop: GgastosSpacing.space4 },
  status: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft, textAlign: 'center' },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
