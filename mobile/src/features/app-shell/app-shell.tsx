import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GgastosColors } from '@/constants/ggastos-theme';
import { BottomTabBar, BottomTabKey } from '@/components/ggastos/navigation/bottom-tab-bar';
import { DashboardScreen } from '@/features/dashboard/dashboard-screen';
import { currentMonthKey } from '@/features/dashboard/month-utils';
import { PlanningScreen } from '@/features/planning/planning-screen';
import { ReconciliationInboxScreen } from '@/features/reconciliation/reconciliation-inbox-screen';
import { useReconciliationInbox } from '@/features/reconciliation/use-reconciliation-inbox';
import { AnnualReportScreen } from '@/features/reports/annual-report-screen';
import { SettingsScreen } from '@/features/settings/settings-screen';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<BottomTabKey>('mes');
  const inboxQuery = useReconciliationInbox(currentMonthKey());
  const pendingSuggestionsCount = inboxQuery.data?.length ?? 0;

  return (
    <View style={styles.shell}>
      <View style={styles.content}>
        {activeTab === 'mes' ? <DashboardScreen /> : null}
        {activeTab === 'planejamento' ? <PlanningScreen /> : null}
        {activeTab === 'revisar' ? <ReconciliationInboxScreen /> : null}
        {activeTab === 'anual' ? <AnnualReportScreen /> : null}
        {activeTab === 'ajustes' ? <SettingsScreen /> : null}
      </View>
      <BottomTabBar active={activeTab} onChange={setActiveTab} badge={pendingSuggestionsCount} />
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
});
