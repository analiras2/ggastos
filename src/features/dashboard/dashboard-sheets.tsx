import { CategoryDetailsSheet } from '@/features/dashboard/category-details-sheet';
import type { DashboardViewModel } from '@/features/dashboard/dashboard-view-model-types';
import { AddPlanSheet } from '@/features/planned-entries';
import { MonthSearchSheet } from '@/features/search';
import { StatementImportSheet } from '@/features/statements';
import { UncategorizedTransactionReviewSheet } from '@/features/statements';
import { WalletBalanceSheet } from '@/features/wallet';

type DashboardSheetsProps = { viewModel: DashboardViewModel };

// Every full-screen sheet the month tab can open, driven by the dashboard view-model.
export function DashboardSheets({ viewModel: vm }: DashboardSheetsProps) {
  const { categoryDetails } = vm;

  return (
    <>
      <MonthSearchSheet
        visible={vm.isSearchVisible}
        monthKey={vm.monthKey}
        onSelectCategory={vm.handleSelectSearchCategory}
        onClose={vm.handleCloseSearch}
      />

      <CategoryDetailsSheet
        visible={categoryDetails.visible}
        isLoading={categoryDetails.isLoading}
        isError={categoryDetails.isError}
        details={categoryDetails.details}
        togglingEntryId={categoryDetails.togglingEntryId}
        onToggleEntryStatus={categoryDetails.onToggleEntryStatus}
        onClose={vm.handleCloseCategoryDetails}
      />

      <AddPlanSheet visible={vm.isAddPlanVisible} onClose={vm.handleCloseAddPlan} />

      <WalletBalanceSheet
        visible={vm.walletSheetMode !== null}
        mode={vm.walletSheetMode ?? 'adjust'}
        currentCents={vm.wallet.balanceCents}
        monthName={vm.data.month.split(' ')[0]}
        onClose={vm.handleCloseWalletSheet}
        onDone={vm.handleWalletSheetDone}
      />

      <StatementImportSheet
        visible={vm.isStatementImportVisible}
        onClose={vm.handleCloseStatementImport}
        onReviewUncategorized={vm.handleOpenCategoryReview}
      />

      <UncategorizedTransactionReviewSheet
        batchId={vm.categoryReviewBatchId}
        visible={vm.categoryReviewBatchId !== null}
        onClose={vm.handleCloseCategoryReview}
      />
    </>
  );
}
