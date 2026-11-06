import { CalendarClock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/shared/theme/ggastos-theme';
import { categoryIconColor } from '@/shared/theme/category-colors';
import { CategoryIcon } from '@/shared/ui/core/category-icon';

type DeltaTone = 'neutral' | 'over' | 'under';

type CategoryBudgetRowProps = {
  name: string;
  icon?: string;
  color?: string;
  // Shown only for planned categories; the calendar icon marks them as planned.
  planned?: string | null;
  delta?: string | null;
  deltaTone?: DeltaTone;
  progress?: number;
  onPress?: () => void;
};

const PLANNED_ICON_SIZE = 12;

const DELTA_COLOR: Record<DeltaTone, string> = {
  over: GgastosColors.expense,
  under: GgastosColors.income,
  neutral: GgastosColors.inkFaint,
};

export function CategoryBudgetRow({
  name,
  icon = 'circle',
  color = GgastosColors.brandPrimary,
  planned,
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
      <View style={[styles.iconBadge, { backgroundColor: color }]}>
        <CategoryIcon name={icon} size={17} color={categoryIconColor(color)} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        {planned ? (
          <View accessible accessibilityLabel={`Previsto ${planned}`} style={styles.plannedRow}>
            <CalendarClock size={PLANNED_ICON_SIZE} color={GgastosColors.inkFaint} strokeWidth={2} />
            <Text style={styles.meta}>{planned}</Text>
          </View>
        ) : null}
        {typeof progress === 'number' ? (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  backgroundColor: deltaTone === 'over' ? GgastosColors.expense : color,
                },
              ]}
            />
          </View>
        ) : null}
      </View>
      {delta ? <Text style={[styles.delta, { color: DELTA_COLOR[deltaTone] }]}>{delta}</Text> : null}
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
  plannedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
