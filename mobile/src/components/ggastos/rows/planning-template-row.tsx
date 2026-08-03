import { StyleSheet, Text, View } from 'react-native';

import { EntryKind, GgastosColors, GgastosType, KindColors } from '@/constants/ggastos-theme';

type PlanningTemplateRowProps = {
  title: string;
  category: string;
  amount: string;
  kind?: EntryKind;
  recurrence: string;
};

export function PlanningTemplateRow({
  title,
  category,
  amount,
  kind = 'despesa',
  recurrence,
}: PlanningTemplateRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: KindColors[kind] }]} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta}>
          {category} · {recurrence}
        </Text>
      </View>
      <Text style={[styles.amount, { color: KindColors[kind] }]}>{amount}</Text>
    </View>
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
