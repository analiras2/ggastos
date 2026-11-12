import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { GgastosColors, GgastosType } from '@/shared/theme/ggastos-theme';
import type { DonutSlice } from '@/features/reports/donut-slices';

const CHART_SIZE = 260;
const STROKE_WIDTH = 30;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CENTER = CHART_SIZE / 2;
const SLICE_GAP_DEGREES = 3;
const RADIANS_PER_DEGREE = Math.PI / 180;
// Round caps stick out by half the stroke, so each end is pulled in by that angle to keep a visible gap.
const CAP_DEGREES = (STROKE_WIDTH / 2 / RADIUS) / RADIANS_PER_DEGREE;
const START_OFFSET_DEGREES = -90;

type DonutChartProps = { slices: DonutSlice[]; totalCents: number };

function pointAt(degrees: number): { x: number; y: number } {
  const radians = (degrees + START_OFFSET_DEGREES) * RADIANS_PER_DEGREE;
  return { x: CENTER + RADIUS * Math.cos(radians), y: CENTER + RADIUS * Math.sin(radians) };
}

function arcPath(startDegrees: number, endDegrees: number): string {
  const start = pointAt(startDegrees);
  const end = pointAt(endDegrees);
  const largeArc = endDegrees - startDegrees > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

// A slice shrinks by the cap and the gap on both ends; a tiny one collapses to a dot at its middle.
function trimmedArc(slice: DonutSlice): { start: number; end: number } {
  const trim = CAP_DEGREES + SLICE_GAP_DEGREES / 2;
  const middle = (slice.startDegrees + slice.endDegrees) / 2;
  const start = Math.min(slice.startDegrees + trim, middle);
  const end = Math.max(slice.endDegrees - trim, middle);
  return { start, end };
}

export function DonutChart({ slices, totalCents }: DonutChartProps) {
  const isSingleSlice = slices.length === 1;

  return (
    <View style={styles.container}>
      <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
        {isSingleSlice ? (
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke={slices[0].color} strokeWidth={STROKE_WIDTH} />
        ) : (
          slices.map((slice) => {
            const { start, end } = trimmedArc(slice);
            return (
              <Path
                key={slice.id}
                d={arcPath(start, end)}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
              />
            );
          })
        )}
      </Svg>
      <View pointerEvents="none" style={styles.center}>
        <Text style={styles.total} numberOfLines={1} adjustsFontSizeToFit>
          {formatCurrencyCents(totalCents)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: CHART_SIZE, height: CHART_SIZE, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    width: CHART_SIZE - STROKE_WIDTH * 3,
    alignItems: 'center',
  },
  total: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
});
