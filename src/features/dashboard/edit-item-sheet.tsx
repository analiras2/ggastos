import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryField } from '@/features/categories';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Button } from '@/shared/ui/core/button';
import { Icon } from '@/shared/ui/core/icon';
import { SheetModal } from '@/shared/ui/core/sheet-modal';
import { TagsField } from '@/shared/ui/forms/tags-field';
import type { EditTarget } from '@/features/dashboard/format-item-details';
import { useEditItemViewModel } from '@/features/dashboard/use-edit-item-view-model';

const SAVE_ICON_SIZE = 18;

type EditItemSheetProps = { target: EditTarget | null; onClose: () => void };

// The form starts fresh for every item because it is keyed by the item's id.
export function EditItemSheet({ target, onClose }: EditItemSheetProps) {
  return (
    <SheetModal visible={target !== null} title="Editar item" subtitle={target?.title} onClose={onClose}>
      {target ? <EditItemForm key={target.id} target={target} onClose={onClose} /> : null}
    </SheetModal>
  );
}

function EditItemForm({ target, onClose }: { target: EditTarget; onClose: () => void }) {
  const viewModel = useEditItemViewModel(target, onClose);

  return (
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
        icon={<Icon name="check" size={SAVE_ICON_SIZE} color={GgastosColors.bgBase} />}
        onPress={viewModel.handleSave}
      >
        {viewModel.isSaving ? 'Salvando...' : 'Salvar'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space5 },
  field: { gap: GgastosSpacing.space2 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
