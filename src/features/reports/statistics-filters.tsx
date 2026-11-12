import { StyleSheet, View } from 'react-native';

import { GgastosSpacing } from '@/shared/theme/ggastos-theme';
import { ChartViewToggle } from '@/shared/ui/forms/chart-view-toggle';
import { ImpactTypeDropdown } from '@/features/reports/impact-type-dropdown';
import type { ChartView, StatisticsImpactType } from '@/features/reports/use-statistics-view-model';

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
      <ChartViewToggle value={chartView} onChange={onChangeChartView} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: GgastosSpacing.space3 },
});
