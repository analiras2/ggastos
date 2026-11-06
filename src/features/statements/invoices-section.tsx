import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { InvoiceRow } from '@/features/statements/invoice-row';
import { useInvoicesViewModel } from '@/features/statements/use-invoices-view-model';

export function InvoicesSection() {
  const viewModel = useInvoicesViewModel();

  if (viewModel.invoices.length === 0) {
    return null;
  }

  const subtitle =
    viewModel.openCount > 0
      ? `${viewModel.openCount} em aberto. Marque como paga quando pagar.`
      : 'Todas as faturas estão pagas.';

  return (
    <View style={styles.section}>
      <View style={styles.titleGroup}>
        <Text style={styles.title}>Faturas</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {viewModel.errorMessage ? <Text style={styles.error}>{viewModel.errorMessage}</Text> : null}
      {viewModel.invoices.map((invoice) => (
        <InvoiceRow
          key={invoice.id}
          invoice={invoice}
          isUpdating={viewModel.updatingInvoiceId === invoice.id}
          onTogglePayment={viewModel.handleTogglePayment}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: GgastosSpacing.space3 },
  titleGroup: { gap: 2 },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
