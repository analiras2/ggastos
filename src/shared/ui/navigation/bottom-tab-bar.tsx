import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import {
  FLOATING_NAV_FAB_RAISE,
  FLOATING_NAV_FAB_SIZE,
  FLOATING_NAV_HEIGHT,
  FLOATING_NAV_MARGIN,
  FLOATING_NAV_MAX_WIDTH,
} from '@/shared/ui/navigation/floating-nav-metrics';

export type BottomTabKey = 'mes' | 'plano' | 'anual' | 'ajustes';

type TabItem = { key: BottomTabKey; label: string; icon: string; edge?: 'start' | 'end' };

const TABS_BEFORE_ADD: TabItem[] = [
  { key: 'mes', label: 'Mês', icon: 'calendar', edge: 'start' },
  { key: 'plano', label: 'Plano', icon: 'list-checks' },
];
const TABS_AFTER_ADD: TabItem[] = [
  { key: 'anual', label: 'Anual', icon: 'calendar-range' },
  { key: 'ajustes', label: 'Perfil', icon: 'user', edge: 'end' },
];

// Shadow that falls only below the pill, so nothing shows above it as an outline.
const DOWNWARD_SHADOW = {
  shadowColor: '#1F1A17',
  shadowOpacity: 0.1,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
} as const;

const ADD_SLOT_WIDTH = 84;
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
      <View style={styles.nav}>
        {TABS_BEFORE_ADD.map(renderTab)}
        <View style={styles.addSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isAddOpen ? 'Fechar menu' : 'Adicionar'}
            onPress={onPressAdd}
            style={styles.fab}
          >
            <Icon name={isAddOpen ? 'x' : 'plus'} size={30} color="#FFFFFF" />
          </Pressable>
        </View>
        {TABS_AFTER_ADD.map(renderTab)}
      </View>
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
    backgroundColor: GgastosColors.bgSurfaceRaised,
    borderRadius: NAV_RADIUS,
    ...DOWNWARD_SHADOW,
  },
  tab: {
    flex: 1,
    height: FLOATING_NAV_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  activeTab: {
    backgroundColor: GgastosColors.brandPrimarySoft,
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
