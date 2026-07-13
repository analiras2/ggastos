import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

export type QuickAction = {
  label: string;
  icon: string;
  onPress?: () => void;
};

type QuickActionRowProps = {
  actions: QuickAction[];
};

export function QuickActionRow({ actions }: QuickActionRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {actions.map((action) => (
        <Pressable key={action.label} accessibilityRole="button" onPress={action.onPress} style={styles.chip}>
          <Icon name={action.icon} size={16} />
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: GgastosRadius.pill,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    backgroundColor: GgastosColors.bgSurface,
  },
  label: {
    ...GgastosType.bodySm,
    fontWeight: '600',
    color: GgastosColors.inkStrong,
  },
});
