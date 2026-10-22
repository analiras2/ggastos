import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyStateCard } from '@/components/ggastos/cards/empty-state-card';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { ReconciliationSuggestionRow } from '@/features/reconciliation/reconciliation-suggestion-row';
import { usePendingViewModel } from '@/features/reconciliation/use-pending-view-model';
import { UncategorizedTransactionReviewSheet } from '@/features/statements/uncategorized-transaction-review-sheet';
import { UncategorizedTransactionRow } from '@/features/statements/uncategorized-transaction-row';

export function PendingScreen() {
  const viewModel = usePendingViewModel();
  const isEmpty = viewModel.reconciliationSuggestions.length === 0 && viewModel.uncategorizedTransactions.length === 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Pendências</Text>
          <Text style={styles.subtitle}>Conclua conciliações e classifique os gastos importados.</Text>
        </View>

        {viewModel.isLoading ? <Text style={styles.status}>Carregando pendências...</Text> : null}
        {viewModel.isError ? <Text style={styles.status}>Não foi possível carregar as pendências.</Text> : null}
        {viewModel.reconciliationErrorMessage ? <Text style={styles.error}>{viewModel.reconciliationErrorMessage}</Text> : null}

        {!viewModel.isLoading && !viewModel.isError && isEmpty ? (
          <EmptyStateCard icon="check-check" title="Tudo em dia" description="Não há categorias ou conciliações pendentes." />
        ) : null}

        {viewModel.uncategorizedTransactions.length > 0 ? (
          <View style={styles.section}>
            <View>
              <Text style={styles.sectionTitle}>Categorias</Text>
              <Text style={styles.sectionSubtitle}>Gastos importados que ainda precisam de classificação.</Text>
            </View>
            {viewModel.uncategorizedTransactions.map((transaction) => (
              <UncategorizedTransactionRow
                key={transaction.id}
                transaction={transaction}
                onCategorize={viewModel.handleOpenCategoryReview}
              />
            ))}
          </View>
        ) : null}

        {viewModel.reconciliationSuggestions.length > 0 ? (
          <View style={styles.section}>
            <View>
              <Text style={styles.sectionTitle}>Conciliações</Text>
              <Text style={styles.sectionSubtitle}>Confirme ou rejeite as correspondências sugeridas.</Text>
            </View>
            {viewModel.reconciliationSuggestions.map((suggestion) => (
              <ReconciliationSuggestionRow
                key={suggestion.transactionId}
                suggestion={suggestion}
                isPending={viewModel.pendingReconciliationTransactionId === suggestion.transactionId}
                onConfirm={viewModel.handleConfirmReconciliation}
                onReject={viewModel.handleRejectReconciliation}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <UncategorizedTransactionReviewSheet
        transactionId={viewModel.selectedTransactionId}
        visible={viewModel.isCategoryReviewVisible}
        onClose={viewModel.handleCloseCategoryReview}
        onSaved={viewModel.handleCloseCategoryReview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  content: { padding: GgastosSpacing.space5, paddingBottom: 100, gap: GgastosSpacing.space5 },
  header: { gap: 4 },
  title: { ...GgastosType.displayLg, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft },
  section: { gap: GgastosSpacing.space3 },
  sectionTitle: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  sectionSubtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  status: { ...GgastosType.bodyMd, color: GgastosColors.inkFaint, textAlign: 'center' },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
