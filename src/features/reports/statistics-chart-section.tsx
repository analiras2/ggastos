import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { EmptyStateCard } from '@/shared/ui/cards/empty-state-card';
import { AnnualCategoryBars } from '@/features/reports/annual-category-bars';
import { DonutChart } from '@/features/reports/donut-chart';
import { StatisticsLegend } from '@/features/reports/statistics-legend';
import type { StatisticsViewModel } from '@/features/reports/use-statistics-view-model';

const TOTAL_LABELS = { EXPENSE: 'Gastos', INCOME: 'Receitas', INVESTMENT: 'Investimentos' } as const;

const EMPTY_DESCRIPTION = 'Quando houver lançamentos realizados neste período, eles aparecem aqui.';
const YEAR_EMPTY_DESCRIPTION = 'Feche um mês para começar a ver o consolidado anual aqui.';

type StatisticsChartSectionProps = { viewModel: StatisticsViewModel };

// Loading, error and empty states, then the chosen chart (donut with legend, or bars).
export function StatisticsChartSection({ viewModel }: StatisticsChartSectionProps) {
  if (viewModel.isLoading) {
    return <Text style={styles.status}>Carregando estatísticas...</Text>;
  }
  if (viewModel.isError) {
    return <Text style={styles.status}>Não foi possível carregar as estatísticas.</Text>;
  }
  if (viewModel.isEmpty) {
    return (
      <EmptyStateCard
        icon="chart-pie"
        title="Nada por aqui ainda"
        description={viewModel.period === 'year' ? YEAR_EMPTY_DESCRIPTION : EMPTY_DESCRIPTION}
      />
    );
  }

  if (viewModel.chartView === 'bars') {
    return <AnnualCategoryBars categories={viewModel.categories} totalLabel={TOTAL_LABELS[viewModel.impactType]} />;
  }

  return (
    <View style={styles.donut}>
      <DonutChart slices={viewModel.slices} totalCents={viewModel.totalCents} />
      <StatisticsLegend slices={viewModel.slices} />
    </View>
  );
}

const styles = StyleSheet.create({
  donut: { gap: GgastosSpacing.space5 },
  status: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkFaint,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
