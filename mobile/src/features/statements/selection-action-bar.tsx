import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Button } from '@/components/ggastos/core/button';
import { Icon } from '@/components/ggastos/core/icon';
import { GgastosColors, GgastosShadow, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import { countLabel } from '@/features/statements/counts';

const ICON_SIZE = 18;

type SelectionActionBarProps = {
  selectedCount: number;
  selectedTotalCents: number;
  onCategorize: () => void;
};

export function SelectionActionBar({ selectedCount, selectedTotalCents, onCategorize }: SelectionActionBarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.bar}>
      <View style={styles.summary}>
        <Text style={styles.count}>{countLabel(selectedCount, 'selecionado', 'selecionados')}</Text>
        <Text style={styles.total}>{hasSelection ? formatCurrencyCents(selectedTotalCents) : 'Nenhum lançamento'}</Text>
      </View>
      <Button
        disabled={!hasSelection}
        icon={<Icon name="tags" size={ICON_SIZE} color={GgastosColors.bgBase} />}
        onPress={onCategorize}
      >
        Categorizar
      </Button>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: GgastosSpacing.space3,
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space3,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    borderTopWidth: 1,
    borderTopColor: GgastosColors.lineSofter,
    ...GgastosShadow.raised,
  },
  summary: { flex: 1, gap: 2 },
  count: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  total: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
