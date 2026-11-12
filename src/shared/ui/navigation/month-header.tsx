import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MONTH_LABELS, parseMonthKey, shiftMonthKey } from '@/shared/lib/month';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import { MonthYearPicker } from '@/shared/ui/navigation/month-year-picker';

type MonthHeaderProps = {
  month: string;
  monthKey: string;
  isCurrentMonth?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPressMonth?: () => void;
  onSelectMonth: (monthKey: string) => void;
};

const NEIGHBOR_TOUCH_HEIGHT = 44;
const NEIGHBOR_OPACITY = 0.55;

function monthNameOf(monthKey: string): string {
  return MONTH_LABELS[parseMonthKey(monthKey).monthIndex] ?? monthKey;
}

// The month in the middle with the previous and next month names on its sides, so it is clear where to go.
export function MonthHeader({
  month,
  monthKey,
  isCurrentMonth = true,
  onPrev,
  onNext,
  onPressMonth,
  onSelectMonth,
}: MonthHeaderProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const lastSpaceIndex = month.lastIndexOf(' ');
  const monthName = lastSpaceIndex >= 0 ? month.slice(0, lastSpaceIndex) : month;
  const year = lastSpaceIndex >= 0 ? month.slice(lastSpaceIndex + 1) : '';

  return (
    <View style={styles.container}>
      {year ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Escolher mês e ano"
          hitSlop={8}
          onPress={() => setIsPickerVisible(true)}
          style={styles.yearButton}
        >
          <Text style={styles.year}>{year}</Text>
          <Icon name="chevron-down" size={12} />
        </Pressable>
      ) : null}
      <View style={styles.monthRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={onPrev} style={[styles.neighbor, styles.neighborStart]}>
          <Text style={styles.neighborText} numberOfLines={1}>{monthNameOf(shiftMonthKey(monthKey, -1))}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para o mês atual"
          disabled={isCurrentMonth}
          onPress={onPressMonth}
          style={styles.current}
        >
          <Text style={styles.month} numberOfLines={1}>{monthName}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={onNext} style={[styles.neighbor, styles.neighborEnd]}>
          <Text style={styles.neighborText} numberOfLines={1}>{monthNameOf(shiftMonthKey(monthKey, 1))}</Text>
        </Pressable>
      </View>
      <MonthYearPicker
        visible={isPickerVisible}
        monthKey={monthKey}
        onSelect={onSelectMonth}
        onClose={() => setIsPickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4, alignItems: 'center' },
  yearButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  year: { ...GgastosType.label, color: GgastosColors.inkFaint, letterSpacing: 0.6 },
  monthRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: GgastosSpacing.space2 },
  current: { flexShrink: 0, alignItems: 'center' },
  month: { ...GgastosType.displayLg, color: GgastosColors.inkStrong },
  neighbor: { flex: 1, minHeight: NEIGHBOR_TOUCH_HEIGHT, justifyContent: 'center', opacity: NEIGHBOR_OPACITY },
  neighborStart: { alignItems: 'flex-start' },
  neighborEnd: { alignItems: 'flex-end' },
  neighborText: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft },
});
