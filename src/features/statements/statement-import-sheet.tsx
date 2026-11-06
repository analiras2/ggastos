import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ggastos/core/button';
import { Icon } from '@/components/ggastos/core/icon';
import { SegmentedControl } from '@/components/ggastos/forms/segmented-control';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { PaymentStatusField } from '@/features/statements/payment-status-field';
import { StatementFileField } from '@/features/statements/statement-file-field';
import { StatementImportResult } from '@/features/statements/statement-import-result';
import { useStatementImportViewModel } from '@/features/statements/use-statement-import-view-model';

type StatementImportSheetProps = {
  visible: boolean;
  onClose: () => void;
  onReviewUncategorized: (batchId: string) => void;
};

const BANK_OPTIONS = [
  { label: 'Nubank', value: 'NUBANK' },
  { label: 'Bradesco', value: 'BRADESCO' },
];

export function StatementImportSheet({ visible, onClose, onReviewUncategorized }: StatementImportSheetProps) {
  const viewModel = useStatementImportViewModel();

  function handleClose() {
    viewModel.reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>Importar fatura</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={12}
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Icon name="x" size={18} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Banco</Text>
              <SegmentedControl
                options={BANK_OPTIONS}
                value={viewModel.selectedBank}
                onChange={viewModel.setSelectedBank}
              />
            </View>

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
              {viewModel.isSubmitting ? 'Importando...' : 'Importar CSV'}
            </Button>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  title: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  closeButton: {
    padding: 6,
  },
  content: {
    padding: GgastosSpacing.space5,
    gap: GgastosSpacing.space5,
  },
  field: {
    gap: GgastosSpacing.space2,
  },
  label: {
    ...GgastosType.label,
    color: GgastosColors.inkSoft,
  },
});
