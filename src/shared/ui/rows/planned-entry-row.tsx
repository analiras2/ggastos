import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  EntryKind,
  GgastosColors,
  GgastosType,
  KindColors,
  StatusChipStatus,
} from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import { TagChips } from '@/shared/ui/core/tag-chips';

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
  tags?: string[];
  onPress?: () => void;
  // Extra content under the row, e.g. its expanded details.
  children?: ReactNode;
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
  tags = [],
  onPress,
  children,
}: PlannedEntryRowProps) {
  const showToggle = isConfirmable || isUndoable;

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={styles.main}>
          <View style={[styles.dot, { backgroundColor: KindColors[kind] }]} />
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.meta}>
              {category} · {competence}
            </Text>
            <TagChips tags={tags} />
          </View>
          <View style={styles.trailing}>
            <Text style={[styles.amount, { color: KindColors[kind] }]}>{amount}</Text>
            <Text style={styles.status}>{status}</Text>
          </View>
        </Pressable>
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
      </View>
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
    paddingHorizontal: 4,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
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
