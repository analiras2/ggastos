import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

export type BottomTabKey = 'mes' | 'planejamento' | 'revisar' | 'anual' | 'ajustes';

const TABS: { key: BottomTabKey; label: string; icon: string }[] = [
  { key: 'mes', label: 'Mês', icon: 'calendar' },
  { key: 'planejamento', label: 'Planejamento', icon: 'list-checks' },
  { key: 'revisar', label: 'Pendências', icon: 'list-todo' },
  { key: 'anual', label: 'Anual', icon: 'calendar-range' },
  { key: 'ajustes', label: 'Ajustes', icon: 'settings' },
];

type BottomTabBarProps = {
  active?: BottomTabKey;
  onChange?: (key: BottomTabKey) => void;
  badge?: number;
};

export function BottomTabBar({ active = 'mes', onChange, badge }: BottomTabBarProps) {
  return (
    <View style={styles.nav}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            onPress={() => onChange?.(tab.key)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <View style={styles.iconWrap}>
              <Icon name={tab.icon} size={22} color={isActive ? GgastosColors.brandPrimary : GgastosColors.inkFaint} />
            </View>
            {tab.key === 'revisar' && !!badge && badge > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>{badge}</Text>
              </View>
            ) : null}
            {isActive ? <Text style={styles.label}>{tab.label}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: GgastosColors.bgSurfaceRaised,
    borderTopWidth: 1,
    borderTopColor: GgastosColors.lineSofter,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 76,
  },
  tab: {
    minWidth: 48,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 8,
    borderRadius: GgastosRadius.pill,
  },
  activeTab: {
    minWidth: 84,
    paddingHorizontal: 16,
    backgroundColor: GgastosColors.brandPrimarySoft,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 4,
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
