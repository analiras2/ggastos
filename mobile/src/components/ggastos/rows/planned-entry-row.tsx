import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EntryKind, GgastosColors, GgastosType, KindColors, StatusChipStatus } from '@/constants/ggastos-theme';

type PlannedEntryRowProps = {
  title: string;
  category: string;
  amount: string;
  kind?: EntryKind;
  competence: string;
  status?: StatusChipStatus;
  onPress?: () => void;
};

export function PlannedEntryRow({
  title,
  category,
  amount,
  kind = 'despesa',
  competence,
  status = 'PLANEJADO',
  onPress,
}: PlannedEntryRowProps) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={styles.row}>
      <View style={[styles.dot, { backgroundColor: KindColors[kind] }]} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta}>
          {category} · {competence}
        </Text>
      </View>
      <View style={styles.trailing}>
        <Text style={[styles.amount, { color: KindColors[kind] }]}>{amount}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
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
  trailing: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
  },
  status: {
    ...GgastosType.labelCaps,
    color: GgastosColors.inkFaint,
  },
});
