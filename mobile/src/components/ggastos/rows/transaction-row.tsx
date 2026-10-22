import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EntryKind, GgastosColors, GgastosType, KindColors } from '@/constants/ggastos-theme';

type TransactionRowProps = {
  title: string;
  category: string;
  amount: string;
  kind?: EntryKind;
  date: string;
  statusChip?: ReactNode;
  onPress?: () => void;
};

export function TransactionRow({
  title,
  category,
  amount,
  kind = 'despesa',
  date,
  statusChip,
  onPress,
}: TransactionRowProps) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={styles.row}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta}>
          {category} · {date}
        </Text>
      </View>
      {statusChip}
      <Text style={[styles.amount, { color: KindColors[kind] }]}>{amount}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
    color: GgastosColors.inkStrong,
  },
  meta: {
    ...GgastosType.micro,
    color: GgastosColors.inkFaint,
  },
  amount: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
  },
});
