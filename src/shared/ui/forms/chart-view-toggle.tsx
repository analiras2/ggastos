import { Pressable, StyleSheet, View } from 'react-native';

import type { ChartView } from '@/shared/lib/chart-preference';
import { GgastosColors, GgastosRadius } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';

const OPTIONS: { key: ChartView; icon: string; label: string }[] = [
  { key: 'bars', icon: 'bar-chart', label: 'Ver em barras' },
  { key: 'donut', icon: 'chart-pie', label: 'Ver em rosca' },
];

const TOUCH_SIZE = 44;
const INSET = 4;

type ChartViewToggleProps = { value: ChartView; onChange: (value: ChartView) => void };

// Two icons (bars, donut) in a pill; the chosen one is highlighted.
export function ChartViewToggle({ value, onChange }: ChartViewToggleProps) {
  return (
    <View style={styles.toggle}>
      {OPTIONS.map((option) => {
        const isActive = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.key)}
            style={[styles.button, isActive && styles.buttonActive]}
          >
            <Icon name={option.icon} size={20} color={isActive ? GgastosColors.brandPrimary : GgastosColors.inkFaint} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    padding: INSET,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.lineSofter,
  },
  button: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE - INSET * 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: GgastosRadius.pill,
  },
  buttonActive: { backgroundColor: GgastosColors.bgSurfaceRaised },
});
