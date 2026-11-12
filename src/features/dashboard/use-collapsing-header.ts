import { useMemo, useState } from 'react';
import { Animated, type LayoutChangeEvent } from 'react-native';

// The greeting is the first block of the hero, so sliding the hero up by its height hides it.
const FADE_FRACTION = 0.6;
const MIN_RANGE = 1;

function heightOf(event: LayoutChangeEvent): number {
  return event.nativeEvent.layout.height;
}

// Scroll-linked collapse of a header: it slides up by `collapseDistance` while the page scrolls, so the
// greeting leaves through the top and the next block (the wallet) stops at the top.
export function useCollapsingHeader(gapBelowGreeting: number) {
  const [scrollY] = useState(() => new Animated.Value(0));
  const [heroHeight, setHeroHeight] = useState(0);
  const [greetingHeight, setGreetingHeight] = useState(0);
  const [walletHeight, setWalletHeight] = useState(0);
  const collapseDistance = greetingHeight > 0 ? greetingHeight + gapBelowGreeting : 0;

  return useMemo(() => {
    const range = Math.max(collapseDistance, MIN_RANGE);
    return {
      heroHeight,
      walletHeight,
      onScroll: Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false }),
      heroTranslateY: scrollY.interpolate({
        inputRange: [0, range],
        outputRange: [0, -collapseDistance],
        extrapolate: 'clamp',
      }),
      greetingOpacity: scrollY.interpolate({
        inputRange: [0, Math.max(range * FADE_FRACTION, MIN_RANGE)],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      }),
      onHeroLayout: (event: LayoutChangeEvent) => setHeroHeight(heightOf(event)),
      onGreetingLayout: (event: LayoutChangeEvent) => setGreetingHeight(heightOf(event)),
      onWalletLayout: (event: LayoutChangeEvent) => setWalletHeight(heightOf(event)),
    };
  }, [collapseDistance, heroHeight, scrollY, walletHeight]);
}

export type CollapsingHeader = ReturnType<typeof useCollapsingHeader>;
