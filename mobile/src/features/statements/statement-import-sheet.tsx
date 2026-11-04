import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ggastos/core/button';
import { Icon } from '@/components/ggastos/core/icon';
import { SegmentedControl } from '@/components/ggastos/forms/segmented-control';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { PaymentStatusField } from '@/features/statements/payment-status-field';
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

            <View style={styles.field}>
              <Text style={styles.label}>CSV</Text>
              <View style={styles.fileButton}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={viewModel.selectedFileName ? 'Trocar arquivo CSV' : 'Selecionar arquivo CSV'}
                  disabled={viewModel.isPickingFile || viewModel.isSubmitting}
                  onPress={viewModel.handlePickFile}
                  style={styles.filePickerTrigger}
                >
                  <Icon name="file-up" size={20} />
                  <View style={styles.fileTextGroup}>
                    <Text style={styles.fileTitle}>
                      {viewModel.selectedFileName ?? 'Selecionar arquivo'}
                    </Text>
                    <Text style={styles.fileCaption}>
                      {viewModel.selectedFileName ? 'Toque para trocar o arquivo' : 'Nubank ou Bradesco em .csv'}
                    </Text>
                  </View>
                </Pressable>

                {viewModel.selectedFileName ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remover arquivo selecionado"
                    disabled={viewModel.isPickingFile || viewModel.isSubmitting}
                    hitSlop={12}
                    onPress={viewModel.clearSelectedFile}
                    style={styles.removeFileButton}
                  >
                    <Icon name="x" size={18} />
                  </Pressable>
                ) : null}
              </View>
            </View>

            {viewModel.errorMessage ? (
              <View style={styles.errorBanner}>
                <Icon name="circle-alert" size={18} />
                <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
              </View>
            ) : null}

            {viewModel.successMessage ? (
              <View style={styles.successBanner}>
                <Icon name="check" size={18} />
                <Text style={styles.successText}>
                  {viewModel.successMessage} {viewModel.paymentStatusMessage}
                </Text>
              </View>
            ) : null}

            {viewModel.importSummary.length > 0 ? (
              <View style={styles.summaryGrid}>
                {viewModel.importSummary.map((item) => (
                  <View key={item.label} style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{item.value}</Text>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            ) : null}

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
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space4,
    backgroundColor: GgastosColors.bgSurface,
  },
  filePickerTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
  },
  removeFileButton: {
    padding: GgastosSpacing.space2,
  },
  fileTextGroup: {
    flex: 1,
    gap: 2,
  },
  fileTitle: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
  fileCaption: {
    ...GgastosType.micro,
    color: GgastosColors.inkFaint,
  },
  errorBanner: {
    flexDirection: 'row',
    gap: GgastosSpacing.space2,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space3,
    backgroundColor: GgastosColors.warningSoft,
  },
  errorText: {
    ...GgastosType.bodySm,
    flex: 1,
    color: GgastosColors.warning,
  },
  successBanner: {
    flexDirection: 'row',
    gap: GgastosSpacing.space2,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space3,
    backgroundColor: GgastosColors.brandPrimarySofter,
  },
  successText: {
    ...GgastosType.bodySm,
    flex: 1,
    color: GgastosColors.brandPrimaryDark,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GgastosSpacing.space3,
  },
  summaryItem: {
    minWidth: 96,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space3,
    backgroundColor: GgastosColors.bgSurface,
  },
  summaryValue: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  summaryLabel: {
    ...GgastosType.micro,
    color: GgastosColors.inkSoft,
  },
});
