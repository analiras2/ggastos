import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TagChips } from '@/shared/ui/core/tag-chips';
import { EntryKind, GgastosColors, GgastosType, KindColors } from '@/shared/theme/ggastos-theme';

type TransactionRowProps = {
  title: string;
  category: string;
  amount: string;
  kind?: EntryKind;
  date: string;
  statusChip?: ReactNode;
  tags?: string[];
  onPress?: () => void;
  // Extra content under the row, e.g. its expanded details.
  children?: ReactNode;
};

export function TransactionRow({
  title,
  category,
  amount,
  kind = 'despesa',
  date,
  statusChip,
  tags = [],
  onPress,
  children,
}: TransactionRowProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.meta}>
            {category} · {date}
          </Text>
          <TagChips tags={tags} />
        </View>
        {statusChip}
        <Text style={[styles.amount, { color: KindColors[kind] }]}>{amount}</Text>
      </Pressable>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 4,
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
