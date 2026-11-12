import { Pressable, StyleSheet } from 'react-native';

import { GgastosColors, GgastosRadius } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';

export const SEARCH_BUTTON_SIZE = 44;

type HeroSearchButtonProps = { onPress: () => void };

// White circle that opens the month search; positioned by its parent.
export function HeroSearchButton({ onPress }: HeroSearchButtonProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Buscar lançamentos" onPress={onPress} style={styles.button}>
      <Icon name="search" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SEARCH_BUTTON_SIZE,
    height: SEARCH_BUTTON_SIZE,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
