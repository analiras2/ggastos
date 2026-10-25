import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosSpacing } from '@/constants/ggastos-theme';
import { PendingListHeader } from '@/features/reconciliation/pending-list-header';
import { ReconciliationSection } from '@/features/reconciliation/reconciliation-section';
import { usePendingViewModel } from '@/features/reconciliation/use-pending-view-model';
import { BulkCategorizeSheet } from '@/features/statements/bulk-categorize-sheet';
import { CategoriesToolbar } from '@/features/statements/categories-toolbar';
import {
  SelectableTransactionRow,
  TRANSACTION_ROW_GAP,
  getTransactionRowLayout,
} from '@/features/statements/selectable-transaction-row';
import { SelectionActionBar } from '@/features/statements/selection-action-bar';
import { UncategorizedTransactionReviewSheet } from '@/features/statements/uncategorized-transaction-review-sheet';
import type { UncategorizedTransaction } from '@/features/statements/use-uncategorized-transactions';

const LIST_BOTTOM_PADDING = 100;

const keyExtractor = (transaction: UncategorizedTransaction) => transaction.id;

function RowSeparator() {
  return <View style={styles.separator} />;
}

export function PendingScreen() {
  const viewModel = usePendingViewModel();
  const { selection, bulkCategorize } = viewModel;
  const transactions = viewModel.uncategorizedTransactions;
  const hasTransactions = transactions.length > 0;
  const isEmpty = viewModel.reconciliationSuggestions.length === 0 && !hasTransactions;
  const { selectedIds, isSelectionMode, toggle } = selection;
  const { handleOpenCategoryReview } = viewModel;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<UncategorizedTransaction>) => (
      <SelectableTransactionRow
        transaction={item}
        isSelectionMode={isSelectionMode}
        isSelected={selectedIds.has(item.id)}
        onToggle={toggle}
        onCategorize={handleOpenCategoryReview}
      />
    ),
    [handleOpenCategoryReview, isSelectionMode, selectedIds, toggle]
  );

  const header = useMemo(
    () => (
      <PendingListHeader
        isLoading={viewModel.isLoading}
        isError={viewModel.isError}
        isEmpty={isEmpty}
        reconciliationErrorMessage={viewModel.reconciliationErrorMessage}
        lastBulkResult={viewModel.lastBulkResult}
        onDismissBulkResult={viewModel.dismissBulkResult}
      />
    ),
    [isEmpty, viewModel.dismissBulkResult, viewModel.isError, viewModel.isLoading, viewModel.lastBulkResult, viewModel.reconciliationErrorMessage]
  );

  const footer = useMemo(
    () => (
      <ReconciliationSection
        suggestions={viewModel.reconciliationSuggestions}
        pendingTransactionId={viewModel.pendingReconciliationTransactionId}
        onConfirm={viewModel.handleConfirmReconciliation}
        onReject={viewModel.handleRejectReconciliation}
      />
    ),
    [viewModel.handleConfirmReconciliation, viewModel.handleRejectReconciliation, viewModel.pendingReconciliationTransactionId, viewModel.reconciliationSuggestions]
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {hasTransactions ? (
        <CategoriesToolbar
          totalCount={transactions.length}
          isSelectionMode={isSelectionMode}
          isAllSelected={selection.isAllSelected}
          onEnterSelection={selection.enterSelectionMode}
          onExitSelection={selection.exitSelectionMode}
          onSelectAll={selection.selectAll}
          onClear={selection.clear}
        />
      ) : null}

      <FlatList
        data={transactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getTransactionRowLayout}
        extraData={selectedIds}
        ItemSeparatorComponent={RowSeparator}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={styles.content}
      />

      {isSelectionMode && hasTransactions ? (
        <SelectionActionBar
          selectedCount={selection.selectedCount}
          selectedTotalCents={selection.selectedTotalCents}
          onCategorize={viewModel.openBulkSheet}
        />
      ) : null}

      <BulkCategorizeSheet
        visible={viewModel.isBulkSheetVisible}
        selectedCount={viewModel.bulkTransactionCount}
        selectedTotalCents={viewModel.bulkTotalCents}
        viewModel={bulkCategorize}
        onClose={viewModel.closeBulkSheet}
      />

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
  content: {
    padding: GgastosSpacing.space5,
    paddingBottom: LIST_BOTTOM_PADDING,
  },
  separator: { height: TRANSACTION_ROW_GAP },
});
