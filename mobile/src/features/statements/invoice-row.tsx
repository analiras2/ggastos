import { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ggastos/core/button';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import { monthLabel } from '@/features/dashboard/month-utils';
import type { StatementInvoice } from '@/features/statements/use-statement-invoices';

type InvoiceRowProps = {
  invoice: StatementInvoice;
  isUpdating: boolean;
  onTogglePayment: (invoice: StatementInvoice) => void;
};

function InvoiceRowComponent({ invoice, isUpdating, onTogglePayment }: InvoiceRowProps) {
  const isOpen = invoice.paymentStatus === 'OPEN';
  const bankName = invoice.bank === 'BRADESCO' ? 'Bradesco' : 'Nubank';
  const month = invoice.invoiceMonth ? monthLabel(invoice.invoiceMonth) : invoice.fileName;
  const handlePress = useCallback(() => onTogglePayment(invoice), [invoice, onTogglePayment]);

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.title}>{bankName} · {month}</Text>
        <Text style={styles.amount}>{formatCurrencyCents(invoice.totalCents)}</Text>
        <View style={[styles.badge, isOpen ? styles.badgeOpen : styles.badgePaid]}>
          <Text style={[styles.badgeText, isOpen ? styles.badgeOpenText : styles.badgePaidText]}>
            {isOpen ? 'Em aberto' : 'Paga'}
          </Text>
        </View>
      </View>
      <Button size="sm" variant={isOpen ? 'primary' : 'secondary'} disabled={isUpdating} onPress={handlePress}>
        {isOpen ? 'Marcar como paga' : 'Reabrir'}
      </Button>
    </View>
  );
}

export const InvoiceRow = memo(InvoiceRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: GgastosSpacing.space3,
    padding: GgastosSpacing.space4,
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
    borderRadius: GgastosRadius.md,
    backgroundColor: GgastosColors.bgSurface,
  },
  info: { flex: 1, gap: 4 },
  title: { ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
  amount: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  badge: { alignSelf: 'flex-start', borderRadius: GgastosRadius.pill, paddingHorizontal: 10, paddingVertical: 2 },
  badgeOpen: { backgroundColor: GgastosColors.warningSoft },
  badgePaid: { backgroundColor: GgastosColors.incomeSoft },
  badgeText: { ...GgastosType.micro, fontWeight: '700' },
  badgeOpenText: { color: GgastosColors.warning },
  badgePaidText: { color: GgastosColors.income },
});
