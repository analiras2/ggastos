import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ggastos/core/button';
import { Icon } from '@/components/ggastos/core/icon';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import { CategoryField } from '@/features/planning/category-field';
import { useUncategorizedTransactionReviewViewModel } from '@/features/statements/use-uncategorized-transaction-review-view-model';

type UncategorizedTransactionReviewSheetProps = {
  batchId?: string | null;
  transactionId?: string | null;
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export function UncategorizedTransactionReviewSheet({
  batchId,
  transactionId,
  visible,
  onClose,
  onSaved,
}: UncategorizedTransactionReviewSheetProps) {
  const viewModel = useUncategorizedTransactionReviewViewModel(batchId, transactionId, onSaved);
  const transactionDate = viewModel.transaction
    ? new Date(viewModel.transaction.postedAt).toLocaleDateString('pt-BR')
    : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Revisar categorias</Text>
              <Text style={styles.subtitle}>
                {viewModel.remainingCount > 0
                  ? `${viewModel.remainingCount} lançamento${viewModel.remainingCount === 1 ? '' : 's'} restante${viewModel.remainingCount === 1 ? '' : 's'}`
                  : 'Tudo categorizado'}
              </Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12} onPress={onClose}>
              <Icon name="x" size={20} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {viewModel.isLoading ? <Text style={styles.status}>Carregando lançamentos...</Text> : null}

            {!viewModel.isLoading && !viewModel.transaction ? (
              <View style={styles.emptyState}>
                <Icon name="check-check" size={24} />
                <Text style={styles.emptyTitle}>Nenhum lançamento pendente</Text>
                <Text style={styles.emptyDescription}>Todos os gastos pendentes já possuem uma categoria.</Text>
              </View>
            ) : null}

            {viewModel.transaction ? (
              <>
                <View style={styles.transactionCard}>
                  <Text style={styles.transactionDescription}>{viewModel.transaction.description}</Text>
                  <Text style={styles.transactionMeta}>
                    {transactionDate} · {formatCurrencyCents(viewModel.transaction.amountCents)}
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

                <View style={styles.ruleRow}>
                  <View style={styles.ruleTextGroup}>
                    <Text style={styles.ruleTitle}>Usar nas próximas faturas</Text>
                    <Text style={styles.ruleDescription}>
                      {viewModel.canSaveAsRule
                        ? 'Cria uma regra para este estabelecimento.'
                        : 'Descrição genérica demais para criar uma regra.'}
                    </Text>
                  </View>
                  <Switch
                    disabled={!viewModel.canSaveAsRule}
                    value={viewModel.saveAsRule && viewModel.canSaveAsRule}
                    onValueChange={viewModel.setSaveAsRule}
                  />
                </View>

                {viewModel.errorMessage ? <Text style={styles.error}>{viewModel.errorMessage}</Text> : null}

                <Button
                  fullWidth
                  disabled={viewModel.isSaving || viewModel.selectedCategoryId === null}
                  icon={<Icon name="check" size={18} color={GgastosColors.bgBase} />}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: GgastosSpacing.space5, borderBottomWidth: 1, borderBottomColor: GgastosColors.lineSofter },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space5 },
  status: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft, textAlign: 'center' },
  transactionCard: { gap: GgastosSpacing.space2, borderWidth: 1, borderColor: GgastosColors.lineSofter, borderRadius: GgastosRadius.md, padding: GgastosSpacing.space4, backgroundColor: GgastosColors.bgSurface },
  transactionDescription: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  transactionMeta: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  field: { gap: GgastosSpacing.space2 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: GgastosSpacing.space3, borderRadius: GgastosRadius.md, padding: GgastosSpacing.space4, backgroundColor: GgastosColors.bgSurface },
  ruleTextGroup: { flex: 1, gap: 2 },
  ruleTitle: { ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
  ruleDescription: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
  emptyState: { alignItems: 'center', gap: GgastosSpacing.space2, paddingVertical: GgastosSpacing.space5 },
  emptyTitle: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  emptyDescription: { ...GgastosType.bodySm, textAlign: 'center', color: GgastosColors.inkSoft },
});
