import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/core/button';
import { GlassSurface } from '@/shared/ui/core/glass-surface';
import { Icon } from '@/shared/ui/core/icon';
import { FLOATING_NAV_HEIGHT, FLOATING_NAV_MARGIN, FLOATING_NAV_FAB_RAISE } from '@/shared/ui/navigation/floating-nav-metrics';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { countLabel } from '@/shared/lib/counts';

const ICON_SIZE = 18;
const ENTRANCE_MS = 180;
const ENTRANCE_OFFSET = 16;
const GAP_ABOVE_NAV = 14;
// Space a list needs at its end so the last rows are not hidden behind this bar.
export const SELECTION_BAR_CLEARANCE = 80;

type SelectionActionBarProps = {
  selectedCount: number;
  selectedTotalCents: number;
  onCategorize: () => void;
};

// Glass bar that floats above the navigation while rows are being selected.
export function SelectionActionBar({ selectedCount, selectedTotalCents, onCategorize }: SelectionActionBarProps) {
  const insets = useSafeAreaInsets();
  const hasSelection = selectedCount > 0;
  const [entrance] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: ENTRANCE_MS, useNativeDriver: false }).start();
  }, [entrance]);

  const slideIn = entrance.interpolate({ inputRange: [0, 1], outputRange: [ENTRANCE_OFFSET, 0] });
  const bottom = FLOATING_NAV_HEIGHT + FLOATING_NAV_MARGIN + insets.bottom + FLOATING_NAV_FAB_RAISE + GAP_ABOVE_NAV;

  return (
    <View pointerEvents="box-none" style={[styles.anchor, { bottom }]}>
      <GlassSurface variant="menu" style={[styles.bar, { opacity: entrance, transform: [{ translateY: slideIn }] }]}>
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
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', left: FLOATING_NAV_MARGIN, right: FLOATING_NAV_MARGIN },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: GgastosSpacing.space3,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    borderRadius: GgastosRadius.lg,
  },
  summary: { flex: 1, gap: 2 },
  count: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  total: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
