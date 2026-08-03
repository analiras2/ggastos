import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { EntryKind, GgastosColors, GgastosType, KindColors, StatusChipStatus } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

type PlannedEntryRowProps = {
  title: string;
  category: string;
  amount: string;
  kind?: EntryKind;
  competence: string;
  status?: StatusChipStatus;
  isConfirmable?: boolean;
  isUndoable?: boolean;
  isTogglingStatus?: boolean;
  onToggleStatus?: () => void;
  isCancellable?: boolean;
  isCancelling?: boolean;
  onCancel?: () => void;
};

export function PlannedEntryRow({
  title,
  category,
  amount,
  kind = 'despesa',
  competence,
  status = 'PLANEJADO',
  isConfirmable = false,
  isUndoable = false,
  isTogglingStatus = false,
  onToggleStatus,
  isCancellable = false,
  isCancelling = false,
  onCancel,
}: PlannedEntryRowProps) {
  const showToggle = isConfirmable || isUndoable;
  const showCancel = isCancellable && !!onCancel;

  return (
    <View style={styles.row}>
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
      {showToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isUndoable ? 'Desfazer pagamento' : 'Marcar como pago'}
          disabled={isTogglingStatus}
          onPress={onToggleStatus}
          style={styles.toggle}
        >
          {isTogglingStatus ? (
            <ActivityIndicator size="small" color={GgastosColors.brandPrimary} />
          ) : (
            <Icon name={isUndoable ? 'check-circle-2' : 'circle'} size={22} />
          )}
        </Pressable>
      ) : null}
      {showCancel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancelar planejamento"
          disabled={isCancelling}
          onPress={onCancel}
          style={styles.toggle}
        >
          {isCancelling ? (
            <ActivityIndicator size="small" color={GgastosColors.expense} />
          ) : (
            <Icon name="trash-2" size={20} />
          )}
        </Pressable>
      ) : null}
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
  toggle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
