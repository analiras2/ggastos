import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ggastos/core/button';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { countLabel } from '@/features/statements/counts';

type CategoriesToolbarProps = {
  totalCount: number;
  isSelectionMode: boolean;
  isAllSelected: boolean;
  onEnterSelection: () => void;
  onExitSelection: () => void;
  onSelectAll: () => void;
  onClear: () => void;
};

export function CategoriesToolbar({
  totalCount,
  isSelectionMode,
  isAllSelected,
  onEnterSelection,
  onExitSelection,
  onSelectAll,
  onClear,
}: CategoriesToolbarProps) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.titleGroup}>
        <Text style={styles.title}>Categorias</Text>
        <Text style={styles.subtitle}>
          {isSelectionMode
            ? 'Toque nos lançamentos para selecionar.'
            : `${countLabel(totalCount, 'lançamento', 'lançamentos')} sem categoria.`}
        </Text>
      </View>
      <View style={styles.actions}>
        {isSelectionMode ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              onPress={isAllSelected ? onClear : onSelectAll}
            >
              {isAllSelected ? 'Limpar' : `Todos (${totalCount})`}
            </Button>
            <Button size="sm" variant="secondary" onPress={onExitSelection}>Cancelar</Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" onPress={onEnterSelection}>Selecionar</Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: GgastosSpacing.space3,
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space3,
    backgroundColor: GgastosColors.bgBase,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  titleGroup: { flex: 1, gap: 2 },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  actions: { flexDirection: 'row', alignItems: 'center', gap: GgastosSpacing.space2 },
});
