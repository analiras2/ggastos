import { StyleSheet, Switch, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';

const TEXT_GAP = 2;

type SwitchRowProps = {
  title: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
};

// A titled option with a short explanation and a switch on the right.
export function SwitchRow({ title, description, value, disabled = false, onChange }: SwitchRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch accessibilityLabel={title} disabled={disabled} value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space4,
    backgroundColor: GgastosColors.bgSurface,
  },
  textGroup: { flex: 1, gap: TEXT_GAP },
  title: { ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
  description: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
