import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GgastosColors } from '@/shared/theme/ggastos-theme';
import { AddMenu } from '@/shared/ui/navigation/add-menu';
import { BottomTabBar, BottomTabKey } from '@/shared/ui/navigation/bottom-tab-bar';
import { DashboardScreen } from '@/features/dashboard';
import { currentMonthKey } from '@/shared/lib/month';
import { useReconciliationInbox } from '@/features/reconciliation';
import { AnnualReportScreen } from '@/features/reports';
import { SettingsScreen } from '@/features/settings';
import { useUncategorizedTransactions } from '@/features/statements';
import { AddMenuSheets } from '@/features/app-shell/add-menu-sheets';
import { PlanHubScreen } from '@/features/app-shell/plan-hub-screen';
import { useAddMenuViewModel } from '@/features/app-shell/use-add-menu-view-model';

const MAX_CONTENT_WIDTH = 640;

export function AppShell() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<BottomTabKey>('mes');
  const addMenu = useAddMenuViewModel();
  const inboxQuery = useReconciliationInbox(currentMonthKey());
  const uncategorizedTransactionsQuery = useUncategorizedTransactions();
  const pendingSuggestionsCount = (inboxQuery.data?.length ?? 0) + (uncategorizedTransactionsQuery.data?.length ?? 0);

  const handleChangeTab = (tab: BottomTabKey) => {
    addMenu.closeMenu();
    setActiveTab(tab);
  };

  return (
    <View style={[styles.shell, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <View style={styles.column}>
        <View style={styles.content}>
          {activeTab === 'mes' ? <DashboardScreen /> : null}
          {activeTab === 'plano' ? <PlanHubScreen pendingCount={pendingSuggestionsCount} /> : null}
          {activeTab === 'anual' ? <AnnualReportScreen /> : null}
          {activeTab === 'ajustes' ? <SettingsScreen /> : null}
        </View>
        <AddMenu visible={addMenu.isMenuOpen} actions={addMenu.actions} onClose={addMenu.closeMenu} />
        <BottomTabBar
          active={activeTab}
          onChange={handleChangeTab}
          badge={pendingSuggestionsCount}
          isAddOpen={addMenu.isMenuOpen}
          onPressAdd={addMenu.toggleMenu}
        />
      </View>
      <AddMenuSheets viewModel={addMenu} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: GgastosColors.bgBase,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
  },
  content: {
    flex: 1,
  },
});
