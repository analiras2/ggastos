import type { ReactNode } from 'react';
import { Animated, StyleSheet, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing } from '@/shared/theme/ggastos-theme';

type HeroHeaderProps = {
  children: ReactNode;
  // Lets a screen position or animate the block (e.g. collapse it while scrolling).
  style?: StyleProp<Animated.WithAnimatedValue<ViewStyle>>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

// Primary-color block at the top of a screen: it reaches under the status bar and has rounded
// bottom corners. Children should use the "onPrimary" tone.
export function HeroHeader({ children, style, onLayout }: HeroHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View onLayout={onLayout} style={[styles.hero, { paddingTop: insets.top + GgastosSpacing.space4 }, style]}>
      {children}
    </Animated.View>
  );
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
