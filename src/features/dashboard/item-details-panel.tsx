import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import type { DetailLine } from '@/features/dashboard/format-item-details';

type ItemDetailsPanelProps = { lines: DetailLine[]; onEdit: () => void };

// Label and value pairs shown under a row once it is tapped.
export function ItemDetailsPanel({ lines, onEdit }: ItemDetailsPanelProps) {
  return (
    <View style={styles.panel}>
      {lines.map((line) => (
        <View key={line.label} style={styles.line}>
          <Text style={styles.label}>{line.label}</Text>
          <Text style={styles.value}>{line.value}</Text>
        </View>
      ))}
      <Pressable accessibilityRole="button" onPress={onEdit} style={styles.edit}>
        <Text style={styles.editLabel}>Editar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: GgastosSpacing.space2, paddingHorizontal: GgastosSpacing.space4, paddingBottom: GgastosSpacing.space3 },
  edit: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  editLabel: { ...GgastosType.label, color: GgastosColors.brandPrimary },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: GgastosSpacing.space4 },
  label: { ...GgastosType.bodySm, color: GgastosColors.inkFaint },
  value: { ...GgastosType.bodySm, flex: 1, textAlign: 'right', color: GgastosColors.inkStrong },
});
