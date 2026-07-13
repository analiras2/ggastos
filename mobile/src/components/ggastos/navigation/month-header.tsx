import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { GgastosColors, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

type MonthHeaderProps = {
  month: string;
  onPrev?: () => void;
  onNext?: () => void;
  onSync?: () => void;
  syncing?: boolean;
};

export function MonthHeader({ month, onPrev, onNext, onSync, syncing }: MonthHeaderProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (syncing) {
      rotation.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1);
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [syncing, rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.row}>
      <View style={styles.monthGroup}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={onPrev} style={styles.chevron}>
          <Icon name="chevron-left" size={18} />
        </Pressable>
        <Text style={styles.month}>{month}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={onNext} style={styles.chevron}>
          <Icon name="chevron-right" size={18} />
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Sincronizar agora" onPress={onSync} style={styles.syncButton}>
        <Animated.View style={spinStyle}>
          <Icon name="refresh-cw" size={17} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chevron: {
    padding: 6,
  },
  month: {
    ...GgastosType.displayXl,
    color: GgastosColors.inkStrong,
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    backgroundColor: GgastosColors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
