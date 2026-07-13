import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosType } from '@/constants/ggastos-theme';
import { BottomTabBar, BottomTabKey } from '@/components/ggastos/navigation/bottom-tab-bar';
import { DashboardScreen } from '@/features/dashboard/dashboard-screen';

const COMING_SOON_LABEL: Record<Exclude<BottomTabKey, 'mes'>, string> = {
  planejamento: 'Planejamento',
  revisar: 'Revisar',
  ajustes: 'Ajustes',
};

export function AppShell() {
  const [activeTab, setActiveTab] = useState<BottomTabKey>('mes');

  return (
    <View style={styles.shell}>
      <View style={styles.content}>
        {activeTab === 'mes' ? (
          <DashboardScreen />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{COMING_SOON_LABEL[activeTab]} em construção.</Text>
          </View>
        )}
      </View>
      <BottomTabBar active={activeTab} onChange={setActiveTab} badge={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkSoft,
  },
});
