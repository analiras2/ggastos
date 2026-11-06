import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';

export type FabAction = { label: string; icon: string; onPress: () => void };

type AddFabProps = {
  actions: FabAction[];
};

const FAB_SIZE = 56;
const FAB_OFFSET = 20;
const MENU_GAP = 12;

// Floating "+" button that opens a small action menu above it.
export function AddFab({ actions }: AddFabProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (action: FabAction) => {
    setIsOpen(false);
    action.onPress();
  };

  return (
    <>
      {isOpen ? (
        <Pressable
          accessibilityLabel="Fechar menu"
          onPress={() => setIsOpen(false)}
          style={styles.backdrop}
        />
      ) : null}
      <View pointerEvents="box-none" style={styles.anchor}>
        {isOpen ? (
          <View style={[styles.menu, GgastosShadow.raised]}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                onPress={() => handleSelect(action)}
                style={styles.menuItem}
              >
                <Icon name={action.icon} size={18} />
                <Text style={styles.menuLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adicionar"
          onPress={() => setIsOpen((current) => !current)}
          style={[styles.fab, GgastosShadow.raised]}
        >
          <Icon name={isOpen ? 'x' : 'plus'} size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  anchor: {
    position: 'absolute',
    right: FAB_OFFSET,
    bottom: FAB_OFFSET,
    alignItems: 'flex-end',
    gap: MENU_GAP,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: GgastosColors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    backgroundColor: GgastosColors.bgSurfaceRaised,
    borderRadius: GgastosRadius.md,
    paddingVertical: 6,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuLabel: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
});
