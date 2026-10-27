import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { MonthHeader } from '@/components/ggastos/navigation/month-header';
import { QuickActionRow } from '@/components/ggastos/navigation/quick-action-row';
import { SyncStatusBanner } from '@/components/ggastos/navigation/sync-status-banner';
import { MetricHeroCard } from '@/components/ggastos/cards/metric-hero-card';
import { KpiComparisonCard } from '@/components/ggastos/cards/kpi-comparison-card';
import { CategoryDetailsSheet } from '@/features/dashboard/category-details-sheet';
import { DashboardCategoriesSection } from '@/features/dashboard/dashboard-categories-section';
import { useDashboardViewModel } from '@/features/dashboard/use-dashboard-view-model';
import { AddPlanSheet } from '@/features/planning/add-plan-sheet';
import { AddTemplateSheet } from '@/features/planning/add-template-sheet';
import { StatementImportSheet } from '@/features/statements/statement-import-sheet';
import { UncategorizedTransactionReviewSheet } from '@/features/statements/uncategorized-transaction-review-sheet';

export function DashboardScreen() {
  const {
    data,
    importBanner,
    categoryDetails,
    isAddPlanVisible,
    isAddTemplateVisible,
    isStatementImportVisible,
    categoryReviewBatchId,
    isCurrentMonth,
    isMonthClosed,
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
    handleOpenCategoryReview,
    handleCloseCategoryReview,
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

        {isMonthClosed ? (
          <View style={styles.closedBadge}>
            <Text style={styles.closedBadgeText}>Mês fechado</Text>
          </View>
        ) : null}

        <QuickActionRow
          edgePadding={GgastosSpacing.space5}
          actions={[
            { label: 'Importar fatura', icon: 'upload', onPress: handleOpenStatementImport },
            { label: 'Adicionar planejamento', icon: 'plus', onPress: handleAddPlan },
            { label: 'Template', icon: 'repeat', onPress: handleAddTemplate },
            {
              label: isClosingMonth ? 'Fechando...' : isMonthClosed ? 'Recalcular mês' : 'Fechar mês',
              icon: 'calendar-check',
              onPress: handleCloseMonth,
            },
          ]}
        />

        <MetricHeroCard label="Saldo atual" {...data.hero} />

        <View style={styles.kpiRow}>
          <KpiComparisonCard label="Saldo previsto" value={data.previsto}/>
          <KpiComparisonCard label="Comprometido restante" value={data.commitment.value} />
        </View>

        {data.openInvoices ? (
          <View style={styles.kpiRow}>
            <KpiComparisonCard
              label="Faturas em aberto"
              value={data.openInvoices.value}
              caption="Já contam em Comprometido restante. Pague em Pendências."
            />
          </View>
        ) : null}

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
        onReviewUncategorized={handleOpenCategoryReview}
      />

      <UncategorizedTransactionReviewSheet
        batchId={categoryReviewBatchId}
        visible={categoryReviewBatchId !== null}
        onClose={handleCloseCategoryReview}
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
