import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { CategoryField } from '@/features/categories';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Button } from '@/shared/ui/core/button';
import { Icon } from '@/shared/ui/core/icon';
import { TagsField } from '@/shared/ui/forms/tags-field';
import type { EditTarget } from '@/features/dashboard/format-item-details';
import { useEditItemViewModel } from '@/features/dashboard/use-edit-item-view-model';

type EditItemSheetProps = { target: EditTarget | null; onClose: () => void };

// The form starts fresh for every item because it is keyed by the item's id.
export function EditItemSheet({ target, onClose }: EditItemSheetProps) {
  return (
    <Modal visible={target !== null} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          {target ? <EditItemForm key={target.id} target={target} onClose={onClose} /> : null}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function EditItemForm({ target, onClose }: { target: EditTarget; onClose: () => void }) {
  const viewModel = useEditItemViewModel(target, onClose);

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Editar item</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{target.title}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12} onPress={onClose}>
          <Icon name="x" size={20} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Categoria</Text>
          <CategoryField
            categories={viewModel.categories}
            isLoading={viewModel.isLoadingCategories}
            selectedCategoryId={viewModel.categoryId}
            onSelect={viewModel.setCategoryId}
            impactTypes={[target.impactType]}
          />
        </View>
        <TagsField value={viewModel.tagsInput} onChange={viewModel.setTagsInput} />
        {viewModel.errorMessage ? <Text style={styles.error}>{viewModel.errorMessage}</Text> : null}
        <Button
          fullWidth
          disabled={viewModel.isSaving || viewModel.categoryId === null}
          icon={<Icon name="check" size={18} color={GgastosColors.bgBase} />}
          onPress={viewModel.handleSave}
        >
          {viewModel.isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: GgastosSpacing.space3, padding: GgastosSpacing.space5, borderBottomWidth: 1, borderBottomColor: GgastosColors.lineSofter },
  headerText: { flex: 1 },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space5 },
  field: { gap: GgastosSpacing.space2 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
