import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosType } from '@/shared/theme/ggastos-theme';

export type SegmentedOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};

type SegmentedControlProps<TValue extends string> = {
  options: SegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
};

// Pill-shaped switch for short forms; the chosen option sits on a raised surface.
export function SegmentedControl<TValue extends string>({ options, value, onChange }: SegmentedControlProps<TValue>) {
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
            <Text numberOfLines={1} style={[styles.label, { color: active ? GgastosColors.brandPrimary : GgastosColors.inkSoft, fontWeight: active ? '700' : '500' }]}>
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
    alignSelf: 'stretch',
    backgroundColor: GgastosColors.brandPrimarySofter,
    borderRadius: GgastosRadius.pill,
    padding: 4,
    gap: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: GgastosRadius.pill,
  },
  segmentActive: {
    backgroundColor: GgastosColors.bgSurface,
  },
  label: {
    ...GgastosType.bodySm,
    textAlign: 'center',
  },
});
