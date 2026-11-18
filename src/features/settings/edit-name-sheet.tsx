import { StyleSheet, Text, TextInput, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Button } from '@/shared/ui/core/button';
import { Icon } from '@/shared/ui/core/icon';
import { SheetModal } from '@/shared/ui/core/sheet-modal';
import { useEditNameViewModel } from '@/features/settings/use-edit-name-view-model';

const SAVE_ICON_SIZE = 18;
const INPUT_MIN_HEIGHT = 44;

type EditNameSheetProps = { visible: boolean; currentName: string; onClose: () => void };

// The form is mounted only while open, so it always starts from the current name.
export function EditNameSheet({ visible, currentName, onClose }: EditNameSheetProps) {
  return (
    <SheetModal visible={visible} title="Editar nome" onClose={onClose}>
      {visible ? <EditNameForm currentName={currentName} onClose={onClose} /> : null}
    </SheetModal>
  );
}

function EditNameForm({ currentName, onClose }: { currentName: string; onClose: () => void }) {
  const viewModel = useEditNameViewModel(currentName, onClose);

  return (
    <View style={styles.content}>
      <View style={styles.field}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          autoFocus
          accessibilityLabel="Nome"
          onChangeText={viewModel.setName}
          onSubmitEditing={viewModel.handleSave}
          placeholder="Seu nome"
          placeholderTextColor={GgastosColors.inkFaint}
          style={styles.input}
          value={viewModel.name}
        />
      </View>
      {viewModel.errorMessage ? <Text style={styles.error}>{viewModel.errorMessage}</Text> : null}
      <Button
        fullWidth
        disabled={viewModel.isSaving}
        icon={<Icon name="check" size={SAVE_ICON_SIZE} color={GgastosColors.bgBase} />}
        onPress={viewModel.handleSave}
      >
        {viewModel.isSaving ? 'Salvando...' : 'Salvar'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space5 },
  field: { gap: GgastosSpacing.space2 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  input: {
    ...GgastosType.bodyMd,
    minHeight: INPUT_MIN_HEIGHT,
    paddingHorizontal: GgastosSpacing.space4,
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
    borderRadius: GgastosRadius.md,
    backgroundColor: GgastosColors.bgSurface,
    color: GgastosColors.inkStrong,
  },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
