import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { GgastosRadius } from '@/constants/ggastos-theme';

const SWATCH_SIZE = 32;
const RING_BORDER_WIDTH = 2;
const RING_PADDING = 2;
const RAINBOW_HUES = ['#E53935', '#F4A11D', '#F6E03B', '#43B84A', '#2C9BE8', '#8E44D6'];
const RAINBOW_SLICE_ANGLE = (2 * Math.PI) / RAINBOW_HUES.length;
const RADIUS = SWATCH_SIZE / 2;

type CustomColorSwatchProps = {
  // Set when the chosen color is not one of the palette swatches.
  customColor: string | null;
  onPress: () => void;
};

function slicePath(index: number): string {
  const start = index * RAINBOW_SLICE_ANGLE;
  const end = start + RAINBOW_SLICE_ANGLE;
  const startX = RADIUS + RADIUS * Math.cos(start);
  const startY = RADIUS + RADIUS * Math.sin(start);
  const endX = RADIUS + RADIUS * Math.cos(end);
  const endY = RADIUS + RADIUS * Math.sin(end);
  return `M ${RADIUS} ${RADIUS} L ${startX} ${startY} A ${RADIUS} ${RADIUS} 0 0 1 ${endX} ${endY} Z`;
}

export function CustomColorSwatch({ customColor, onPress }: CustomColorSwatchProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Cor personalizada"
      onPress={onPress}
      style={[styles.ring, customColor ? { borderColor: customColor } : null]}
    >
      {customColor ? (
        <View style={[styles.solid, { backgroundColor: customColor }]} />
      ) : (
        <Svg width={SWATCH_SIZE} height={SWATCH_SIZE}>
          {RAINBOW_HUES.map((hue, index) => (
            <Path key={hue} d={slicePath(index)} fill={hue} />
          ))}
        </Svg>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    padding: RING_PADDING,
    borderRadius: GgastosRadius.pill,
    borderWidth: RING_BORDER_WIDTH,
    borderColor: 'transparent',
  },
  solid: { width: SWATCH_SIZE, height: SWATCH_SIZE, borderRadius: SWATCH_SIZE / 2 },
});
