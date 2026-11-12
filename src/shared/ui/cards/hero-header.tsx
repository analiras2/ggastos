import type { ReactNode } from 'react';
import { StyleSheet, type Animated, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GgastosRadius, GgastosSpacing } from '@/shared/theme/ggastos-theme';
import { GlassSurface } from '@/shared/ui/core/glass-surface';

type HeroHeaderProps = {
  children: ReactNode;
  // Lets a screen position or animate the block (e.g. collapse it while scrolling).
  style?: StyleProp<Animated.WithAnimatedValue<ViewStyle>>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

// Primary-color glass block at the top of a screen: it reaches under the status bar, has rounded bottom
// corners and lets the page show through when it floats over it. Children should use the "onPrimary" tone.
export function HeroHeader({ children, style, onLayout }: HeroHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <GlassSurface variant="hero" onLayout={onLayout} style={[styles.hero, { paddingTop: insets.top + GgastosSpacing.space4 }, style]}>
      {children}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: GgastosSpacing.space3,
    paddingHorizontal: GgastosSpacing.space5,
    paddingBottom: GgastosSpacing.space5,
    borderBottomLeftRadius: GgastosRadius.lg,
    borderBottomRightRadius: GgastosRadius.lg,
    borderWidth: 0,
  },
});
