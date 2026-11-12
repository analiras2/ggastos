import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosType } from '@/shared/theme/ggastos-theme';
import { GlassSurface } from '@/shared/ui/core/glass-surface';
import { Icon } from '@/shared/ui/core/icon';
import { AddFabIcon } from '@/shared/ui/navigation/add-fab-icon';
import {
  FLOATING_NAV_FAB_RAISE,
  FLOATING_NAV_FAB_SIZE,
  FLOATING_NAV_HEIGHT,
  FLOATING_NAV_MARGIN,
  FLOATING_NAV_MAX_WIDTH,
} from '@/shared/ui/navigation/floating-nav-metrics';

export type BottomTabKey = 'mes' | 'plano' | 'estatisticas' | 'ajustes';

type TabItem = { key: BottomTabKey; label: string; icon: string; edge?: 'start' | 'end' };

const TABS_BEFORE_ADD: TabItem[] = [
  { key: 'mes', label: 'Mês', icon: 'calendar', edge: 'start' },
  { key: 'plano', label: 'Plano', icon: 'list-checks' },
];
const TABS_AFTER_ADD: TabItem[] = [
  { key: 'estatisticas', label: 'Estatísticas', icon: 'chart-pie' },
  { key: 'ajustes', label: 'Perfil', icon: 'user', edge: 'end' },
];

const ADD_SLOT_WIDTH = 84;
const ACTIVE_TAB_TINT = 'rgba(31, 107, 87, 0.14)';
const NAV_RADIUS = FLOATING_NAV_HEIGHT / 2;

type BottomTabBarProps = {
  active: BottomTabKey;
  onChange: (key: BottomTabKey) => void;
  badge?: number;
  isAddOpen: boolean;
  onPressAdd: () => void;
};

// Floating, centered, rounded navigation with the "add" button raised in the middle.
export function BottomTabBar({ active, onChange, badge, isAddOpen, onPressAdd }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (tab: TabItem) => {
    const isActive = tab.key === active;
    return (
      <Pressable
        key={tab.key}
        accessibilityRole="button"
        accessibilityLabel={tab.label}
        onPress={() => onChange(tab.key)}
        style={[
          styles.tab,
          isActive && styles.activeTab,
          isActive && tab.edge === 'start' && styles.startEdgeTab,
          isActive && tab.edge === 'end' && styles.endEdgeTab,
        ]}
      >
        <Icon name={tab.icon} size={22} color={isActive ? GgastosColors.brandPrimary : GgastosColors.inkFaint} />
        {tab.key === 'plano' && !!badge && badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{badge}</Text>
          </View>
        ) : null}
        {isActive ? <Text style={styles.label}>{tab.label}</Text> : null}
      </Pressable>
    );
  };

  return (
    <View pointerEvents="box-none" style={[styles.anchor, { paddingBottom: FLOATING_NAV_MARGIN + insets.bottom }]}>
      <GlassSurface style={styles.nav}>
        {TABS_BEFORE_ADD.map(renderTab)}
        <View style={styles.addSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isAddOpen ? 'Fechar menu' : 'Adicionar'}
            onPress={onPressAdd}
            style={styles.fab}
          >
            <AddFabIcon isOpen={isAddOpen} />
          </Pressable>
        </View>
        {TABS_AFTER_ADD.map(renderTab)}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: FLOATING_NAV_MARGIN,
  },
  nav: {
    width: '100%',
    maxWidth: FLOATING_NAV_MAX_WIDTH,
    height: FLOATING_NAV_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: NAV_RADIUS,
  },
  tab: {
    flex: 1,
    height: FLOATING_NAV_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  // A tint instead of a solid color, so the glass shows through the selected tab.
  activeTab: {
    backgroundColor: ACTIVE_TAB_TINT,
  },
  // Middle tabs are square; edge tabs only round the outer side, following the pill.
  startEdgeTab: { borderTopLeftRadius: NAV_RADIUS, borderBottomLeftRadius: NAV_RADIUS },
  endEdgeTab: { borderTopRightRadius: NAV_RADIUS, borderBottomRightRadius: NAV_RADIUS },
  addSlot: {
    width: ADD_SLOT_WIDTH,
    height: FLOATING_NAV_HEIGHT,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    top: -FLOATING_NAV_FAB_RAISE,
    width: FLOATING_NAV_FAB_SIZE,
    height: FLOATING_NAV_FAB_SIZE,
    borderRadius: FLOATING_NAV_FAB_SIZE / 2,
    backgroundColor: GgastosColors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 18,
    minWidth: 16,
    height: 16,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeLabel: {
    ...GgastosType.micro,
    color: '#FFFFFF',
  },
  label: {
    ...GgastosType.label,
    color: GgastosColors.brandPrimary,
  },
});
