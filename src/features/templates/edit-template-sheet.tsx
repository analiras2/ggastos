import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/shared/ui/core/button';
import { SheetModal } from '@/shared/ui/core/sheet-modal';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import type { PlanningTemplate } from '@/features/templates/contract';
import { useEditTemplateViewModel } from '@/features/templates/use-edit-template-view-model';

type EditTemplateSheetProps = {
  template: PlanningTemplate | null;
  effectiveMonth: string;
  onClose: () => void;
};

export function EditTemplateSheet({ template, effectiveMonth, onClose }: EditTemplateSheetProps) {
  const viewModel = useEditTemplateViewModel({ template, effectiveMonth, onClose });

  return (
    <SheetModal visible={template !== null} title="Editar template" onClose={onClose}>
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
    </SheetModal>
  );
}

const styles = StyleSheet.create({
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
