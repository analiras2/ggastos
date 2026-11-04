import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ggastos/core/icon';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import type { BulkCategorizeResult } from '@/features/statements/bulk-categorization';
import { countLabel } from '@/features/statements/counts';

const ICON_SIZE = 18;

type BulkResultBannerProps = {
  result: BulkCategorizeResult;
  onDismiss: () => void;
};

function describeResult({ updatedCount, skippedCount, rulesUpserted }: BulkCategorizeResult): string {
  const parts = [`${countLabel(updatedCount, 'lançamento categorizado', 'lançamentos categorizados')}.`];
  if (rulesUpserted > 0) {
    parts.push(`${countLabel(rulesUpserted, 'regra salva', 'regras salvas')}.`);
  }
  if (skippedCount > 0) {
    parts.push(`${countLabel(skippedCount, 'já estava categorizado', 'já estavam categorizados')}.`);
  }
  return parts.join(' ');
}

export function BulkResultBanner({ result, onDismiss }: BulkResultBannerProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.banner}>
      <Icon name="check-circle-2" size={ICON_SIZE} color={GgastosColors.brandPrimary} />
      <Text style={styles.text}>{describeResult(result)}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar aviso" hitSlop={12} onPress={onDismiss}>
        <Icon name="x" size={ICON_SIZE} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space4,
    backgroundColor: GgastosColors.brandPrimarySoft,
  },
  text: { flex: 1, ...GgastosType.bodySm, color: GgastosColors.brandPrimaryDark },
});
