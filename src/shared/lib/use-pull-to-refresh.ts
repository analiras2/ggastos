import { useEffect, useRef, useState, type RefObject } from 'react';
import { Animated, Platform, type View } from 'react-native';

import { isScrolledToTop } from '@/shared/lib/is-scrolled-to-top';
import {
  dampPull,
  isMostlyVertical,
  PULL_REFRESHING_DISTANCE,
  shouldRefresh,
} from '@/shared/lib/pull-to-refresh-rules';

const SETTLE_DURATION_MS = 180;
// Keeps the spinner visible long enough to be noticed when the data comes back instantly.
const MIN_REFRESH_MS = 500;

type PullToRefresh = {
  hostRef: RefObject<View | null>;
  // How far the content is dragged down, in pixels.
  offset: Animated.Value;
  isRefreshing: boolean;
};

function settleTo(offset: Animated.Value, toValue: number): void {
  Animated.timing(offset, { toValue, duration: SETTLE_DURATION_MS, useNativeDriver: false }).start();
}

// Pull-down-to-refresh for the web: react-native-web has no RefreshControl, so the touch gesture is read
// from the DOM. It only starts when the touched content is at the top and the swipe is mostly vertical.
export function usePullToRefresh(onRefresh: () => Promise<unknown>): PullToRefresh {
  const hostRef = useRef<View | null>(null);
  const [offset] = useState(() => new Animated.Value(0));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefreshRef = useRef(onRefresh);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const host = hostRef.current as unknown as HTMLElement | null;
    if (Platform.OS !== 'web' || !host) {
      return undefined;
    }
    let startX = 0;
    let startY = 0;
    let target: EventTarget | null = null;
    let tracking = false;
    let dragged = 0;

    const refresh = async () => {
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      settleTo(offset, PULL_REFRESHING_DISTANCE);
      try {
        await Promise.all([onRefreshRef.current(), new Promise((resolve) => setTimeout(resolve, MIN_REFRESH_MS))]);
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        settleTo(offset, 0);
      }
    };

    const handleStart = (event: TouchEvent) => {
      tracking = !isRefreshingRef.current && event.touches.length === 1 && isScrolledToTop(event.target, host);
      target = event.target;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      dragged = 0;
    };

    const handleMove = (event: TouchEvent) => {
      if (!tracking) {
        return;
      }
      const deltaX = event.touches[0].clientX - startX;
      const deltaY = event.touches[0].clientY - startY;
      if (deltaY <= 0 || !isMostlyVertical(deltaX, deltaY) || !isScrolledToTop(target, host)) {
        tracking = false;
        dragged = 0;
        settleTo(offset, 0);
        return;
      }
      // Stops the browser from scrolling or reloading the page while the content is dragged.
      if (event.cancelable) {
        event.preventDefault();
      }
      dragged = dampPull(deltaY);
      offset.setValue(dragged);
    };

    const handleEnd = () => {
      if (!tracking) {
        return;
      }
      tracking = false;
      if (shouldRefresh(dragged)) {
        void refresh();
        return;
      }
      settleTo(offset, 0);
    };

    host.addEventListener('touchstart', handleStart, { passive: true });
    host.addEventListener('touchmove', handleMove, { passive: false });
    host.addEventListener('touchend', handleEnd);
    host.addEventListener('touchcancel', handleEnd);
    return () => {
      host.removeEventListener('touchstart', handleStart);
      host.removeEventListener('touchmove', handleMove);
      host.removeEventListener('touchend', handleEnd);
      host.removeEventListener('touchcancel', handleEnd);
    };
  }, [offset]);

  return { hostRef, offset, isRefreshing };
}
