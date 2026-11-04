import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { hsvToHex } from '@/constants/color-utils';

const WEDGE_COUNT = 180;
const WEDGE_DEGREES = 360 / WEDGE_COUNT;
const WEDGE_OVERLAP_DEGREES = 0.8;
const BOTTOM_OFFSET_DEGREES = 90;
const HALF_TURN_DEGREES = 180;
const FULL_TURN_DEGREES = 360;
const THUMB_SIZE = 22;
const THUMB_BORDER = 3;

type ColorWheelProps = {
  size: number;
  hue: number;
  saturation: number;
  value: number;
  onChange: (hue: number, saturation: number) => void;
};

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / HALF_TURN_DEGREES;
}

// Red sits at the bottom and hue grows clockwise: bottom, left, top, right.
function pointOnWheel(center: number, radius: number, hue: number): { x: number; y: number } {
  const angle = toRadians(hue + BOTTOM_OFFSET_DEGREES);
  return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
}

function wedgePath(center: number, radius: number, startHue: number, endHue: number): string {
  const start = pointOnWheel(center, radius, startHue);
  const end = pointOnWheel(center, radius, endHue);
  return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z`;
}

export function ColorWheel({ size, hue, saturation, value, onChange }: ColorWheelProps) {
  const center = size / 2;
  const radius = size / 2;

  const wedges = useMemo(
    () =>
      Array.from({ length: WEDGE_COUNT }, (_, index) => {
        const startHue = index * WEDGE_DEGREES;
        return {
          key: index,
          path: wedgePath(center, radius, startHue, startHue + WEDGE_DEGREES + WEDGE_OVERLAP_DEGREES),
          fill: hsvToHex({ hue: startHue + WEDGE_DEGREES / 2, saturation: 1, value: 1 }),
        };
      }),
    [center, radius]
  );

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((event) => emit(event.x, event.y))
    .onUpdate((event) => emit(event.x, event.y));

  function emit(x: number, y: number) {
    const deltaX = x - center;
    const deltaY = y - center;
    const angleDegrees = (Math.atan2(deltaY, deltaX) * HALF_TURN_DEGREES) / Math.PI;
    const nextHue = (angleDegrees - BOTTOM_OFFSET_DEGREES + FULL_TURN_DEGREES) % FULL_TURN_DEGREES;
    onChange(nextHue, Math.min(Math.hypot(deltaX, deltaY) / radius, 1));
  }

  const thumb = pointOnWheel(center, saturation * radius, hue);

  return (
    <GestureDetector gesture={pan}>
      <View style={{ width: size, height: size }} accessibilityLabel="Círculo de cores">
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="saturation" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={1} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {wedges.map((wedge) => (
            <Path key={wedge.key} d={wedge.path} fill={wedge.fill} stroke={wedge.fill} strokeWidth={0.5} />
          ))}
          <Circle cx={center} cy={center} r={radius} fill="url(#saturation)" />
          <Circle cx={center} cy={center} r={radius} fill="#000000" opacity={1 - value} />
        </Svg>
        <View
          pointerEvents="none"
          style={[styles.thumb, { left: thumb.x - THUMB_SIZE / 2, top: thumb.y - THUMB_SIZE / 2 }]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  thumb: {
    position: 'absolute',
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
