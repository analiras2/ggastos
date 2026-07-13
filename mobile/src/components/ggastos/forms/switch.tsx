import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
};

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(checked ? GgastosColors.brandPrimary : GgastosColors.lineSoft, { duration: 150 }),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    left: withTiming(checked ? 21 : 3, { duration: 150 }),
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
  description: {
    ...GgastosType.micro,
    color: GgastosColors.inkFaint,
    marginTop: 2,
  },
  track: {
    width: 44,
    height: 26,
    borderRadius: GgastosRadius.pill,
  },
  thumb: {
    position: 'absolute',
    top: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
});
