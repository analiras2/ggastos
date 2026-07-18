import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

type MonthHeaderProps = {
  month: string;
  isCurrentMonth?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onPressMonth?: () => void;
};

export function MonthHeader({
  month,
  isCurrentMonth = true,
  onPrev,
  onNext,
  onPressMonth,
}: MonthHeaderProps) {
  const lastSpaceIndex = month.lastIndexOf(' ');
  const monthName = lastSpaceIndex >= 0 ? month.slice(0, lastSpaceIndex) : month;
  const year = lastSpaceIndex >= 0 ? month.slice(lastSpaceIndex + 1) : '';

  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={onPrev} style={styles.chevron}>
          <Icon name="chevron-left" size={18} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para o mês atual"
          disabled={isCurrentMonth}
          onPress={onPressMonth}
          style={styles.monthGroup}
        >
          {year ? <Text style={styles.year}>{year}</Text> : null}
          <Text style={styles.month}>{monthName}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={onNext} style={styles.chevron}>
          <Icon name="chevron-right" size={18} />
        </Pressable>
      </View>
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
