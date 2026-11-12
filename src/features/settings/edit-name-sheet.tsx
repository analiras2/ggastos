import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Button } from '@/shared/ui/core/button';
import { Icon } from '@/shared/ui/core/icon';
import { useEditNameViewModel } from '@/features/settings/use-edit-name-view-model';

type EditNameSheetProps = { visible: boolean; currentName: string; onClose: () => void };

// The form is mounted only while open, so it always starts from the current name.
export function EditNameSheet({ visible, currentName, onClose }: EditNameSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          {visible ? <EditNameForm currentName={currentName} onClose={onClose} /> : null}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function EditNameForm({ currentName, onClose }: { currentName: string; onClose: () => void }) {
  const viewModel = useEditNameViewModel(currentName, onClose);

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Editar nome</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12} onPress={onClose}>
          <Icon name="x" size={20} />
        </Pressable>
      </View>
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
          icon={<Icon name="check" size={18} color={GgastosColors.bgBase} />}
          onPress={viewModel.handleSave}
        >
          {viewModel.isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: GgastosSpacing.space5, borderBottomWidth: 1, borderBottomColor: GgastosColors.lineSofter },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space5 },
  field: { gap: GgastosSpacing.space2 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  input: {
    ...GgastosType.bodyMd,
    minHeight: 44,
    paddingHorizontal: GgastosSpacing.space4,
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
    borderRadius: GgastosRadius.md,
    backgroundColor: GgastosColors.bgSurface,
    color: GgastosColors.inkStrong,
  },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
