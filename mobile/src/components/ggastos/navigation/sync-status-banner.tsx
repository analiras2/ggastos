import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

type SyncState = 'ok' | 'pending' | 'error';

type SyncStatusBannerProps = {
  state?: SyncState;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const TONES: Record<SyncState, { bg: string; fg: string; icon: string }> = {
  ok: { bg: GgastosColors.brandPrimarySofter, fg: GgastosColors.brandPrimaryDark, icon: 'check' },
  pending: { bg: GgastosColors.statusPendenteBg, fg: GgastosColors.statusPendenteFg, icon: 'clock' },
  error: { bg: GgastosColors.warningSoft, fg: GgastosColors.warning, icon: 'circle-alert' },
};

export function SyncStatusBanner({ state = 'ok', message, actionLabel, onAction }: SyncStatusBannerProps) {
  const tone = TONES[state];

  return (
    <View style={[styles.banner, { backgroundColor: tone.bg }]}>
      <Icon name={tone.icon} size={18} />
      <Text style={[styles.message, { color: tone.fg }]}>{message}</Text>
      {actionLabel ? (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <Text style={[styles.action, { color: tone.fg }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: GgastosRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  message: {
    ...GgastosType.bodySm,
    flex: 1,
  },
  action: {
    ...GgastosType.label,
    textDecorationLine: 'underline',
  },
});
