import type { ReactNode } from 'react';
import { Animated, StyleSheet, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedTransparency } from '@/shared/lib/prefers-reduced-transparency';
import { GgastosColors } from '@/shared/theme/ggastos-theme';

// "Liquid glass" for the layers that float over scrolling content (navigation, menus, buttons): translucent,
// blurred and saturated backdrop, a light border and a soft highlight on the top edge.
const BLUR_FILTER = 'blur(26px) saturate(180%)';
const HIGHLIGHT = 'inset 0 1px 0 rgba(255, 255, 255, 0.85)';
const WHITE_BORDER = 'rgba(255, 255, 255, 0.7)';

// Each variant says how the glass looks and what it becomes when the person asked for less transparency.
// The bar's shadow must stay within its margin to the screen edge, or it looks cut off; the menu sits over text,
// so it is more opaque and has a deeper shadow; the hero is the primary color letting the page show through.
const VARIANTS = {
  bar: {
    background: 'rgba(255, 255, 255, 0.4)',
    border: WHITE_BORDER,
    shadow: `0 2px 8px rgba(31, 26, 23, 0.14), ${HIGHLIGHT}`,
    solidBackground: GgastosColors.bgSurfaceRaised,
    solidBorder: GgastosColors.lineSofter,
  },
  menu: {
    background: 'rgba(255, 255, 255, 0.58)',
    border: WHITE_BORDER,
    shadow: `0 10px 28px rgba(31, 26, 23, 0.16), ${HIGHLIGHT}`,
    solidBackground: GgastosColors.bgSurfaceRaised,
    solidBorder: GgastosColors.lineSofter,
  },
  button: {
    background: 'rgba(255, 255, 255, 0.55)',
    border: WHITE_BORDER,
    shadow: `0 2px 8px rgba(31, 26, 23, 0.16), ${HIGHLIGHT}`,
    solidBackground: GgastosColors.bgSurfaceRaised,
    solidBorder: GgastosColors.bgSurfaceRaised,
  },
  hero: {
    background: 'rgba(31, 107, 87, 0.94)',
    border: 'rgba(255, 255, 255, 0.16)',
    shadow: '0 4px 16px rgba(31, 26, 23, 0.16)',
    solidBackground: GgastosColors.brandPrimary,
    solidBorder: GgastosColors.brandPrimary,
  },
} as const;

type GlassVariant = keyof typeof VARIANTS;

type GlassSurfaceProps = {
  children?: ReactNode;
  // May hold animated values. Fade and move the surface through this prop, not through a parent: a parent
  // with opacity or transform stops the browser from blurring what is behind the glass.
  style?: StyleProp<Animated.WithAnimatedValue<ViewStyle>>;
  variant?: GlassVariant;
  onLayout?: (event: LayoutChangeEvent) => void;
};

// Web-only CSS that react-native's style types do not know about.
function glassWebStyle(variant: GlassVariant): ViewStyle {
  return {
    backdropFilter: BLUR_FILTER,
    WebkitBackdropFilter: BLUR_FILTER,
    boxShadow: VARIANTS[variant].shadow,
  } as unknown as ViewStyle;
}

export function GlassSurface({ children, style, variant = 'bar', onLayout }: GlassSurfaceProps) {
  const isReducedTransparency = useReducedTransparency();
  const look = VARIANTS[variant];
  const material: StyleProp<ViewStyle> = isReducedTransparency
    ? { backgroundColor: look.solidBackground, borderColor: look.solidBorder }
    : [{ backgroundColor: look.background, borderColor: look.border }, glassWebStyle(variant)];

  return <Animated.View onLayout={onLayout} style={[styles.base, material, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  base: { borderWidth: 1 },
});
