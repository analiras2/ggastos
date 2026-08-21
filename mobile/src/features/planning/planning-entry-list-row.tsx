import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ggastos/core/icon';
import { EntryKind, GgastosColors, GgastosSpacing, GgastosType, KindColors } from '@/constants/ggastos-theme';

type PlanningEntryListRowProps = {
  title: string;
  category: string;
  amount: string;
  kind: EntryKind;
  dueDate: string;
  status: string;
  canConfirm: boolean;
  canCancel: boolean;
  isUpdating: boolean;
  onToggleStatus: () => void;
  onCancel: () => void;
};

export function PlanningEntryListRow({
  title,
  category,
  amount,
  kind,
  dueDate,
  status,
  canConfirm,
  canCancel,
  isUpdating,
  onToggleStatus,
  onCancel,
}: PlanningEntryListRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: KindColors[kind] }]} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.meta}>{category} · {dueDate}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
      <View style={styles.trailing}>
        <Text style={[styles.amount, { color: KindColors[kind] }]}>{amount}</Text>
        {isUpdating ? <ActivityIndicator size="small" color={GgastosColors.brandPrimary} /> : null}
        {!isUpdating && canConfirm ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Marcar como realizado" onPress={onToggleStatus} style={styles.action}>
            <Icon name="circle" size={20} />
          </Pressable>
        ) : null}
        {!isUpdating && canCancel ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Cancelar planejamento" onPress={onCancel} style={styles.cancelAction}>
            <Text style={styles.cancelLabel}>Cancelar</Text>
          </Pressable>
        ) : null}
        {!isUpdating && !canConfirm && status === 'REALIZADO' ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Desfazer realização" onPress={onToggleStatus} style={styles.action}>
            <Icon name="check-circle-2" size={20} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: GgastosSpacing.space3, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: GgastosColors.lineSofter },
  dot: { width: 7, height: 7, borderRadius: 4 },
  content: { flex: 1, gap: 2 },
  title: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  meta: { ...GgastosType.micro, color: GgastosColors.inkFaint },
  status: { ...GgastosType.labelCaps, color: GgastosColors.inkSoft },
  trailing: { alignItems: 'flex-end', gap: 4 },
  amount: { ...GgastosType.bodyMd, fontWeight: '700' },
  action: { padding: GgastosSpacing.space1 },
  cancelAction: { paddingVertical: GgastosSpacing.space1, paddingLeft: GgastosSpacing.space2 },
  cancelLabel: { ...GgastosType.micro, color: GgastosColors.expense },
});
