import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/shared/ui/core/button';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { CategoryAppearancePicker } from '@/features/categories';
import type { CategoryManagementViewModel } from '@/features/settings/use-category-management-view-model';

const BACKDROP_COLOR = '#00000055';

export function CategoryEditorModal({ viewModel }: { viewModel: CategoryManagementViewModel }) {
  const { editingCategory, editingName, isSaving } = viewModel;
  const isActive = editingCategory?.isActive;

  return (
    <Modal visible={editingCategory !== null} transparent animationType="fade" onRequestClose={viewModel.closeEditor}>
      <ScrollView contentContainerStyle={styles.overlay} style={styles.overlayScroll}>
        <View style={styles.editor}>
          <Text style={styles.title}>Editar categoria</Text>
          <TextInput style={styles.input} value={editingName} onChangeText={viewModel.setEditingName} autoFocus />
          <CategoryAppearancePicker
            name={editingName}
            icon={viewModel.editingIcon}
            color={viewModel.editingColor}
            onChangeIcon={viewModel.setEditingIcon}
            onChangeColor={viewModel.setEditingColor}
          />
          <Text style={styles.helper}>Ocultar mantém os lançamentos já classificados no histórico.</Text>
          {viewModel.actionErrorMessage ? <Text style={styles.error}>{viewModel.actionErrorMessage}</Text> : null}
          <Button fullWidth disabled={isSaving || !editingName.trim()} onPress={viewModel.save}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            fullWidth
            variant={isActive ? 'danger' : 'secondary'}
            disabled={isSaving}
            onPress={viewModel.toggleVisibility}
          >
            {isActive ? 'Ocultar categoria' : 'Exibir novamente'}
          </Button>
          <Button fullWidth variant="ghost" onPress={viewModel.closeEditor}>
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayScroll: { flex: 1, backgroundColor: BACKDROP_COLOR },
  overlay: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: GgastosSpacing.space5,
    backgroundColor: BACKDROP_COLOR,
  },
  editor: {
    gap: GgastosSpacing.space3,
    borderRadius: GgastosRadius.lg,
    padding: GgastosSpacing.space5,
    backgroundColor: GgastosColors.bgSurfaceRaised,
  },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  input: {
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
  helper: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
