import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ggastos/core/icon';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import type { ImportSummaryRow } from '@/features/statements/statement-import-summary';

type StatementImportResultProps = {
  errorMessage: string | null;
  successMessage: string | null;
  paymentStatusMessage: string | null;
  summary: ImportSummaryRow[];
};

// Feedback after an import attempt: the error, or the success message with its row counts.
export function StatementImportResult({
  errorMessage,
  successMessage,
  paymentStatusMessage,
  summary,
}: StatementImportResultProps) {
  return (
    <>
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Icon name="circle-alert" size={18} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={styles.successBanner}>
          <Icon name="check" size={18} />
          <Text style={styles.successText}>
            {successMessage} {paymentStatusMessage}
          </Text>
        </View>
      ) : null}

      {summary.length > 0 ? (
        <View style={styles.summaryGrid}>
          {summary.map((item) => (
            <View key={item.label} style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
