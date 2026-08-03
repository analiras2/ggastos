import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyStateCard } from '@/components/ggastos/cards/empty-state-card';
import { QuickActionRow } from '@/components/ggastos/navigation/quick-action-row';
import { PlannedEntryRow } from '@/components/ggastos/rows/planned-entry-row';
import { PlanningTemplateRow } from '@/components/ggastos/rows/planning-template-row';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { AddPlanSheet } from '@/features/planning/add-plan-sheet';
import { AddTemplateSheet } from '@/features/planning/add-template-sheet';
import { usePlanningScreenViewModel } from '@/features/planning/use-planning-screen-view-model';

export function PlanningScreen() {
  const {
    entries,
    templates,
    isLoading,
    isError,
    isEmpty,
    cancellingEntryId,
    isAddPlanVisible,
    isAddTemplateVisible,
    handleCancelEntry,
    handleAddPlan,
    handleCloseAddPlan,
    handleAddTemplate,
    handleCloseAddTemplate,
  } = usePlanningScreenViewModel();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Planejamento</Text>

        <QuickActionRow
          actions={[
            { label: 'Adicionar planejamento', icon: 'plus', onPress: handleAddPlan },
            { label: 'Template', icon: 'repeat', onPress: handleAddTemplate },
          ]}
        />

        {isLoading ? <Text style={styles.status}>Carregando...</Text> : null}
        {isError ? (
          <Text style={styles.status}>Não foi possível carregar seus planejamentos.</Text>
        ) : null}

        {!isLoading && !isError && isEmpty ? (
          <EmptyStateCard
            icon="calendar"
            title="Nada por aqui ainda"
            description="Adicione um planejamento ou template para começar."
          />
        ) : null}

        {!isLoading && !isError && entries.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Este mês</Text>
            {entries.map((entry) => (
              <PlannedEntryRow
                key={entry.id}
                title={entry.title}
                category={entry.category}
                amount={entry.amount}
                kind={entry.kind}
                competence={entry.competence}
                status={entry.status}
                isCancellable={entry.isCancellable}
                isCancelling={cancellingEntryId === entry.id}
                onCancel={() => handleCancelEntry(entry)}
              />
            ))}
          </View>
        ) : null}

        {!isLoading && !isError && templates.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Templates recorrentes</Text>
            {templates.map((template) => (
              <PlanningTemplateRow
                key={template.id}
                title={template.title}
                category={template.category}
                amount={template.amount}
                kind={template.kind}
                recurrence={template.recurrence}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <AddPlanSheet visible={isAddPlanVisible} onClose={handleCloseAddPlan} />
      <AddTemplateSheet visible={isAddTemplateVisible} onClose={handleCloseAddTemplate} />
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
  title: {
    ...GgastosType.displayLg,
    color: GgastosColors.inkStrong,
  },
  status: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkFaint,
    textAlign: 'center',
    paddingVertical: 24,
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
    marginBottom: 4,
  },
});
