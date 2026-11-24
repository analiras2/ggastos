import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';

import { PULL_REFRESHING_DISTANCE, PULL_TRIGGER_DISTANCE } from '@/shared/lib/pull-to-refresh-rules';
import { usePullToRefresh } from '@/shared/lib/use-pull-to-refresh';
import { GgastosColors, GgastosRadius, GgastosShadow } from '@/shared/theme/ggastos-theme';

const INDICATOR_SIZE = 36;

type PullToRefreshProps = PropsWithChildren<{
  onRefresh: () => Promise<unknown>;
}>;

// Wraps a screen: pulling its content down from the top refreshes the data, like a native list.
export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { hostRef, offset, isRefreshing } = usePullToRefresh(onRefresh);
  const progress = offset.interpolate({
    inputRange: [0, PULL_TRIGGER_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  // Slides in from above and ends up centered in the band the content leaves free while refreshing.
  const indicatorShift = offset.interpolate({
    inputRange: [0, PULL_REFRESHING_DISTANCE],
    outputRange: [-INDICATOR_SIZE, (PULL_REFRESHING_DISTANCE - INDICATOR_SIZE) / 2],
  });

  return (
    <View ref={hostRef} style={styles.host}>
      <Animated.View
        pointerEvents="none"
        style={[styles.indicator, { opacity: progress, transform: [{ translateY: indicatorShift }, { scale: progress }] }]}
      >
        <ActivityIndicator animating={isRefreshing} color={GgastosColors.brandPrimary} />
      </Animated.View>
      <Animated.View style={[styles.content, { transform: [{ translateY: offset }] }]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, overflow: 'hidden' },
  content: { flex: 1 },
  indicator: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    zIndex: 1,
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: GgastosRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GgastosColors.bgSurface,
    ...GgastosShadow.card,
  },
});
