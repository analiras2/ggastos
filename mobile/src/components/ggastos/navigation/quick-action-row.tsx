import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
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
    marginVertical: 16,
    paddingHorizontal: GgastosSpacing.space5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.bgSurface,
  },
  label: {
    ...GgastosType.bodySm,
    fontWeight: '600',
    color: GgastosColors.inkStrong,
  },
});
