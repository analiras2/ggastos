import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing } from '@/shared/theme/ggastos-theme';

type HeroHeaderProps = { children: ReactNode };

// Primary-color block at the top of a screen: it reaches under the status bar and has rounded
// bottom corners. Children should use the "onPrimary" tone.
export function HeroHeader({ children }: HeroHeaderProps) {
  const insets = useSafeAreaInsets();

  return <View style={[styles.hero, { paddingTop: insets.top + GgastosSpacing.space4 }]}>{children}</View>;
}

const styles = StyleSheet.create({
  hero: {
    gap: GgastosSpacing.space3,
    paddingHorizontal: GgastosSpacing.space5,
    paddingBottom: GgastosSpacing.space5,
    borderBottomLeftRadius: GgastosRadius.lg,
    borderBottomRightRadius: GgastosRadius.lg,
    backgroundColor: GgastosColors.brandPrimary,
  },
});
