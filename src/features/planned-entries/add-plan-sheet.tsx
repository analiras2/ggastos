import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import { PlanFormFields } from '@/features/planned-entries/plan-form-fields';
import { useAddPlanViewModel } from '@/features/planned-entries/use-add-plan-view-model';

type AddPlanSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AddPlanSheet({ visible, onClose }: AddPlanSheetProps) {
  const form = useAddPlanViewModel(onClose);
  const { errorMessage, isSubmitting, handleSubmit } = form;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>Novo lançamento</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={12}
              onPress={onClose}
              style={styles.closeButton}
            >
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
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Salvando...' : 'Confirmar'}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  title: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  closeButton: {
    padding: 6,
  },
  content: {
    padding: GgastosSpacing.space5,
    gap: GgastosSpacing.space5,
  },
  errorText: {
    ...GgastosType.bodySm,
    color: GgastosColors.expense,
  },
  submitButton: {
    borderRadius: GgastosRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: GgastosColors.brandPrimary,
  },
  submitButtonText: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
