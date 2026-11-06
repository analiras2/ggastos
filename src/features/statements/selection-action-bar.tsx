import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/ui/core/button';
import { Icon } from '@/shared/ui/core/icon';
import { GgastosColors, GgastosShadow, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { countLabel } from '@/shared/lib/counts';

const ICON_SIZE = 18;
const ENTRANCE_MS = 180;
const ENTRANCE_OFFSET = 16;

type SelectionActionBarProps = {
  selectedCount: number;
  selectedTotalCents: number;
  onCategorize: () => void;
};

export function SelectionActionBar({ selectedCount, selectedTotalCents, onCategorize }: SelectionActionBarProps) {
  const hasSelection = selectedCount > 0;
  const [entrance] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: ENTRANCE_MS, useNativeDriver: false }).start();
  }, [entrance]);

  const slideIn = entrance.interpolate({ inputRange: [0, 1], outputRange: [ENTRANCE_OFFSET, 0] });

  return (
    <Animated.View style={[styles.bar, { opacity: entrance, transform: [{ translateY: slideIn }] }]}>
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
