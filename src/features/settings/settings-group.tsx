import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';

const ICON_BADGE_SIZE = 40;

type SettingsGroupProps = { title: string; children: ReactNode };

// A titled white card that holds a list of rows.
export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

type SettingsRowProps = {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  // Control at the end of the row, in place of the chevron.
  trailing?: ReactNode;
};

// Icon badge, texts and a chevron when it can be pressed.
export function SettingsRow({ icon, title, subtitle, onPress, trailing }: SettingsRowProps) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress} style={styles.row}>
      <View style={styles.rowMain}>
        <View style={styles.iconBadge}>
          <Icon name={icon} size={18} color={GgastosColors.brandPrimary} />
        </View>
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {trailing ?? (onPress ? <Icon name="chevron-right" size={18} color={GgastosColors.brandPrimary} /> : null)}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: { gap: GgastosSpacing.space2 },
  groupTitle: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  card: {
    borderRadius: GgastosRadius.lg,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    paddingHorizontal: GgastosSpacing.space4,
  },
  row: { paddingVertical: GgastosSpacing.space3 },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: GgastosSpacing.space3 },
  iconBadge: {
    width: ICON_BADGE_SIZE,
    height: ICON_BADGE_SIZE,
    borderRadius: ICON_BADGE_SIZE / 2,
    backgroundColor: GgastosColors.brandPrimarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  title: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
