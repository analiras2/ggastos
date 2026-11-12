import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { Icon } from '@/shared/ui/core/icon';

const ICON_SIZE = 30;
const TURN_DURATION_MS = 220;
// A plus turned a quarter of the way around is an "x".
const OPEN_ROTATION_DEGREES = 45;

type AddFabIconProps = { isOpen: boolean };

// The plus of the add button; it turns into an "x" while the menu is open.
export function AddFabIcon({ isOpen }: AddFabIconProps) {
  const [progress] = useState(() => new Animated.Value(isOpen ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isOpen ? 1 : 0,
      duration: TURN_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isOpen, progress]);

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${OPEN_ROTATION_DEGREES}deg`],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Icon name="plus" size={ICON_SIZE} color="#FFFFFF" />
    </Animated.View>
  );
}
