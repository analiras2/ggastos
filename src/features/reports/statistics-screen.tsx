import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { FLOATING_NAV_CONTENT_CLEARANCE } from '@/shared/ui/navigation/floating-nav-metrics';
import { SegmentedControl, type SegmentOption } from '@/shared/ui/navigation/segmented-control';
import { AnnualMonthsSection } from '@/features/reports/annual-months-section';
import { StatisticsChartSection } from '@/features/reports/statistics-chart-section';
import { StatisticsFilters } from '@/features/reports/statistics-filters';
import { StatisticsPeriodNav } from '@/features/reports/statistics-period-nav';
import type { StatisticsPeriod } from '@/features/reports/statistics-period-rules';
import { useStatisticsViewModel } from '@/features/reports/use-statistics-view-model';

const PERIOD_OPTIONS: SegmentOption<StatisticsPeriod>[] = [
  { key: 'year', label: 'Ano' },
  { key: 'quarter', label: 'Trimestre' },
  { key: 'month', label: 'Mês' },
];

export function StatisticsScreen() {
  const viewModel = useStatisticsViewModel();
  const showYearMonths = viewModel.period === 'year' && !viewModel.isLoading && !viewModel.isError && viewModel.yearMonths.length > 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Estatísticas</Text>
        <SegmentedControl options={PERIOD_OPTIONS} value={viewModel.period} onChange={viewModel.setPeriod} />
        <StatisticsPeriodNav viewModel={viewModel} />
        <StatisticsFilters
          impactType={viewModel.impactType}
          chartView={viewModel.chartView}
          onChangeImpactType={viewModel.setImpactType}
          onChangeChartView={viewModel.setChartView}
        />
        <StatisticsChartSection viewModel={viewModel} />
        {showYearMonths ? (
          <View>
            <AnnualMonthsSection months={viewModel.yearMonths} isVisible={viewModel.showMonths} onToggle={viewModel.handleToggleMonths} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  content: {
    padding: GgastosSpacing.space5,
    paddingBottom: FLOATING_NAV_CONTENT_CLEARANCE,
    gap: GgastosSpacing.space4,
  },
  title: { ...GgastosType.displayLg, color: GgastosColors.inkStrong },
});
