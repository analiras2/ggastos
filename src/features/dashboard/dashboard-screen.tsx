import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { MonthHeader } from '@/shared/ui/navigation/month-header';
import { FLOATING_NAV_CONTENT_CLEARANCE } from '@/shared/ui/navigation/floating-nav-metrics';
import { SyncStatusBanner } from '@/shared/ui/navigation/sync-status-banner';
import { EmptyStateCard } from '@/shared/ui/cards/empty-state-card';
import { KpiComparisonCard } from '@/shared/ui/cards/kpi-comparison-card';
import { DashboardHero, HERO_GAP } from '@/features/dashboard/dashboard-hero';
import { useCollapsingHeader } from '@/features/dashboard/use-collapsing-header';
import { useGreeting } from '@/features/dashboard/use-greeting';
import { DashboardCategoriesSection } from '@/features/dashboard/dashboard-categories-section';
import { DashboardSheets } from '@/features/dashboard/dashboard-sheets';
import { useDashboardViewModel } from '@/features/dashboard/use-dashboard-view-model';

const SCROLL_EVENT_THROTTLE_MS = 16;

export function DashboardScreen() {
  const viewModel = useDashboardViewModel();
  const greeting = useGreeting();
  const collapse = useCollapsingHeader(HERO_GAP);
  const { data, wallet, loadStatus, closeMonthBanner, monthKey, isMonthClosed, isClosingMonth } = viewModel;

  return (
    <SafeAreaView style={styles.screen} edges={[]}>
      <Animated.ScrollView
        contentContainerStyle={[styles.content, { paddingTop: collapse.heroHeight + GgastosSpacing.space4 }]}
        onScroll={collapse.onScroll}
        scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
      >
        <MonthHeader
          month={data.month}
          monthKey={monthKey}
          onSelectMonth={viewModel.handleSelectMonth}
          isCurrentMonth={viewModel.isCurrentMonth}
          onPressMonth={viewModel.handleGoToCurrentMonth}
        />

        {!wallet.isLoading && !wallet.isConfigured ? (
          <SyncStatusBanner
            message="Informe o saldo atual da sua carteira para começar."
            actionLabel="Informar saldo"
            onAction={viewModel.handleOpenWalletSheet}
          />
        ) : null}

        {loadStatus === 'loading' ? <Text style={styles.status}>Carregando o mês...</Text> : null}
        {loadStatus === 'error' ? (
          <SyncStatusBanner state="error" message="Não foi possível carregar os dados do mês." />
        ) : null}

        <View style={styles.kpiRow}>
          <KpiComparisonCard label="Pendente" value={data.commitment.value} />
          <KpiComparisonCard label="Saldo previsto" value={data.previsto} />
        </View>

        {data.openInvoices ? (
          <KpiComparisonCard
            label="Faturas em aberto"
            value={data.openInvoices.value}
            caption="Já contam em Pendente. Pague em Pendências."
          />
        ) : null}

        {loadStatus === 'ready' && data.categories.length === 0 ? (
          <EmptyStateCard
            title="Nada neste mês ainda"
            description="Adicione um lançamento ou importe a fatura do cartão."
            actionLabel="Importar fatura"
            onAction={viewModel.handleOpenStatementImport}
          />
        ) : (
          <DashboardCategoriesSection categories={data.categories} onOpenCategory={viewModel.handleOpenCategory} />
        )}

        {closeMonthBanner ? (
          <SyncStatusBanner state={closeMonthBanner.state} message={closeMonthBanner.message} />
        ) : viewModel.canCloseMonth && loadStatus === 'ready' && !isClosingMonth ? (
          <SyncStatusBanner
            message={isMonthClosed ? 'Mês fechado.' : 'Terminou o mês? Feche para consolidar no Anual.'}
            actionLabel={isMonthClosed ? 'Recalcular' : 'Fechar mês'}
            onAction={viewModel.handleCloseMonth}
          />
        ) : null}
      </Animated.ScrollView>

      <DashboardHero
        collapse={collapse}
        greeting={greeting}
        wallet={{ value: wallet.value, isNegative: wallet.isNegative }}
        onPressWallet={viewModel.handleOpenWalletSheet}
        onPressSearch={viewModel.handleOpenSearch}
      />

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
    paddingBottom: FLOATING_NAV_CONTENT_CLEARANCE,
    gap: GgastosSpacing.space4,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  status: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkFaint,
    textAlign: 'center',
  },
});
