import { ScrollView, StyleSheet } from 'react-native';

import { Button } from '@/shared/ui/core/button';
import { Icon } from '@/shared/ui/core/icon';
import { SheetModal } from '@/shared/ui/core/sheet-modal';
import { GgastosSpacing } from '@/shared/theme/ggastos-theme';
import { PaymentStatusField } from '@/features/statements/payment-status-field';
import { StatementFileField } from '@/features/statements/statement-file-field';
import { StatementImportResult } from '@/features/statements/statement-import-result';
import { useStatementImportViewModel } from '@/features/statements/use-statement-import-view-model';

type StatementImportSheetProps = {
  visible: boolean;
  onClose: () => void;
  onReviewUncategorized: (batchId: string) => void;
};

export function StatementImportSheet({ visible, onClose, onReviewUncategorized }: StatementImportSheetProps) {
  const viewModel = useStatementImportViewModel();

  function handleClose() {
    viewModel.reset();
    onClose();
  }

  return (
    <SheetModal visible={visible} title="Importar fatura" onClose={handleClose}>
      <ScrollView contentContainerStyle={styles.content}>
        <PaymentStatusField value={viewModel.paymentChoice} onChange={viewModel.setPaymentChoice} />

        <StatementFileField
          fileName={viewModel.selectedFileName}
          isBusy={viewModel.isPickingFile || viewModel.isSubmitting}
          onPick={viewModel.handlePickFile}
          onClear={viewModel.clearSelectedFile}
        />

        <StatementImportResult
          errorMessage={viewModel.errorMessage}
          successMessage={viewModel.successMessage}
          paymentStatusMessage={viewModel.paymentStatusMessage}
          summary={viewModel.importSummary}
        />

        {viewModel.importBatchId ? (
          <Button
            fullWidth
            variant="secondary"
            icon={<Icon name="tags" size={18} />}
            onPress={() => onReviewUncategorized(viewModel.importBatchId as string)}
          >
            Revisar categorias
          </Button>
        ) : null}

        <Button
          fullWidth
          disabled={!viewModel.canSubmit}
          icon={<Icon name="upload" size={18} />}
          onPress={viewModel.handleSubmit}
        >
          {viewModel.isSubmitting ? 'Importando...' : 'Importar fatura'}
        </Button>
      </ScrollView>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: GgastosSpacing.space5,
    gap: GgastosSpacing.space5,
  },
});
