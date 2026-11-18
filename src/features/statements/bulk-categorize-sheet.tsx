import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/shared/ui/core/button';
import { Icon } from '@/shared/ui/core/icon';
import { SheetModal } from '@/shared/ui/core/sheet-modal';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { CategoryField } from '@/features/categories';
import { countLabel } from '@/shared/lib/counts';
import type { BulkCategorizeViewModel } from '@/features/statements/use-bulk-categorize-view-model';

const ICON_SIZE = 18;

type BulkCategorizeSheetProps = {
  visible: boolean;
  selectedCount: number;
  selectedTotalCents: number;
  viewModel: BulkCategorizeViewModel;
  onClose: () => void;
};

function describeSkippedRules(count: number): string {
  if (count === 0) {
    return '';
  }
  return count === 1
    ? ' 1 lançamento tem descrição genérica e não gera regra.'
    : ` ${count} lançamentos têm descrição genérica e não geram regra.`;
}

function describeRules(viewModel: BulkCategorizeViewModel): string {
  if (viewModel.ruleCount === 0) {
    return 'Nenhum estabelecimento elegível para criar regra.';
  }
  const rules = countLabel(viewModel.ruleCount, 'regra', 'regras');
  return `Cria ${rules} para as próximas faturas.${describeSkippedRules(viewModel.withoutRuleCount)}`;
}

export function BulkCategorizeSheet({
  visible,
  selectedCount,
  selectedTotalCents,
  viewModel,
  onClose,
}: BulkCategorizeSheetProps) {
  return (
    <SheetModal
      visible={visible}
      title="Categorizar em lote"
      subtitle={`${countLabel(selectedCount, 'lançamento', 'lançamentos')} · ${formatCurrencyCents(selectedTotalCents)}`}
      onClose={onClose}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Categoria</Text>
          <CategoryField
            categories={viewModel.categories}
            isLoading={viewModel.isLoading}
            selectedCategoryId={viewModel.selectedCategoryId}
            onSelect={viewModel.setSelectedCategoryId}
            impactTypes={['EXPENSE']}
          />
        </View>

        <View style={styles.ruleRow}>
          <View style={styles.ruleTextGroup}>
            <Text style={styles.ruleTitle}>Usar nas próximas faturas</Text>
            <Text style={styles.ruleDescription}>{describeRules(viewModel)}</Text>
          </View>
          <Switch
            disabled={viewModel.ruleCount === 0}
            value={viewModel.createRules}
            onValueChange={viewModel.setCreateRules}
          />
        </View>

        {viewModel.errorMessage ? <Text style={styles.error}>{viewModel.errorMessage}</Text> : null}

        <Button
          fullWidth
          disabled={viewModel.isSaving || viewModel.selectedCategoryId === null || selectedCount === 0}
          icon={<Icon name="check" size={ICON_SIZE} color={GgastosColors.bgBase} />}
          onPress={viewModel.handleConfirm}
        >
          {viewModel.isSaving
            ? 'Salvando...'
            : `Categorizar ${countLabel(selectedCount, 'lançamento', 'lançamentos')}`}
        </Button>
      </ScrollView>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space5 },
  field: { gap: GgastosSpacing.space2 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space4,
    backgroundColor: GgastosColors.bgSurface,
  },
  ruleTextGroup: { flex: 1, gap: 2 },
  ruleTitle: { ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
  ruleDescription: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
