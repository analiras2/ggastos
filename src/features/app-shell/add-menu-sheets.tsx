import { AddPlanSheet } from '@/features/planned-entries';
import { StatementImportSheet, UncategorizedTransactionReviewSheet } from '@/features/statements';
import type { useAddMenuViewModel } from '@/features/app-shell/use-add-menu-view-model';

type AddMenuSheetsProps = { viewModel: ReturnType<typeof useAddMenuViewModel> };

// Sheets opened from the global "+" menu.
export function AddMenuSheets({ viewModel }: AddMenuSheetsProps) {
  return (
    <>
      <AddPlanSheet visible={viewModel.isAddPlanVisible} onClose={viewModel.closeAddPlan} />
      <StatementImportSheet
        visible={viewModel.isImportVisible}
        onClose={viewModel.closeImport}
        onReviewUncategorized={viewModel.openReview}
      />
      <UncategorizedTransactionReviewSheet
        batchId={viewModel.reviewBatchId}
        visible={viewModel.reviewBatchId !== null}
        onClose={viewModel.closeReview}
      />
    </>
  );
}
