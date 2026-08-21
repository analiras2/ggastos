import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyStateCard } from '@/components/ggastos/cards/empty-state-card';
import { Icon } from '@/components/ggastos/core/icon';
import { MonthHeader } from '@/components/ggastos/navigation/month-header';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { AddPlanSheet } from '@/features/planning/add-plan-sheet';
import { AddTemplateSheet } from '@/features/planning/add-template-sheet';
import { EditTemplateSheet } from '@/features/planning/edit-template-sheet';
import { PlanningEntryListRow } from '@/features/planning/planning-entry-list-row';
import { usePlanningViewModel } from '@/features/planning/use-planning-view-model';

export function PlanningScreen() {
  const viewModel = usePlanningViewModel();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MonthHeader month={viewModel.monthLabel} isCurrentMonth={viewModel.isCurrentMonth} onPrev={viewModel.handlePreviousMonth} onNext={viewModel.handleNextMonth} onPressMonth={viewModel.handleCurrentMonth} />
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Planejamento</Text>
            <Text style={styles.subtitle}>Organize os compromissos antes de eles acontecerem.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Adicionar planejamento" onPress={viewModel.handleOpenAddPlan} style={styles.addButton}>
            <Icon name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {viewModel.isLoading ? <ActivityIndicator color={GgastosColors.brandPrimary} /> : null}
        {viewModel.isError ? <Text style={styles.status}>Não foi possível carregar os planejamentos.</Text> : null}
        {!viewModel.isLoading && !viewModel.isError && viewModel.entries.length === 0 ? (
          <EmptyStateCard title="Sem planejamentos neste mês" description="Adicione contas, parcelas ou receitas esperadas para acompanhar o mês." actionLabel="Adicionar planejamento" onAction={viewModel.handleOpenAddPlan} />
        ) : null}
        {viewModel.entries.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compromissos do mês</Text>
            {viewModel.entries.map((entry) => (
              <PlanningEntryListRow key={entry.id} {...entry} isUpdating={viewModel.updatingEntryId === entry.id} onToggleStatus={() => viewModel.handleToggleEntryStatus(entry)} onCancel={() => viewModel.handleCancelEntry(entry)} />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View><Text style={styles.sectionTitle}>Templates</Text><Text style={styles.sectionSubtitle}>Recorrências e parcelas para os próximos meses.</Text></View>
            <Pressable accessibilityRole="button" onPress={viewModel.handleOpenAddTemplate} style={styles.templateAction}><Text style={styles.templateActionText}>Novo</Text></Pressable>
          </View>
          {viewModel.templates.length === 0 ? <Text style={styles.status}>Nenhum template ativo.</Text> : null}
          {viewModel.templates.map((template) => (
            <View key={template.id} style={styles.templateRow}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${template.title}`} onPress={() => viewModel.handleOpenEditTemplate(template)} style={styles.templateContent}><Text style={styles.templateTitle}>{template.title}</Text><Text style={styles.sectionSubtitle}>{template.recurrenceFrequency === 'MONTHLY' ? 'Mensal' : template.recurrenceFrequency === 'YEARLY' ? 'Anual' : `${template.installmentTotal ?? 0} parcelas`}</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Arquivar ${template.title}`} disabled={viewModel.archivingTemplateId === template.id} onPress={() => viewModel.handleArchiveTemplate(template.id, template.title)} style={styles.archiveAction}><Text style={styles.archiveText}>{viewModel.archivingTemplateId === template.id ? '...' : 'Arquivar'}</Text></Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
      <AddPlanSheet visible={viewModel.isAddPlanVisible} onClose={viewModel.handleCloseAddPlan} />
      <AddTemplateSheet visible={viewModel.isAddTemplateVisible} onClose={viewModel.handleCloseAddTemplate} />
      <EditTemplateSheet key={viewModel.selectedTemplate?.id ?? 'closed'} template={viewModel.selectedTemplate} effectiveMonth={viewModel.month} onClose={viewModel.handleCloseEditTemplate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  content: { padding: GgastosSpacing.space5, paddingBottom: 100, gap: GgastosSpacing.space6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: GgastosSpacing.space4 },
  title: { ...GgastosType.displayLg, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft, maxWidth: 280 },
  addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: GgastosColors.brandPrimary, alignItems: 'center', justifyContent: 'center' },
  section: { gap: GgastosSpacing.space2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: GgastosSpacing.space3 },
  sectionTitle: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  sectionSubtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  status: { ...GgastosType.bodyMd, color: GgastosColors.inkFaint, textAlign: 'center', paddingVertical: GgastosSpacing.space4 },
  templateAction: { paddingVertical: GgastosSpacing.space2, paddingHorizontal: GgastosSpacing.space3, borderRadius: GgastosRadius.pill, backgroundColor: GgastosColors.brandPrimarySoft },
  templateActionText: { ...GgastosType.label, color: GgastosColors.brandPrimaryDark },
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: GgastosSpacing.space3, paddingVertical: GgastosSpacing.space3, borderBottomWidth: 1, borderBottomColor: GgastosColors.lineSofter },
  templateContent: { flex: 1, gap: 2 },
  templateTitle: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  archiveAction: { padding: GgastosSpacing.space2 },
  archiveText: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
