import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/shared/theme/ggastos-theme';
import { categoryIconColor } from '@/shared/theme/category-colors';
import { CategoryIcon } from '@/shared/ui/core/category-icon';

type DeltaTone = 'neutral' | 'over' | 'under';

type RowStatus = { label: string; value: string | null; tone: DeltaTone };

type CategoryBudgetRowProps = {
  name: string;
  icon?: string;
  color?: string;
  // Planned amount; null when nothing was planned for the category.
  planned?: string | null;
  // Amount already paid or received.
  actual?: string;
  // What is left to do (or how far it went past the plan), shown on the right.
  status?: RowStatus | null;
  progress?: number;
  onPress?: () => void;
};

const STATUS_COLOR: Record<DeltaTone, string> = {
  over: GgastosColors.expense,
  under: GgastosColors.income,
  neutral: GgastosColors.inkStrong,
};

export function CategoryBudgetRow({
  name,
  icon = 'circle',
  color = GgastosColors.brandPrimary,
  planned,
  actual,
  status,
  progress,
  onPress,
}: CategoryBudgetRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={styles.row}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBadge, { backgroundColor: color }]}>
          <CategoryIcon name={icon} size={17} color={categoryIconColor(color)} />
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          {actual ? (
            <Text accessibilityLabel={planned ? `Realizado ${actual} de ${planned}` : `Realizado ${actual}`} style={styles.meta}>
              {planned ? `${actual} de ${planned}` : actual}
            </Text>
          ) : null}
        </View>
        {status ? (
          <View style={styles.status}>
            <Text style={styles.statusLabel}>{status.label}</Text>
            {status.value ? <Text style={[styles.statusValue, { color: STATUS_COLOR[status.tone] }]}>{status.value}</Text> : null}
          </View>
        ) : null}
      </View>
      {typeof progress === 'number' ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: status?.tone === 'over' ? GgastosColors.expense : color,
              },
            ]}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  meta: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkFaint,
  },
  progressTrack: {
    height: 6,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.lineSofter,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  status: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    ...GgastosType.micro,
    color: GgastosColors.inkFaint,
  },
  statusValue: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
  },
});
