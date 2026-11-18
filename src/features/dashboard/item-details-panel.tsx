import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { ConfirmDialog } from '@/shared/ui/core/confirm-dialog';
import type { DetailLine } from '@/features/dashboard/format-item-details';
import { REMOVAL_COPY, type ItemRemoval } from '@/shared/lib/item-removal';

type ItemDetailsPanelProps = {
  lines: DetailLine[];
  onEdit: () => void;
  // Set only for items that can be removed.
  removal?: ItemRemoval | null;
  isRemoving?: boolean;
  onRemove?: () => void;
};

// Label and value pairs shown under a row once it is tapped, with Editar and, when allowed, Excluir.
export function ItemDetailsPanel({ lines, onEdit, removal = null, isRemoving = false, onRemove }: ItemDetailsPanelProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <View style={styles.panel}>
      {lines.map((line) => (
        <View key={line.label} style={styles.line}>
          <Text style={styles.label}>{line.label}</Text>
          <Text style={styles.value}>{line.value}</Text>
        </View>
      ))}
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={onEdit} style={styles.action}>
          <Text style={styles.editLabel}>Editar</Text>
        </Pressable>
        {removal ? (
          <Pressable accessibilityRole="button" onPress={() => setIsConfirming(true)} style={styles.action}>
            <Text style={styles.removeLabel}>{removal === 'REMOVE_IMPORTED' ? 'Remover' : 'Excluir'}</Text>
          </Pressable>
        ) : null}
      </View>
      {removal ? (
        <ConfirmDialog
          visible={isConfirming}
          title={REMOVAL_COPY[removal].title}
          message={REMOVAL_COPY[removal].message}
          confirmLabel={REMOVAL_COPY[removal].confirmLabel}
          isDestructive
          isBusy={isRemoving}
          onConfirm={() => onRemove?.()}
          onCancel={() => setIsConfirming(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: GgastosSpacing.space2, paddingHorizontal: GgastosSpacing.space4, paddingBottom: GgastosSpacing.space3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: GgastosSpacing.space5 },
  action: { minHeight: 44, justifyContent: 'center' },
  editLabel: { ...GgastosType.label, color: GgastosColors.brandPrimary },
  removeLabel: { ...GgastosType.label, color: GgastosColors.expense },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: GgastosSpacing.space4 },
  label: { ...GgastosType.bodySm, color: GgastosColors.inkFaint },
  value: { ...GgastosType.bodySm, flex: 1, textAlign: 'right', color: GgastosColors.inkStrong },
});
