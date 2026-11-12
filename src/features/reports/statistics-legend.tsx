import { StyleSheet, Text, View } from 'react-native';

import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import type { DonutSlice } from '@/features/reports/donut-slices';

const DOT_SIZE = 10;
const COLUMN_BASIS = '44%';

type StatisticsLegendProps = { slices: DonutSlice[] };

// Two columns of color dot, name and amount, like the reference chart.
export function StatisticsLegend({ slices }: StatisticsLegendProps) {
  return (
    <View style={styles.grid}>
      {slices.map((slice) => (
        <View key={slice.id} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: slice.color }]} />
          <Text style={styles.name} numberOfLines={1}>{slice.name}</Text>
          <Text style={styles.value}>{formatCurrencyCents(slice.cents)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: GgastosSpacing.space3, columnGap: GgastosSpacing.space5 },
  item: { flexBasis: COLUMN_BASIS, flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: GgastosSpacing.space2 },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },
  name: { ...GgastosType.bodySm, color: GgastosColors.inkSoft, flex: 1 },
  value: { ...GgastosType.bodySm, fontWeight: '700', color: GgastosColors.inkStrong },
});
