import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyStateCard } from '@/shared/ui/cards/empty-state-card';
import { Icon } from '@/shared/ui/core/icon';
import { FLOATING_NAV_CONTENT_CLEARANCE } from '@/shared/ui/navigation/floating-nav-metrics';
import { MonthHeader } from '@/shared/ui/navigation/month-header';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { AddPlanSheet, PlanningEntryListRow } from '@/features/planned-entries';
import { EditTemplateSheet } from '@/features/templates';
import { PlanningTemplatesSection } from '@/features/planning/planning-templates-section';
import { usePlanningViewModel } from '@/features/planning/use-planning-view-model';

const ADD_ICON_SIZE = 20;
const ADD_ICON_COLOR = '#FFFFFF';
const ADD_BUTTON_SIZE = 48;
const SUBTITLE_MAX_WIDTH = 280;

export function PlanningScreen() {
  const viewModel = usePlanningViewModel();
  const isEmpty = !viewModel.isLoading && !viewModel.isError && viewModel.entries.length === 0;

  return (
    <SafeAreaView style={styles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
        <MonthHeader
          month={viewModel.monthLabel}
          monthKey={viewModel.month}
          onSelectMonth={viewModel.handleSelectMonth}
          isCurrentMonth={viewModel.isCurrentMonth}
          onPressMonth={viewModel.handleCurrentMonth}
        />
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Planejamento</Text>
            <Text style={styles.subtitle}>Organize os compromissos antes de eles acontecerem.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar planejamento"
            onPress={viewModel.handleOpenAddPlan}
            style={styles.addButton}
          >
            <Icon name="plus" size={ADD_ICON_SIZE} color={ADD_ICON_COLOR} />
          </Pressable>
        </View>

        {viewModel.isLoading ? <ActivityIndicator color={GgastosColors.brandPrimary} /> : null}
        {viewModel.isError ? <Text style={styles.status}>Não foi possível carregar os planejamentos.</Text> : null}
        {isEmpty ? (
          <EmptyStateCard
            title="Sem planejamentos neste mês"
            description="Adicione contas, parcelas ou receitas esperadas para acompanhar o mês."
            actionLabel="Adicionar planejamento"
            onAction={viewModel.handleOpenAddPlan}
          />
        ) : null}
        {viewModel.entries.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compromissos do mês</Text>
            {viewModel.entries.map((entry) => (
              <PlanningEntryListRow
                key={entry.id}
                {...entry}
                isUpdating={viewModel.updatingEntryId === entry.id}
                onToggleStatus={() => viewModel.handleToggleEntryStatus(entry)}
                onCancel={() => viewModel.handleCancelEntry(entry)}
              />
            ))}
          </View>
        ) : null}

        <PlanningTemplatesSection
          templates={viewModel.templates}
          archivingTemplateId={viewModel.archivingTemplateId}
          onAdd={viewModel.handleOpenAddPlan}
          onEdit={viewModel.handleOpenEditTemplate}
          onArchive={viewModel.handleArchiveTemplate}
        />
      </ScrollView>
      <AddPlanSheet visible={viewModel.isAddPlanVisible} onClose={viewModel.handleCloseAddPlan} />
      <EditTemplateSheet
        key={viewModel.selectedTemplate?.id ?? 'closed'}
        template={viewModel.selectedTemplate}
        effectiveMonth={viewModel.month}
        onClose={viewModel.handleCloseEditTemplate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  content: {
    padding: GgastosSpacing.space5,
    paddingBottom: FLOATING_NAV_CONTENT_CLEARANCE,
    gap: GgastosSpacing.space6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: GgastosSpacing.space4,
  },
  title: { ...GgastosType.displayLg, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft, maxWidth: SUBTITLE_MAX_WIDTH },
  addButton: {
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
    backgroundColor: GgastosColors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: GgastosSpacing.space2 },
  sectionTitle: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  status: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkFaint,
    textAlign: 'center',
    paddingVertical: GgastosSpacing.space4,
  },
});
