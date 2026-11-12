import { Pressable, StyleSheet, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import { ImpactTypeDropdown } from '@/features/reports/impact-type-dropdown';
import type { ChartView, StatisticsImpactType } from '@/features/reports/use-statistics-view-model';

const CHART_OPTIONS: { key: ChartView; icon: string; label: string }[] = [
  { key: 'bars', icon: 'bar-chart', label: 'Ver em barras' },
  { key: 'donut', icon: 'chart-pie', label: 'Ver em rosca' },
];

const TOUCH_SIZE = 44;
const INSET = 4;

type StatisticsFiltersProps = {
  impactType: StatisticsImpactType;
  chartView: ChartView;
  onChangeImpactType: (value: StatisticsImpactType) => void;
  onChangeChartView: (value: ChartView) => void;
};

// One row: the entry type as a dropdown on the left, the chart style as two icons on the right.
export function StatisticsFilters({ impactType, chartView, onChangeImpactType, onChangeChartView }: StatisticsFiltersProps) {
  return (
    <View style={styles.row}>
      <ImpactTypeDropdown value={impactType} onChange={onChangeImpactType} />
      <View style={styles.toggle}>
        {CHART_OPTIONS.map((option) => {
          const isActive = option.key === chartView;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isActive }}
              onPress={() => onChangeChartView(option.key)}
              style={[styles.toggleButton, isActive && styles.toggleButtonActive]}
            >
              <Icon name={option.icon} size={20} color={isActive ? GgastosColors.brandPrimary : GgastosColors.inkFaint} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: GgastosSpacing.space3 },
  toggle: {
    flexDirection: 'row',
    padding: INSET,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.lineSofter,
  },
  toggleButton: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE - INSET * 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: GgastosRadius.pill,
  },
  toggleButtonActive: { backgroundColor: GgastosColors.bgSurfaceRaised },
});
