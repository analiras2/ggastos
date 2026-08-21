import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ggastos/core/button';
import { Icon } from '@/components/ggastos/core/icon';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { useCategoryManagementViewModel } from '@/features/settings/use-category-management-view-model';

type CategoryManagementSheetProps = { visible: boolean; onClose: () => void };

export function CategoryManagementSheet({ visible, onClose }: CategoryManagementSheetProps) {
  const viewModel = useCategoryManagementViewModel();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider><SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}><View><Text style={styles.title}>Categorias</Text><Text style={styles.subtitle}>Toque em uma categoria pessoal para editar.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12} onPress={onClose}><Icon name="x" size={20} /></Pressable></View>
        <ScrollView contentContainerStyle={styles.content}>
          {viewModel.isLoading ? <Text style={styles.status}>Carregando categorias...</Text> : null}
          {viewModel.errorMessage ? <Text style={styles.error}>{viewModel.errorMessage}</Text> : null}
          {viewModel.categories.filter((category) => category.isActive).map((category) => <CategoryRow key={category.id} category={category} onPress={() => viewModel.openEditor(category)} />)}
          {viewModel.categories.some((category) => !category.isActive) ? <><Text style={styles.sectionTitle}>Ocultas</Text>{viewModel.categories.filter((category) => !category.isActive).map((category) => <CategoryRow key={category.id} category={category} onPress={() => viewModel.openEditor(category)} />)}</> : null}
        </ScrollView>
        <Modal visible={viewModel.editingCategory !== null} transparent animationType="fade" onRequestClose={viewModel.closeEditor}>
          <View style={styles.overlay}><View style={styles.editor}><Text style={styles.editorTitle}>Editar categoria</Text><TextInput style={styles.input} value={viewModel.editingName} onChangeText={viewModel.setEditingName} autoFocus /><Text style={styles.helper}>Ocultar mantém os lançamentos já classificados no histórico.</Text><Button fullWidth disabled={viewModel.isSaving || !viewModel.editingName.trim()} onPress={viewModel.save}>{viewModel.isSaving ? 'Salvando...' : 'Salvar'}</Button><Button fullWidth variant={viewModel.editingCategory?.isActive ? 'danger' : 'secondary'} disabled={viewModel.isSaving} onPress={viewModel.toggleVisibility}>{viewModel.editingCategory?.isActive ? 'Ocultar categoria' : 'Exibir novamente'}</Button><Button fullWidth variant="ghost" onPress={viewModel.closeEditor}>Cancelar</Button></View></View>
        </Modal>
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  );
}

function CategoryRow({ category, onPress }: { category: { name: string; impactType: string; isPersonal: boolean }; onPress: () => void }) {
  return <Pressable accessibilityRole="button" disabled={!category.isPersonal} onPress={onPress} style={[styles.row, !category.isPersonal && styles.rowDefault]}><View><Text style={styles.rowName}>{category.name}</Text><Text style={styles.rowMeta}>{impactLabel(category.impactType)} · {category.isPersonal ? 'Pessoal' : 'Padrão'}</Text></View>{category.isPersonal ? <Icon name="chevron-right" size={18} /> : null}</Pressable>;
}

function impactLabel(impactType: string) { return ({ EXPENSE: 'Despesa', INCOME: 'Receita', INVESTMENT: 'Investimento', TRANSFER: 'Transferência' } as Record<string, string>)[impactType] ?? impactType; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: GgastosSpacing.space5, borderBottomWidth: 1, borderBottomColor: GgastosColors.lineSofter }, title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong }, subtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft }, content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space2 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: GgastosRadius.md, padding: GgastosSpacing.space4, backgroundColor: GgastosColors.bgSurface }, rowDefault: { opacity: 0.72 }, rowName: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong }, rowMeta: { ...GgastosType.bodySm, color: GgastosColors.inkSoft }, sectionTitle: { ...GgastosType.labelCaps, color: GgastosColors.inkSoft, marginTop: GgastosSpacing.space4 }, status: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft, textAlign: 'center' }, error: { ...GgastosType.bodySm, color: GgastosColors.expense }, overlay: { flex: 1, justifyContent: 'center', padding: GgastosSpacing.space5, backgroundColor: '#00000055' }, editor: { gap: GgastosSpacing.space3, borderRadius: GgastosRadius.lg, padding: GgastosSpacing.space5, backgroundColor: GgastosColors.bgSurfaceRaised }, editorTitle: { ...GgastosType.displaySm, color: GgastosColors.inkStrong }, input: { borderWidth: 1, borderColor: GgastosColors.lineSoft, borderRadius: GgastosRadius.md, paddingHorizontal: GgastosSpacing.space4, paddingVertical: GgastosSpacing.space3, ...GgastosType.bodyMd, color: GgastosColors.inkStrong }, helper: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
