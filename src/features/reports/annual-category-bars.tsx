import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import type { AnnualCategoryView } from '@/features/reports/format-annual-summary';
import { useAnnualBars } from '@/features/reports/use-annual-bars';

type AnnualCategoryBarsProps = { categories: AnnualCategoryView[]; totalLabel?: string };

const SORT_ICON_SIZE = 20;
const BAR_HEIGHT = 10;

export function AnnualCategoryBars({ categories, totalLabel = 'Gastos' }: AnnualCategoryBarsProps) {
  const viewModel = useAnnualBars(categories);
  const SortIcon = viewModel.isDescending ? ArrowDownWideNarrow : ArrowUpNarrowWide;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.total}>{totalLabel} {formatCurrencyCents(viewModel.totalCents)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={viewModel.sortLabel}
          hitSlop={GgastosSpacing.space2}
          onPress={viewModel.toggleOrder}
          style={styles.sortButton}
        >
          <SortIcon size={SORT_ICON_SIZE} color={GgastosColors.inkSoft} />
        </Pressable>
      </View>
      {viewModel.bars.map((bar) => (
        <View key={bar.categoryId} style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.name} numberOfLines={1}>{bar.name}</Text>
            <Text style={styles.value}>{formatCurrencyCents(bar.actualCents)} · {bar.sharePercent}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${bar.barPercent}%`, backgroundColor: bar.color }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: GgastosSpacing.space3 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  total: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  sortButton: { padding: GgastosSpacing.space1 },
  row: { gap: GgastosSpacing.space1 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: GgastosSpacing.space2 },
  name: { ...GgastosType.bodySm, color: GgastosColors.inkStrong, flex: 1 },
  value: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  track: { height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, backgroundColor: GgastosColors.lineSofter, overflow: 'hidden' },
  bar: { height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2 },
});
