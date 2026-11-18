import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/core/button';
import { Icon } from '@/shared/ui/core/icon';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import type { PlanningTemplate } from '@/features/templates/contract';
import { useEditTemplateViewModel } from '@/features/templates/use-edit-template-view-model';

const CLOSE_ICON_SIZE = 20;

type EditTemplateSheetProps = {
  template: PlanningTemplate | null;
  effectiveMonth: string;
  onClose: () => void;
};

export function EditTemplateSheet({ template, effectiveMonth, onClose }: EditTemplateSheetProps) {
  const viewModel = useEditTemplateViewModel({ template, effectiveMonth, onClose });

  return (
    <Modal visible={template !== null} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>Editar template</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose}>
              <Icon name="x" size={CLOSE_ICON_SIZE} />
            </Pressable>
          </View>
          <View style={styles.content}>
            <Text style={styles.label}>Título</Text>
            <TextInput style={styles.input} value={viewModel.title} onChangeText={viewModel.setTitle} />
            <Text style={styles.label}>Valor por lançamento</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={formatCurrencyCents(viewModel.amountCents)}
              onChangeText={viewModel.handleChangeAmount}
            />
            {viewModel.errorMessage ? <Text style={styles.error}>{viewModel.errorMessage}</Text> : null}
            <Button fullWidth disabled={viewModel.isSaving} onPress={viewModel.handleSave}>
              {viewModel.isSaving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </View>
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
    alignItems: 'center',
    padding: GgastosSpacing.space5,
  },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space3 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  input: {
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space3,
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
    backgroundColor: GgastosColors.bgSurface,
  },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
