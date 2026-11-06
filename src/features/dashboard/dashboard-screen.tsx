import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { MonthHeader } from '@/shared/ui/navigation/month-header';
import { QuickActionRow } from '@/shared/ui/navigation/quick-action-row';
import { SyncStatusBanner } from '@/shared/ui/navigation/sync-status-banner';
import { MetricHeroCard } from '@/shared/ui/cards/metric-hero-card';
import { KpiComparisonCard } from '@/shared/ui/cards/kpi-comparison-card';
import { DashboardCategoriesSection } from '@/features/dashboard/dashboard-categories-section';
import { DashboardSheets } from '@/features/dashboard/dashboard-sheets';
import { useDashboardViewModel } from '@/features/dashboard/use-dashboard-view-model';
import { OpeningBalanceCard } from '@/features/opening-balance/opening-balance-card';

export function DashboardScreen() {
  const viewModel = useDashboardViewModel();
  const { data, importBanner, closeMonthBanner, monthKey, isMonthClosed, isClosingMonth } = viewModel;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MonthHeader
          month={data.month}
          monthKey={monthKey}
          onSelectMonth={viewModel.handleSelectMonth}
          isCurrentMonth={viewModel.isCurrentMonth}
          onPrev={viewModel.handlePrevMonth}
          onNext={viewModel.handleNextMonth}
          onPressMonth={viewModel.handleGoToCurrentMonth}
        />

        {isMonthClosed ? (
          <View style={styles.closedBadge}>
            <Text style={styles.closedBadgeText}>Mês fechado</Text>
          </View>
        ) : null}

        <QuickActionRow
          edgePadding={GgastosSpacing.space5}
          actions={[
            { label: 'Buscar', icon: 'search', onPress: viewModel.handleOpenSearch },
            { label: 'Importar fatura', icon: 'upload', onPress: viewModel.handleOpenStatementImport },
            { label: 'Novo lançamento', icon: 'plus', onPress: viewModel.handleAddPlan },
            { label: 'Template', icon: 'repeat', onPress: viewModel.handleAddTemplate },
            {
              label: isClosingMonth ? 'Fechando...' : isMonthClosed ? 'Recalcular mês' : 'Fechar mês',
              icon: 'calendar-check',
              onPress: viewModel.handleCloseMonth,
            },
          ]}
        />

        <MetricHeroCard label="Carteira" {...data.hero} />

        <OpeningBalanceCard monthKey={monthKey} />

        <View style={styles.kpiRow}>
          <KpiComparisonCard label="Saldo previsto" value={data.previsto} />
          <KpiComparisonCard label="Pendente" value={data.commitment.value} />
        </View>

        {data.openInvoices ? (
          <View style={styles.kpiRow}>
            <KpiComparisonCard
              label="Faturas em aberto"
              value={data.openInvoices.value}
              caption="Já contam em Pendente. Pague em Pendências."
            />
          </View>
        ) : null}

        <DashboardCategoriesSection categories={data.categories} onOpenCategory={viewModel.handleOpenCategory} />

        <SyncStatusBanner
          state={importBanner.state}
          message={importBanner.message}
          actionLabel={importBanner.actionLabel}
          onAction={viewModel.handleOpenStatementImport}
        />

        {closeMonthBanner ? (
          <SyncStatusBanner state={closeMonthBanner.state} message={closeMonthBanner.message} />
        ) : null}
      </ScrollView>

      <DashboardSheets viewModel={viewModel} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  content: {
    paddingHorizontal: GgastosSpacing.space5,
    paddingTop: GgastosSpacing.space4,
    paddingBottom: 100,
    gap: GgastosSpacing.space3,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  closedBadge: {
    alignSelf: 'flex-start',
    paddingVertical: GgastosSpacing.space1,
    paddingHorizontal: GgastosSpacing.space3,
    borderRadius: 999,
    backgroundColor: GgastosColors.brandPrimarySoft,
  },
  closedBadgeText: {
    ...GgastosType.labelCaps,
    color: GgastosColors.brandPrimaryDark,
  },
});
