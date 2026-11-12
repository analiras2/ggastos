import { Pressable, StyleSheet } from 'react-native';

import { GgastosRadius } from '@/shared/theme/ggastos-theme';
import { GlassSurface } from '@/shared/ui/core/glass-surface';
import { Icon } from '@/shared/ui/core/icon';

export const SEARCH_BUTTON_SIZE = 44;

type HeroSearchButtonProps = { onPress: () => void };

// Glass circle that opens the month search; positioned by its parent.
export function HeroSearchButton({ onPress }: HeroSearchButtonProps) {
  return (
    <GlassSurface variant="button" style={styles.surface}>
      <Pressable accessibilityRole="button" accessibilityLabel="Buscar lançamentos" onPress={onPress} style={styles.press}>
        <Icon name="search" size={20} />
      </Pressable>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  surface: { width: SEARCH_BUTTON_SIZE, height: SEARCH_BUTTON_SIZE, borderRadius: GgastosRadius.pill },
  press: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: GgastosRadius.pill },
});
