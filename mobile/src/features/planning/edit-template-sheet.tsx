import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ggastos/core/button';
import { Icon } from '@/components/ggastos/core/icon';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import { centsFromMaskedInput } from '@/features/planning/planning-form-utils';
import type { PlanningTemplate } from '@/features/planning/planning-schema';
import { useUpdatePlanningTemplate } from '@/features/planning/use-planning-templates';

type EditTemplateSheetProps = { template: PlanningTemplate | null; effectiveMonth: string; onClose: () => void };

export function EditTemplateSheet({ template, effectiveMonth, onClose }: EditTemplateSheetProps) {
  const updateTemplate = useUpdatePlanningTemplate();
  const [title, setTitle] = useState(template?.title ?? '');
  const [amountCents, setAmountCents] = useState(template?.defaultAmountCents ?? 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleSave = async () => {
    if (!template) return;
    try { await updateTemplate.mutateAsync({ id: template.id, title, defaultAmountCents: amountCents, effectiveMonth }); onClose(); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Não foi possível editar o template.'); }
  };
  return <Modal visible={template !== null} animationType="slide" onRequestClose={onClose}><SafeAreaProvider><SafeAreaView style={styles.screen} edges={['top']}><View style={styles.header}><Text style={styles.title}>Editar template</Text><Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose}><Icon name="x" size={20} /></Pressable></View><View style={styles.content}><Text style={styles.label}>Título</Text><TextInput style={styles.input} value={title} onChangeText={setTitle} /><Text style={styles.label}>Valor por lançamento</Text><TextInput style={styles.input} keyboardType="number-pad" value={formatCurrencyCents(amountCents)} onChangeText={(value) => setAmountCents(centsFromMaskedInput(value))} />{errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}<Button fullWidth disabled={updateTemplate.isPending} onPress={handleSave}>{updateTemplate.isPending ? 'Salvando...' : 'Salvar alterações'}</Button></View></SafeAreaView></SafeAreaProvider></Modal>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: GgastosColors.bgBase }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: GgastosSpacing.space5 }, title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong }, content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space3 }, label: { ...GgastosType.label, color: GgastosColors.inkSoft }, input: { borderWidth: 1, borderColor: GgastosColors.lineSoft, borderRadius: GgastosRadius.md, padding: GgastosSpacing.space3, ...GgastosType.bodyMd, color: GgastosColors.inkStrong, backgroundColor: GgastosColors.bgSurface }, error: { ...GgastosType.bodySm, color: GgastosColors.expense } });
