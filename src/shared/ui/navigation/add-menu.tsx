import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import {
  FLOATING_NAV_FAB_RAISE,
  FLOATING_NAV_FAB_SIZE,
  FLOATING_NAV_HEIGHT,
  FLOATING_NAV_MARGIN,
  FLOATING_NAV_MENU_GAP,
} from '@/shared/ui/navigation/floating-nav-metrics';

export type AddMenuAction = { label: string; icon: string; onPress: () => void };

type AddMenuProps = {
  visible: boolean;
  actions: AddMenuAction[];
  onClose: () => void;
};

const MENU_MIN_WIDTH = 220;
const OPEN_DURATION_MS = 260;
const CLOSE_DURATION_MS = 160;
const CLOSED_SCALE = 0.08;
// From its bottom edge, the menu starts at the center of the button and rises out of it.
const CLOSED_OFFSET = FLOATING_NAV_MENU_GAP + FLOATING_NAV_FAB_SIZE / 2;

// Action menu opened by the raised "+" button, shown right above the floating navigation. It fades
// and grows upward out of the button when it opens, and goes back into it when it closes.
export function AddMenu({ visible, actions, onClose }: AddMenuProps) {
  const insets = useSafeAreaInsets();
  const [progress] = useState(() => new Animated.Value(0));
  // Stays mounted until the closing animation ends. Adjusted while rendering, as React recommends.
  const [wasVisible, setWasVisible] = useState(visible);
  const [isMounted, setIsMounted] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setIsMounted(true);
    }
  }

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? OPEN_DURATION_MS : CLOSE_DURATION_MS,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !visible) {
        setIsMounted(false);
      }
    });
  }, [isMounted, visible, progress]);

  if (!isMounted) {
    return null;
  }

  const bottomOffset =
    FLOATING_NAV_HEIGHT + FLOATING_NAV_MARGIN + insets.bottom + FLOATING_NAV_FAB_RAISE + FLOATING_NAV_MENU_GAP;
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [CLOSED_OFFSET, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [CLOSED_SCALE, 1] });

  return (
    <>
      <Pressable accessibilityLabel="Fechar menu" onPress={onClose} style={styles.backdrop} />
      <View pointerEvents="box-none" style={[styles.anchor, { bottom: bottomOffset }]}>
        <Animated.View
          style={[styles.menu, GgastosShadow.raised, { opacity: progress, transform: [{ translateY }, { scale }] }]}
        >
          {actions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                action.onPress();
              }}
              style={styles.item}
            >
              <Icon name={action.icon} size={18} />
              <Text style={styles.label}>{action.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  anchor: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  menu: {
    backgroundColor: GgastosColors.bgSurfaceRaised,
    borderRadius: GgastosRadius.md,
    paddingVertical: 6,
    minWidth: MENU_MIN_WIDTH,
    transformOrigin: 'bottom',
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  label: { ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
});
