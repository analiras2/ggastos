import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ggastos/core/button';
import { Icon } from '@/components/ggastos/core/icon';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import type { UncategorizedTransaction } from '@/features/statements/use-uncategorized-transactions';

// Fixed geometry lets the pending list use getItemLayout.
export const TRANSACTION_ROW_HEIGHT = 76;
export const TRANSACTION_ROW_GAP = GgastosSpacing.space3;
const SELECTION_ICON_SIZE = 22;

export function getTransactionRowLayout(_data: unknown, index: number) {
  const length = TRANSACTION_ROW_HEIGHT + TRANSACTION_ROW_GAP;
  return { length, offset: length * index, index };
}

type SelectableTransactionRowProps = {
  transaction: UncategorizedTransaction;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggle: (transactionId: string) => void;
  onCategorize: (transactionId: string) => void;
};

function SelectableTransactionRowComponent({
  transaction,
  isSelectionMode,
  isSelected,
  onToggle,
  onCategorize,
}: SelectableTransactionRowProps) {
  const handleToggle = useCallback(() => onToggle(transaction.id), [onToggle, transaction.id]);
  const handleCategorize = useCallback(() => onCategorize(transaction.id), [onCategorize, transaction.id]);
  const amount = formatCurrencyCents(transaction.amountCents);

  return (
    <Pressable
      accessibilityRole={isSelectionMode ? 'checkbox' : undefined}
      accessibilityState={isSelectionMode ? { checked: isSelected } : undefined}
      accessibilityLabel={isSelectionMode ? `${transaction.description}, ${amount}` : undefined}
      disabled={!isSelectionMode}
      onPress={handleToggle}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      {isSelectionMode ? (
        <Icon
          name={isSelected ? 'check-circle-2' : 'circle'}
          size={SELECTION_ICON_SIZE}
          color={isSelected ? GgastosColors.brandPrimary : GgastosColors.inkFaint}
        />
      ) : null}
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>{transaction.description}</Text>
        <Text numberOfLines={1} style={styles.meta}>
          {new Date(transaction.postedAt).toLocaleDateString('pt-BR')} ·{' '}
          {transaction.direction === 'CREDIT' ? `Crédito ${amount}` : amount}
        </Text>
      </View>
      {isSelectionMode ? null : (
        <Button size="sm" onPress={handleCategorize}>Categorizar</Button>
      )}
    </Pressable>
  );
}

export const SelectableTransactionRow = memo(SelectableTransactionRowComponent);

const styles = StyleSheet.create({
  card: {
    height: TRANSACTION_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    backgroundColor: GgastosColors.bgSurface,
  },
  cardSelected: {
    borderColor: GgastosColors.brandPrimary,
    backgroundColor: GgastosColors.brandPrimarySofter,
  },
  content: { flex: 1, gap: 3 },
  title: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  meta: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
