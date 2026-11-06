import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosType } from '@/constants/ggastos-theme';

export type SegmentedOption = {
  label: string;
  value: string;
};

type SegmentedControlProps = {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && styles.segmentActive, active && GgastosShadow.card]}
          >
            <Text style={[styles.label, { color: active ? GgastosColors.brandPrimary : GgastosColors.inkSoft, fontWeight: active ? '700' : '500' }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: GgastosColors.brandPrimarySofter,
    borderRadius: GgastosRadius.pill,
    padding: 4,
    gap: 2,
  },
  segment: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: GgastosRadius.pill,
  },
  segmentActive: {
    backgroundColor: GgastosColors.bgSurface,
  },
  label: {
    ...GgastosType.bodySm,
  },
});
