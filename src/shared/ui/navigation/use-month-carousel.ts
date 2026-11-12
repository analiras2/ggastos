import { useMemo, useState } from 'react';
import { Animated, type LayoutChangeEvent, type ScrollView } from 'react-native';

import { shiftMonthKey } from '@/shared/lib/month';
import { useMonthCarouselSync } from '@/shared/ui/navigation/use-month-carousel-sync';

// Months on each side of the one the strip is centered on. The strip re-centers when the selection nears an end.
const WINDOW_MONTHS = 12;
const EDGE_MONTHS = 3;
const ITEM_WIDTH_FRACTION = 0.4;

// Horizontal strip of months: scrolling it moves the selection; changing the selection scrolls the strip.
export function useMonthCarousel(monthKey: string, onSelectMonth: (monthKey: string) => void) {
  const [anchor, setAnchor] = useState(monthKey);
  const [scrollX] = useState(() => new Animated.Value(0));
  const [rowWidth, setRowWidth] = useState(0);
  const [scrollView, setScrollView] = useState<ScrollView | null>(null);

  const months = useMemo(
    () => Array.from({ length: WINDOW_MONTHS * 2 + 1 }, (_, offset) => shiftMonthKey(anchor, offset - WINDOW_MONTHS)),
    [anchor]
  );
  const index = months.indexOf(monthKey);
  const itemWidth = Math.round(rowWidth * ITEM_WIDTH_FRACTION);

  // Re-center the window when the selection is near its end or outside it (adjusted while rendering).
  if (index < EDGE_MONTHS || index > months.length - 1 - EDGE_MONTHS) {
    setAnchor(monthKey);
  }

  useMonthCarouselSync({ monthKey, onSelectMonth, months, index, itemWidth, scrollView, scrollX, anchor });

  const onScroll = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false }),
    [scrollX]
  );

  return {
    months,
    itemWidth,
    sidePadding: Math.max((rowWidth - itemWidth) / 2, 0),
    setScrollView,
    scrollX,
    onScroll,
    onRowLayout: (event: LayoutChangeEvent) => setRowWidth(event.nativeEvent.layout.width),
  };
}
