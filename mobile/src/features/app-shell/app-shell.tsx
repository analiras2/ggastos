import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosType } from '@/constants/ggastos-theme';
import { BottomTabBar, BottomTabKey } from '@/components/ggastos/navigation/bottom-tab-bar';
import { DashboardScreen } from '@/features/dashboard/dashboard-screen';
import { ReconciliationInboxScreen } from '@/features/reconciliation/reconciliation-inbox-screen';
import { SettingsScreen } from '@/features/settings/settings-screen';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<BottomTabKey>('mes');

  return (
    <View style={styles.shell}>
      <View style={styles.content}>
        {activeTab === 'mes' ? <DashboardScreen /> : null}
        {activeTab === 'revisar' ? <ReconciliationInboxScreen /> : null}
        {activeTab === 'ajustes' ? <SettingsScreen /> : null}
        {activeTab === 'planejamento' ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Planejamento em construção.</Text>
          </View>
        ) : null}
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
