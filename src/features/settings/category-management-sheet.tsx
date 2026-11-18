import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/shared/ui/core/icon';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { CategoryEditorModal } from '@/features/settings/category-editor-modal';
import { CategoryManagementRow } from '@/features/settings/category-management-row';
import { useCategoryManagementViewModel } from '@/features/settings/use-category-management-view-model';

const CLOSE_ICON_SIZE = 20;
const CLOSE_HIT_SLOP = 12;

type CategoryManagementSheetProps = { visible: boolean; onClose: () => void };

export function CategoryManagementSheet({ visible, onClose }: CategoryManagementSheetProps) {
  const viewModel = useCategoryManagementViewModel();
  const activeCategories = viewModel.categories.filter((category) => category.isActive);
  const hiddenCategories = viewModel.categories.filter((category) => !category.isActive);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Categorias</Text>
              <Text style={styles.subtitle}>Toque em uma categoria pessoal para editar.</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={CLOSE_HIT_SLOP} onPress={onClose}>
              <Icon name="x" size={CLOSE_ICON_SIZE} />
            </Pressable>
          </View>
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
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: GgastosSpacing.space5,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space2 },
  sectionTitle: { ...GgastosType.labelCaps, color: GgastosColors.inkSoft, marginTop: GgastosSpacing.space4 },
  status: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft, textAlign: 'center' },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
