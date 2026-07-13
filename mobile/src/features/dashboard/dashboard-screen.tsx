import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosSpacing } from '@/constants/ggastos-theme';
import { MonthHeader } from '@/components/ggastos/navigation/month-header';
import { QuickActionRow } from '@/components/ggastos/navigation/quick-action-row';
import { SyncStatusBanner } from '@/components/ggastos/navigation/sync-status-banner';
import { MetricHeroCard } from '@/components/ggastos/cards/metric-hero-card';
import { KpiComparisonCard } from '@/components/ggastos/cards/kpi-comparison-card';
import { CommitmentCard } from '@/components/ggastos/cards/commitment-card';
import { DashboardCategoriesSection } from '@/features/dashboard/dashboard-categories-section';
import { useDashboardViewModel } from '@/features/dashboard/use-dashboard-view-model';

export function DashboardScreen() {
  const {
    data,
    isSyncing,
    syncBanner,
    handleSync,
    handleOpenCategory,
    handleAddPlan,
    handleReview,
  } = useDashboardViewModel();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MonthHeader month={data.month} onSync={handleSync} syncing={isSyncing} />

        <MetricHeroCard label="Saldo previsto do mês" {...data.hero} />

        <View style={styles.kpiRow}>
          <KpiComparisonCard
            label="Previsto"
            value={data.previsto}
            caption="Todo o mês, incluindo o que ainda vai acontecer"
          />
          <KpiComparisonCard label="Atual" value={data.atual} caption="Só o que já aconteceu" tone="accent" />
        </View>

        <CommitmentCard
          value={data.commitment.value}
          subtitle="Quanto do mês ainda está reservado por compromissos futuros"
          level={data.commitment.level}
        />

        <QuickActionRow
          actions={[
            { label: 'Adicionar planejamento', icon: 'plus', onPress: handleAddPlan },
            { label: 'Sincronizar', icon: 'refresh-cw', onPress: handleSync },
            { label: 'Revisar pendências', icon: 'list-checks', onPress: handleReview },
          ]}
        />

        <DashboardCategoriesSection categories={data.categories} onOpenCategory={handleOpenCategory} />

        <SyncStatusBanner
          state={syncBanner.state}
          message={syncBanner.message}
          actionLabel={syncBanner.actionLabel}
          onAction={handleSync}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  content: {
    padding: GgastosSpacing.space5,
    paddingBottom: 100,
    gap: GgastosSpacing.space5,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
