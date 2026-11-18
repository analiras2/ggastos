import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/core/button';
import { Icon } from '@/shared/ui/core/icon';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { CategoryField } from '@/features/categories';
import { TagsField } from '@/shared/ui/forms/tags-field';
import { ReviewRuleRow } from '@/features/statements/review-rule-row';
import { useUncategorizedTransactionReviewViewModel } from '@/features/statements/use-uncategorized-transaction-review-view-model';

const CLOSE_ICON_SIZE = 20;
const CLOSE_HIT_SLOP = 12;
const EMPTY_ICON_SIZE = 24;
const SAVE_ICON_SIZE = 18;

type UncategorizedTransactionReviewSheetProps = {
  batchId?: string | null;
  transactionId?: string | null;
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

function remainingLabel(count: number) {
  if (count === 0) return 'Tudo categorizado';
  const plural = count === 1 ? '' : 's';
  return `${count} lançamento${plural} restante${plural}`;
}

export function UncategorizedTransactionReviewSheet({
  batchId,
  transactionId,
  visible,
  onClose,
  onSaved,
}: UncategorizedTransactionReviewSheetProps) {
  const viewModel = useUncategorizedTransactionReviewViewModel(batchId, transactionId, onSaved);
  const { transaction } = viewModel;
  const transactionDate = transaction ? new Date(transaction.postedAt).toLocaleDateString('pt-BR') : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Revisar categorias</Text>
              <Text style={styles.subtitle}>{remainingLabel(viewModel.remainingCount)}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={CLOSE_HIT_SLOP} onPress={onClose}>
              <Icon name="x" size={CLOSE_ICON_SIZE} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {viewModel.isLoading ? <Text style={styles.status}>Carregando lançamentos...</Text> : null}

            {!viewModel.isLoading && !transaction ? (
              <View style={styles.emptyState}>
                <Icon name="check-check" size={EMPTY_ICON_SIZE} />
                <Text style={styles.emptyTitle}>Nenhum lançamento pendente</Text>
                <Text style={styles.emptyDescription}>Todos os gastos pendentes já possuem uma categoria.</Text>
              </View>
            ) : null}

            {transaction ? (
              <>
                <View style={styles.transactionCard}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionMeta}>
                    {transactionDate} · {formatCurrencyCents(transaction.amountCents)}
                  </Text>
                </View>

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

                <TagsField value={viewModel.tagsInput} onChange={viewModel.setTagsInput} />

                <ReviewRuleRow
                  canSaveAsRule={viewModel.canSaveAsRule}
                  saveAsRule={viewModel.saveAsRule}
                  onChange={viewModel.setSaveAsRule}
                />

                {viewModel.errorMessage ? <Text style={styles.error}>{viewModel.errorMessage}</Text> : null}

                <Button
                  fullWidth
                  disabled={viewModel.isSaving || viewModel.selectedCategoryId === null}
                  icon={<Icon name="check" size={SAVE_ICON_SIZE} color={GgastosColors.bgBase} />}
                  onPress={viewModel.handleSave}
                >
                  {viewModel.isSaving ? 'Salvando...' : 'Salvar e continuar'}
                </Button>
              </>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: GgastosSpacing.space5,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space5 },
  status: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft, textAlign: 'center' },
  transactionCard: {
    gap: GgastosSpacing.space2,
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space4,
    backgroundColor: GgastosColors.bgSurface,
  },
  transactionDescription: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  transactionMeta: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  field: { gap: GgastosSpacing.space2 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
  emptyState: { alignItems: 'center', gap: GgastosSpacing.space2, paddingVertical: GgastosSpacing.space5 },
  emptyTitle: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  emptyDescription: { ...GgastosType.bodySm, textAlign: 'center', color: GgastosColors.inkSoft },
});
