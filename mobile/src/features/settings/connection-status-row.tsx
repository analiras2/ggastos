import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosType } from '@/constants/ggastos-theme';
import type { ConnectionStatusTone } from '@/features/settings/format-connection-status';

type ConnectionStatusRowProps = {
  institutionName: string;
  message: string;
  tone: ConnectionStatusTone;
  onReconnect?: () => void;
};

const toneColors: Record<ConnectionStatusTone, string> = {
  ok: GgastosColors.income,
  actionable: GgastosColors.warning,
  info: GgastosColors.inkSoft,
  pending: GgastosColors.inkSoft,
};

export function ConnectionStatusRow({
  institutionName,
  message,
  tone,
  onReconnect,
}: ConnectionStatusRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} numberOfLines={1}>
        {institutionName}
      </Text>
      <Text style={[styles.message, { color: toneColors[tone] }]}>{message}</Text>
      {tone === 'actionable' && onReconnect ? (
        <Pressable accessibilityRole="button" onPress={onReconnect} hitSlop={8}>
          <Text style={styles.reconnectAction}>Reconectar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 3,
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  title: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
    color: GgastosColors.inkStrong,
  },
  message: {
    ...GgastosType.bodySm,
  },
  reconnectAction: {
    ...GgastosType.label,
    color: GgastosColors.brandPrimaryDark,
    textDecorationLine: 'underline',
  },
});
