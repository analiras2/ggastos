import { useEffect, useRef } from 'react';
import { Animated, type ScrollView } from 'react-native';

const SETTLE_DELAY_MS = 140;

type CarouselSyncInput = {
  monthKey: string;
  onSelectMonth: (monthKey: string) => void;
  months: string[];
  index: number;
  itemWidth: number;
  scrollView: ScrollView | null;
  scrollX: Animated.Value;
  anchor: string;
};

// Keeps the strip and the selection in step: scrolling the strip selects the month it stops on, and
// selecting a month (arrows, year picker, tap on a neighbor) scrolls the strip to it.
export function useMonthCarouselSync({ monthKey, onSelectMonth, months, index, itemWidth, scrollView, scrollX, anchor }: CarouselSyncInput) {
  const lastX = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ monthKey, onSelectMonth, months, itemWidth });

  useEffect(() => {
    latest.current = { monthKey, onSelectMonth, months, itemWidth };
  });

  // A new window or a first measure puts the selected month in the middle without animating.
  useEffect(() => {
    if (itemWidth > 0) {
      scrollView?.scrollTo({ x: latest.current.months.indexOf(latest.current.monthKey) * itemWidth, animated: false });
    }
  }, [anchor, itemWidth, scrollView]);

  useEffect(() => {
    if (itemWidth > 0 && index >= 0 && Math.abs(lastX.current - index * itemWidth) > 1) {
      scrollView?.scrollTo({ x: index * itemWidth, animated: true });
    }
  }, [index, itemWidth, scrollView]);

  // When the scrolling stops, the month nearest to the middle becomes the selected one.
  useEffect(() => {
    const id = scrollX.addListener(({ value }) => {
      lastX.current = value;
      if (settleTimer.current) {
        clearTimeout(settleTimer.current);
      }
      settleTimer.current = setTimeout(() => {
        const current = latest.current;
        if (current.itemWidth <= 0) {
          return;
        }
        const nearest = Math.min(Math.max(Math.round(lastX.current / current.itemWidth), 0), current.months.length - 1);
        const key = current.months[nearest];
        if (key && key !== current.monthKey) {
          current.onSelectMonth(key);
        }
      }, SETTLE_DELAY_MS);
    });
    return () => {
      scrollX.removeListener(id);
      if (settleTimer.current) {
        clearTimeout(settleTimer.current);
      }
    };
  }, [scrollX]);
}
