import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import { MonthYearPicker } from '@/shared/ui/navigation/month-year-picker';

type MonthHeaderProps = {
  month: string;
  monthKey?: string;
  isCurrentMonth?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onPressMonth?: () => void;
  onSelectMonth?: (monthKey: string) => void;
};

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
  const canPickMonth = Boolean(monthKey && onSelectMonth);
  const lastSpaceIndex = month.lastIndexOf(' ');
  const monthName = lastSpaceIndex >= 0 ? month.slice(0, lastSpaceIndex) : month;
  const year = lastSpaceIndex >= 0 ? month.slice(lastSpaceIndex + 1) : '';

  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={onPrev} style={styles.chevron}>
          <Icon name="chevron-left" size={18} />
        </Pressable>
        <View style={styles.monthGroup}>
          {year ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Escolher mês e ano"
              disabled={!canPickMonth}
              hitSlop={8}
              onPress={() => setIsPickerVisible(true)}
              style={styles.yearButton}
            >
              <Text style={styles.year}>{year}</Text>
              {canPickMonth ? <Icon name="chevron-down" size={12} /> : null}
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar para o mês atual"
            disabled={isCurrentMonth}
            onPress={onPressMonth}
          >
            <Text style={styles.month}>{monthName}</Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={onNext} style={styles.chevron}>
          <Icon name="chevron-right" size={18} />
        </Pressable>
      </View>
      {monthKey && onSelectMonth ? (
        <MonthYearPicker
          visible={isPickerVisible}
          monthKey={monthKey}
          onSelect={onSelectMonth}
          onClose={() => setIsPickerVisible(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -GgastosSpacing.space5,
  },
  chevron: {
    width: 40,
    padding: 6,
    alignItems: 'center',
  },
  monthGroup: {
    flex: 1,
    alignItems: 'center',
  },
  yearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  year: {
    ...GgastosType.label,
    color: GgastosColors.inkFaint,
    letterSpacing: 0.6,
  },
  month: {
    ...GgastosType.displayXl,
    color: GgastosColors.inkStrong,
  },
});
