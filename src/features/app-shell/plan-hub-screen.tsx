import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PendingScreen } from '@/features/reconciliation';
import { PlanningScreen } from '@/features/planning';
import { GgastosColors, GgastosSpacing } from '@/shared/theme/ggastos-theme';
import { SegmentedControl, type SegmentOption } from '@/shared/ui/navigation/segmented-control';

type PlanSection = 'planejamento' | 'pendencias';

type PlanHubScreenProps = { pendingCount: number };

// One tab that holds both the plan and the pending items, switched at the top.
export function PlanHubScreen({ pendingCount }: PlanHubScreenProps) {
  const [section, setSection] = useState<PlanSection>('planejamento');

  const options: SegmentOption<PlanSection>[] = [
    { key: 'planejamento', label: 'Planejamento' },
    { key: 'pendencias', label: 'Pendências', badge: pendingCount },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.switcher}>
        <SegmentedControl options={options} value={section} onChange={setSection} />
      </View>
      <View style={styles.body}>
        {section === 'planejamento' ? <PlanningScreen /> : <PendingScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  switcher: { paddingHorizontal: GgastosSpacing.space5, paddingTop: GgastosSpacing.space3 },
  body: { flex: 1 },
});
