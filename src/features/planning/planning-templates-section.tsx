import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import type { PlanningTemplate } from '@/features/templates';

const TEMPLATE_TEXT_GAP = 2;

type PlanningTemplatesSectionProps = {
  templates: PlanningTemplate[];
  archivingTemplateId: string | null;
  onAdd: () => void;
  onEdit: (template: PlanningTemplate) => void;
  onArchive: (id: string, title: string) => void;
};

function frequencyLabel(template: PlanningTemplate) {
  if (template.recurrenceFrequency === 'MONTHLY') return 'Mensal';
  if (template.recurrenceFrequency === 'YEARLY') return 'Anual';
  return `${template.installmentTotal ?? 0} parcelas`;
}

export function PlanningTemplatesSection({
  templates,
  archivingTemplateId,
  onAdd,
  onEdit,
  onArchive,
}: PlanningTemplatesSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Templates</Text>
          <Text style={styles.sectionSubtitle}>Recorrências e parcelas para os próximos meses.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onAdd} style={styles.newAction}>
          <Text style={styles.newActionText}>Novo</Text>
        </Pressable>
      </View>
      {templates.length === 0 ? <Text style={styles.status}>Nenhum template ativo.</Text> : null}
      {templates.map((template) => (
        <View key={template.id} style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${template.title}`}
            onPress={() => onEdit(template)}
            style={styles.content}
          >
            <Text style={styles.rowTitle}>{template.title}</Text>
            <Text style={styles.sectionSubtitle}>{frequencyLabel(template)}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Arquivar ${template.title}`}
            disabled={archivingTemplateId === template.id}
            onPress={() => onArchive(template.id, template.title)}
            style={styles.archiveAction}
          >
            <Text style={styles.archiveText}>{archivingTemplateId === template.id ? '...' : 'Arquivar'}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: GgastosSpacing.space2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
  },
  sectionTitle: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  sectionSubtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  status: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkFaint,
    textAlign: 'center',
    paddingVertical: GgastosSpacing.space4,
  },
  newAction: {
    paddingVertical: GgastosSpacing.space2,
    paddingHorizontal: GgastosSpacing.space3,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.brandPrimarySoft,
  },
  newActionText: { ...GgastosType.label, color: GgastosColors.brandPrimaryDark },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
    paddingVertical: GgastosSpacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  content: { flex: 1, gap: TEMPLATE_TEXT_GAP },
  rowTitle: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  archiveAction: { padding: GgastosSpacing.space2 },
  archiveText: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
