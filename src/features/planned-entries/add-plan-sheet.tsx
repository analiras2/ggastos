import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { SheetModal } from '@/shared/ui/core/sheet-modal';
import type { EditablePlannedEntry } from '@/features/planned-entries/plan-edit-rules';
import { PlanFormFields } from '@/features/planned-entries/plan-form-fields';
import { useAddPlanViewModel } from '@/features/planned-entries/use-add-plan-view-model';

const SUBMIT_PADDING_VERTICAL = 15;
const DISABLED_OPACITY = 0.55;

type AddPlanSheetProps = {
  visible: boolean;
  onClose: () => void;
  // When given, the form edits this planned entry instead of creating a new one.
  entry?: EditablePlannedEntry;
};

// The form is mounted only while open, so it always starts from a blank entry or from the one being edited.
export function AddPlanSheet({ visible, onClose, entry }: AddPlanSheetProps) {
  return (
    <SheetModal visible={visible} title={entry ? 'Editar lançamento' : 'Novo lançamento'} onClose={onClose}>
      {visible ? <AddPlanForm key={entry?.id ?? 'new'} entry={entry} onClose={onClose} /> : null}
    </SheetModal>
  );
}

function AddPlanForm({ entry, onClose }: { entry?: EditablePlannedEntry; onClose: () => void }) {
  const form = useAddPlanViewModel(onClose, entry);
  const { errorMessage, isSubmitting, handleSubmit, isEditing } = form;

  return (
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
  );
}

const styles = StyleSheet.create({
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space5 },
  errorText: { ...GgastosType.bodySm, color: GgastosColors.expense },
  submitButton: {
    borderRadius: GgastosRadius.lg,
    paddingVertical: SUBMIT_PADDING_VERTICAL,
    alignItems: 'center',
    backgroundColor: GgastosColors.brandPrimary,
  },
  submitButtonText: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.onPrimary },
  buttonDisabled: { opacity: DISABLED_OPACITY },
});
