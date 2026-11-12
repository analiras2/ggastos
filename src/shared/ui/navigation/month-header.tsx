import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import { MonthCarousel } from '@/shared/ui/navigation/month-carousel';
import { MonthYearPicker } from '@/shared/ui/navigation/month-year-picker';

type MonthHeaderProps = {
  month: string;
  monthKey: string;
  isCurrentMonth?: boolean;
  onPressMonth?: () => void;
  onSelectMonth: (monthKey: string) => void;
};

// The year (opens the month and year picker) above a strip of months to swipe through.
export function MonthHeader({
  month,
  monthKey,
  isCurrentMonth = true,
  onPressMonth,
  onSelectMonth,
}: MonthHeaderProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const lastSpaceIndex = month.lastIndexOf(' ');
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
      <MonthCarousel monthKey={monthKey} isCurrentMonth={isCurrentMonth} onSelectMonth={onSelectMonth} onPressCurrent={onPressMonth} />
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
});
