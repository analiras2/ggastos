import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';
import { Button } from '@/components/ggastos/core/button';
import { Icon } from '@/components/ggastos/core/icon';

type EmptyStateCardProps = {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyStateCard({
  icon = 'calendar-plus',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBadge}>
        <Icon name={icon} size={22} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel ? (
        <Button variant="primary" onPress={onAction} style={styles.action}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GgastosColors.bgSurface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.lg,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GgastosColors.brandPrimarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
    textAlign: 'center',
  },
  description: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkSoft,
    textAlign: 'center',
    maxWidth: 280,
  },
  action: {
    marginTop: 4,
  },
});
