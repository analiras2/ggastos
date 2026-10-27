import { StyleSheet, Text, View } from 'react-native';

import { EmptyStateCard } from '@/components/ggastos/cards/empty-state-card';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import type { BulkCategorizeResult } from '@/features/statements/bulk-categorization';
import { BulkResultBanner } from '@/features/statements/bulk-result-banner';
import { InvoicesSection } from '@/features/statements/invoices-section';

type PendingListHeaderProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  reconciliationErrorMessage: string | null;
  lastBulkResult: BulkCategorizeResult | null;
  onDismissBulkResult: () => void;
};

export function PendingListHeader({
  isLoading,
  isError,
  isEmpty,
  reconciliationErrorMessage,
  lastBulkResult,
  onDismissBulkResult,
}: PendingListHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        <Text style={styles.title}>Pendências</Text>
        <Text style={styles.subtitle}>Conclua conciliações e classifique os gastos importados.</Text>
      </View>

      {isLoading ? <Text style={styles.status}>Carregando pendências...</Text> : null}
      {isError ? <Text style={styles.status}>Não foi possível carregar as pendências.</Text> : null}
      {reconciliationErrorMessage ? <Text style={styles.error}>{reconciliationErrorMessage}</Text> : null}
      {lastBulkResult ? <BulkResultBanner result={lastBulkResult} onDismiss={onDismissBulkResult} /> : null}

      <InvoicesSection />

      {!isLoading && !isError && isEmpty ? (
        <EmptyStateCard icon="check-check" title="Tudo em dia" description="Não há categorias ou conciliações pendentes." />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: GgastosSpacing.space4, paddingBottom: GgastosSpacing.space4 },
  titleGroup: { gap: 4 },
  title: { ...GgastosType.displayLg, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft },
  status: { ...GgastosType.bodyMd, color: GgastosColors.inkFaint, textAlign: 'center' },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
