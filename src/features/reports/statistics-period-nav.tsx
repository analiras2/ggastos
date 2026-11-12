import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import { MonthHeader } from '@/shared/ui/navigation/month-header';
import type { StatisticsViewModel } from '@/features/reports/use-statistics-view-model';

type StatisticsPeriodNavProps = { viewModel: StatisticsViewModel };

// Months use the shared month navigator; quarter and year use a simple previous/next row.
export function StatisticsPeriodNav({ viewModel }: StatisticsPeriodNavProps) {
  if (viewModel.period === 'month') {
    return (
      <MonthHeader
        month={viewModel.monthTitle}
        monthKey={viewModel.monthKey}
        isCurrentMonth={viewModel.isCurrentMonth}
        onPrev={viewModel.handlePrevious}
        onNext={viewModel.handleNext}
        onPressMonth={viewModel.handleGoToCurrentMonth}
        onSelectMonth={viewModel.handleSelectMonth}
      />
    );
  }

  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="Período anterior" onPress={viewModel.handlePrevious} style={styles.chevron}>
        <Icon name="chevron-left" size={18} />
      </Pressable>
      <Text style={styles.label}>{viewModel.periodLabel}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Próximo período" onPress={viewModel.handleNext} style={styles.chevron}>
        <Icon name="chevron-right" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  chevron: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  label: { ...GgastosType.displayXl, color: GgastosColors.inkStrong },
});
