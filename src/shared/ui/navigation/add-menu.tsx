import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import {
  FLOATING_NAV_FAB_RAISE,
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

// Action menu opened by the raised "+" button, shown right above the floating navigation.
export function AddMenu({ visible, actions, onClose }: AddMenuProps) {
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  const bottomOffset =
    FLOATING_NAV_HEIGHT + FLOATING_NAV_MARGIN + insets.bottom + FLOATING_NAV_FAB_RAISE + FLOATING_NAV_MENU_GAP;

  return (
    <>
      <Pressable accessibilityLabel="Fechar menu" onPress={onClose} style={styles.backdrop} />
      <View pointerEvents="box-none" style={[styles.anchor, { bottom: bottomOffset }]}>
        <View style={[styles.menu, GgastosShadow.raised]}>
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
        </View>
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
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  label: { ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
});
