import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

type DeltaTone = 'neutral' | 'over' | 'under';

type CategoryBudgetRowProps = {
  name: string;
  icon?: string;
  planned: string;
  actual: string;
  delta: string;
  deltaTone?: DeltaTone;
  progress?: number;
  onPress?: () => void;
};

const DELTA_COLOR: Record<DeltaTone, string> = {
  over: GgastosColors.expense,
  under: GgastosColors.income,
  neutral: GgastosColors.inkFaint,
};

export function CategoryBudgetRow({
  name,
  icon = 'circle',
  planned,
  actual,
  delta,
  deltaTone = 'neutral',
  progress,
  onPress,
}: CategoryBudgetRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={styles.row}
    >
      <View style={styles.iconBadge}>
        <Icon name={icon} size={17} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>
          Previsto {planned} · Realizado {actual}
        </Text>
        {typeof progress === 'number' ? (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  backgroundColor: deltaTone === 'over' ? GgastosColors.expense : GgastosColors.brandPrimary,
                },
              ]}
            />
          </View>
        ) : null}
      </View>
      <Text style={[styles.delta, { color: DELTA_COLOR[deltaTone] }]}>{delta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GgastosColors.brandPrimarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
    color: GgastosColors.inkStrong,
  },
  meta: {
    ...GgastosType.micro,
    color: GgastosColors.inkFaint,
  },
  progressTrack: {
    height: 4,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.lineSofter,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: {
    height: '100%',
  },
  delta: {
    ...GgastosType.bodySm,
    fontWeight: '700',
  },
});
