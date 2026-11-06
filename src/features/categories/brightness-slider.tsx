import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { GgastosRadius } from '@/shared/theme/ggastos-theme';
import { useDragPosition } from '@/shared/lib/use-drag-position';

const TRACK_HEIGHT = 18;
const THUMB_SIZE = 26;
const THUMB_BORDER = 3;

type BrightnessSliderProps = {
  width: number;
  // Fully bright color at the current hue and saturation; the track fades it to black.
  brightColor: string;
  value: number;
  onChange: (value: number) => void;
};

export function BrightnessSlider({ width, brightColor, value, onChange }: BrightnessSliderProps) {
  const usableWidth = width - THUMB_SIZE;

  const { ref, panHandlers } = useDragPosition((x) => {
    onChange(Math.min(Math.max((x - THUMB_SIZE / 2) / usableWidth, 0), 1));
  });

  return (
    <View ref={ref} {...panHandlers} style={{ width, height: THUMB_SIZE }} accessibilityLabel="Brilho">
        <View style={[styles.track, { top: (THUMB_SIZE - TRACK_HEIGHT) / 2 }]}>
          <Svg width={width} height={TRACK_HEIGHT}>
            <Defs>
              <LinearGradient id="brightness" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#000000" />
                <Stop offset="1" stopColor={brightColor} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={width} height={TRACK_HEIGHT} fill="url(#brightness)" />
          </Svg>
        </View>
        <View pointerEvents="none" style={[styles.thumb, { left: value * usableWidth }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    borderRadius: GgastosRadius.pill,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    top: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: THUMB_BORDER,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
});
