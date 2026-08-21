import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ggastos/core/button';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import type { UncategorizedTransaction } from '@/features/statements/use-uncategorized-transactions';

type UncategorizedTransactionRowProps = {
  transaction: UncategorizedTransaction;
  onCategorize: (transactionId: string) => void;
};

export function UncategorizedTransactionRow({ transaction, onCategorize }: UncategorizedTransactionRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>{transaction.description}</Text>
        <Text style={styles.meta}>
          {new Date(transaction.postedAt).toLocaleDateString('pt-BR')} · {formatCurrencyCents(transaction.amountCents)}
        </Text>
      </View>
      <Button size="sm" onPress={() => onCategorize(transaction.id)}>Categorizar</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space4,
    backgroundColor: GgastosColors.bgSurface,
  },
  content: { flex: 1, gap: 3 },
  title: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  meta: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
