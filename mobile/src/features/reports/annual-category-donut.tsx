import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import type { AnnualCategoryView } from '@/features/reports/format-annual-summary';

type AnnualCategoryDonutProps = { categories: AnnualCategoryView[] };
const CHART_SIZE = 168;
const STROKE_WIDTH = 24;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const COLORS = ['#1F6B57', '#C65A46', '#356FA8', '#C28A2C', '#7A5C9E', '#477A89', '#A26D47'];

export function AnnualCategoryDonut({ categories }: AnnualCategoryDonutProps) {
  const items = categories.filter((category) => category.actualCents > 0);
  const total = items.reduce((sum, category) => sum + category.actualCents, 0);

  return (
    <View style={styles.container}>
      <View style={styles.chartWrap}>
        <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
          <Circle cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={RADIUS} stroke={GgastosColors.lineSofter} strokeWidth={STROKE_WIDTH} fill="none" />
          {items.map((category, index) => {
            const share = category.actualCents / total;
            const length = share * CIRCUMFERENCE;
            const offset = items.slice(0, index).reduce((sum, item) => sum + (item.actualCents / total) * CIRCUMFERENCE, 0);
            return <Circle key={category.categoryId} cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={RADIUS} stroke={COLORS[index % COLORS.length]} strokeWidth={STROKE_WIDTH} strokeDasharray={`${length} ${CIRCUMFERENCE - length}`} strokeDashoffset={-offset} strokeLinecap="butt" fill="none" rotation="-90" origin={`${CHART_SIZE / 2}, ${CHART_SIZE / 2}`} />;
          })}
        </Svg>
        <View style={styles.center}><Text style={styles.centerLabel}>Gastos</Text><Text style={styles.centerValue}>{formatCurrencyCents(total)}</Text></View>
      </View>
      <View style={styles.legend}>{items.map((category, index) => <View key={category.categoryId} style={styles.legendRow}><View style={[styles.color, { backgroundColor: COLORS[index % COLORS.length] }]} /><Text style={styles.name} numberOfLines={1}>{category.name}</Text><Text style={styles.value}>{Math.round((category.actualCents / total) * 100)}% · {formatCurrencyCents(category.actualCents)}</Text></View>)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: GgastosSpacing.space5 }, chartWrap: { alignSelf: 'center', width: CHART_SIZE, height: CHART_SIZE, alignItems: 'center', justifyContent: 'center' }, center: { position: 'absolute', alignItems: 'center', gap: 2 }, centerLabel: { ...GgastosType.micro, color: GgastosColors.inkFaint }, centerValue: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong }, legend: { gap: GgastosSpacing.space2 }, legendRow: { flexDirection: 'row', alignItems: 'center', gap: GgastosSpacing.space2 }, color: { width: 10, height: 10, borderRadius: 5 }, name: { ...GgastosType.bodySm, color: GgastosColors.inkStrong, flex: 1 }, value: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
