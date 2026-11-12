import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import type { EditablePlannedEntry } from '@/features/planned-entries/plan-edit-rules';
import { PlanFormFields } from '@/features/planned-entries/plan-form-fields';
import { useAddPlanViewModel } from '@/features/planned-entries/use-add-plan-view-model';

type AddPlanSheetProps = {
  visible: boolean;
  onClose: () => void;
  // When given, the form edits this planned entry instead of creating a new one.
  entry?: EditablePlannedEntry;
};

// The form is mounted only while open, so it always starts from a blank entry or from the one being edited.
export function AddPlanSheet({ visible, onClose, entry }: AddPlanSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          {visible ? <AddPlanForm key={entry?.id ?? 'new'} entry={entry} onClose={onClose} /> : null}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function AddPlanForm({ entry, onClose }: { entry?: EditablePlannedEntry; onClose: () => void }) {
  const form = useAddPlanViewModel(onClose, entry);
  const { errorMessage, isSubmitting, handleSubmit, isEditing } = form;

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{isEditing ? 'Editar lançamento' : 'Novo lançamento'}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12} onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={18} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PlanFormFields form={form} />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Confirmar'}</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  closeButton: { padding: 6 },
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space5 },
  errorText: { ...GgastosType.bodySm, color: GgastosColors.expense },
  submitButton: {
    borderRadius: GgastosRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: GgastosColors.brandPrimary,
  },
  submitButtonText: { ...GgastosType.bodyMd, fontWeight: '700', color: '#FFFFFF' },
  buttonDisabled: { opacity: 0.55 },
});
