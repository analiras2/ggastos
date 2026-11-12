import { Animated, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { MONTH_LABELS, parseMonthKey } from '@/shared/lib/month';
import { GgastosColors, GgastosType } from '@/shared/theme/ggastos-theme';
import { useMonthCarousel } from '@/shared/ui/navigation/use-month-carousel';

const ROW_HEIGHT = 44;
const NAME_BOX_WIDTH = 220;
const SCROLL_EVENT_THROTTLE_MS = 16;
// A month shrinks to the size of a neighbor's name as it moves away from the middle.
const SHRUNK_SCALE = GgastosType.bodyMd.fontSize / GgastosType.displayLg.fontSize;
const NEIGHBOR_OPACITY = 0.55;

// Web-only CSS so the strip stops with a month in the middle.
const SNAP_CONTAINER = { scrollSnapType: 'x mandatory', scrollbarWidth: 'none' } as unknown as ViewStyle;
const SNAP_ITEM = { scrollSnapAlign: 'center' } as unknown as ViewStyle;

function monthNameOf(monthKey: string): string {
  return MONTH_LABELS[parseMonthKey(monthKey).monthIndex] ?? monthKey;
}

type MonthCarouselProps = {
  monthKey: string;
  isCurrentMonth: boolean;
  onSelectMonth: (monthKey: string) => void;
  onPressCurrent?: () => void;
};

// Months side by side, scrolling horizontally: the one in the middle is big and the others get smaller
// and fainter the further they are, all following the finger.
export function MonthCarousel({ monthKey, isCurrentMonth, onSelectMonth, onPressCurrent }: MonthCarouselProps) {
  const { months, itemWidth, sidePadding, setScrollView, scrollX, onScroll, onRowLayout } = useMonthCarousel(monthKey, onSelectMonth);

  return (
    <View onLayout={onRowLayout} style={styles.row}>
      {itemWidth > 0 ? (
        <ScrollView
          ref={setScrollView}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
          onScroll={onScroll}
          contentContainerStyle={{ paddingHorizontal: sidePadding }}
          style={SNAP_CONTAINER}
        >
          {months.map((key, index) => {
            const peak = index * itemWidth;
            const step = itemWidth;
            const scale = scrollX.interpolate({
              inputRange: [peak - 2 * step, peak - step, peak, peak + step, peak + 2 * step],
              outputRange: [SHRUNK_SCALE, SHRUNK_SCALE, 1, SHRUNK_SCALE, SHRUNK_SCALE],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange: [peak - 2 * step, peak - step, peak, peak + step, peak + 2 * step],
              outputRange: [0, NEIGHBOR_OPACITY, 1, NEIGHBOR_OPACITY, 0],
              extrapolate: 'clamp',
            });
            const isSelected = key === monthKey;
            const name = monthNameOf(key);

            return (
              <View key={key} style={[styles.item, SNAP_ITEM, { width: itemWidth }]}>
                <Animated.View style={[styles.nameBox, { opacity, transform: [{ scale }] }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isSelected ? 'Voltar para o mês atual' : `Ir para ${name}`}
                    disabled={isSelected && isCurrentMonth}
                    onPress={isSelected ? onPressCurrent : () => onSelectMonth(key)}
                  >
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                  </Pressable>
                </Animated.View>
              </View>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignSelf: 'stretch', height: ROW_HEIGHT * 1.15, justifyContent: 'center' },
  item: { height: ROW_HEIGHT * 1.15, alignItems: 'center', justifyContent: 'center' },
  nameBox: { width: NAME_BOX_WIDTH, alignItems: 'center' },
  name: { ...GgastosType.displayLg, color: GgastosColors.inkStrong },
});
