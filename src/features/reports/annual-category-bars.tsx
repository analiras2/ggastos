import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import type { AnnualCategoryView } from '@/features/reports/format-annual-summary';
import { sortAnnualCategories, type CategorySortOrder } from '@/features/reports/sort-annual-categories';

type AnnualCategoryBarsProps = { categories: AnnualCategoryView[]; totalLabel?: string };

const SORT_ICON_SIZE = 20;
const BAR_HEIGHT = 10;
const PERCENT_FACTOR = 100;
const MIN_BAR_PERCENT = 2;

export function AnnualCategoryBars({ categories, totalLabel = 'Gastos' }: AnnualCategoryBarsProps) {
  const [order, setOrder] = useState<CategorySortOrder>('desc');
  const items = useMemo(() => sortAnnualCategories(categories, order), [categories, order]);
  const total = items.reduce((sum, category) => sum + category.actualCents, 0);
  const largest = items.reduce((max, category) => Math.max(max, category.actualCents), 0);
  const SortIcon = order === 'desc' ? ArrowDownWideNarrow : ArrowUpNarrowWide;
  const sortLabel = order === 'desc' ? 'Ordenar do menor para o maior' : 'Ordenar do maior para o menor';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.total}>{totalLabel} {formatCurrencyCents(total)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={sortLabel}
          hitSlop={GgastosSpacing.space2}
          onPress={() => setOrder(order === 'desc' ? 'asc' : 'desc')}
          style={styles.sortButton}
        >
          <SortIcon size={SORT_ICON_SIZE} color={GgastosColors.inkSoft} />
        </Pressable>
      </View>
      {items.map((category) => {
        const barPercent = Math.max((category.actualCents / largest) * PERCENT_FACTOR, MIN_BAR_PERCENT);
        const share = Math.round((category.actualCents / total) * PERCENT_FACTOR);
        return (
          <View key={category.categoryId} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
              <Text style={styles.value}>{formatCurrencyCents(category.actualCents)} · {share}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${barPercent}%`, backgroundColor: category.color }]} />
            </View>
          </View>
        );
      })}
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
