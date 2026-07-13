import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

export type BottomTabKey = 'mes' | 'planejamento' | 'revisar' | 'ajustes';

const TABS: { key: BottomTabKey; label: string; icon: string }[] = [
  { key: 'mes', label: 'Mês', icon: 'calendar' },
  { key: 'planejamento', label: 'Planejamento', icon: 'list-checks' },
  { key: 'revisar', label: 'Revisar', icon: 'shield-check' },
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
            style={styles.tab}
          >
            <View style={{ opacity: isActive ? 1 : 0.55 }}>
              <Icon name={tab.icon} size={22} />
            </View>
            {tab.key === 'revisar' && !!badge && badge > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>{badge}</Text>
              </View>
            ) : null}
            <Text style={[styles.label, { color: isActive ? GgastosColors.brandPrimary : GgastosColors.inkFaint }]}>
              {tab.label}
            </Text>
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
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
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
    ...GgastosType.micro,
    fontWeight: '600',
  },
});
