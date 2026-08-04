import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosSpacing } from '@/constants/ggastos-theme';
import { MonthHeader } from '@/components/ggastos/navigation/month-header';
import { QuickActionRow } from '@/components/ggastos/navigation/quick-action-row';
import { SyncStatusBanner } from '@/components/ggastos/navigation/sync-status-banner';
import { MetricHeroCard } from '@/components/ggastos/cards/metric-hero-card';
import { KpiComparisonCard } from '@/components/ggastos/cards/kpi-comparison-card';
import { CommitmentCard } from '@/components/ggastos/cards/commitment-card';
import { CategoryDetailsSheet } from '@/features/dashboard/category-details-sheet';
import { DashboardCategoriesSection } from '@/features/dashboard/dashboard-categories-section';
import { useDashboardViewModel } from '@/features/dashboard/use-dashboard-view-model';
import { AddPlanSheet } from '@/features/planning/add-plan-sheet';
import { AddTemplateSheet } from '@/features/planning/add-template-sheet';
import { StatementImportSheet } from '@/features/statements/statement-import-sheet';

export function DashboardScreen() {
  const {
    data,
    importBanner,
    categoryDetails,
    isAddPlanVisible,
    isAddTemplateVisible,
    isStatementImportVisible,
    isCurrentMonth,
    isClosingMonth,
    closeMonthBanner,
    handlePrevMonth,
    handleNextMonth,
    handleGoToCurrentMonth,
    handleOpenCategory,
    handleCloseCategoryDetails,
    handleAddPlan,
    handleCloseAddPlan,
    handleAddTemplate,
    handleCloseAddTemplate,
    handleOpenStatementImport,
    handleCloseStatementImport,
    handleCloseMonth,
  } = useDashboardViewModel();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MonthHeader
          month={data.month}
          isCurrentMonth={isCurrentMonth}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
          onPressMonth={handleGoToCurrentMonth}
        />

        <QuickActionRow
          actions={[
            { label: 'Importar fatura', icon: 'upload', onPress: handleOpenStatementImport },
            { label: 'Adicionar planejamento', icon: 'plus', onPress: handleAddPlan },
            { label: 'Template', icon: 'repeat', onPress: handleAddTemplate },
            {
              label: isClosingMonth ? 'Fechando...' : 'Fechar mês',
              icon: 'calendar-check',
              onPress: handleCloseMonth,
            },
          ]}
        />

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

        <DashboardCategoriesSection categories={data.categories} onOpenCategory={handleOpenCategory} />

        <SyncStatusBanner
          state={importBanner.state}
          message={importBanner.message}
          actionLabel={importBanner.actionLabel}
          onAction={handleOpenStatementImport}
        />

        {closeMonthBanner ? (
          <SyncStatusBanner state={closeMonthBanner.state} message={closeMonthBanner.message} />
        ) : null}
      </ScrollView>

      <CategoryDetailsSheet
        visible={categoryDetails.visible}
        isLoading={categoryDetails.isLoading}
        isError={categoryDetails.isError}
        details={categoryDetails.details}
        togglingEntryId={categoryDetails.togglingEntryId}
        onToggleEntryStatus={categoryDetails.onToggleEntryStatus}
        onClose={handleCloseCategoryDetails}
      />

      <AddPlanSheet visible={isAddPlanVisible} onClose={handleCloseAddPlan} />

      <AddTemplateSheet visible={isAddTemplateVisible} onClose={handleCloseAddTemplate} />

      <StatementImportSheet
        visible={isStatementImportVisible}
        onClose={handleCloseStatementImport}
      />
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
    gap: GgastosSpacing.space5,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
