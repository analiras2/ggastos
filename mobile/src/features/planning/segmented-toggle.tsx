import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';

type SegmentedToggleOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type SegmentedToggleProps<TValue extends string> = {
  options: SegmentedToggleOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
};

export function SegmentedToggle<TValue extends string>({
  options,
  value,
  onChange,
}: SegmentedToggleProps<TValue>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.value)}
            style={[styles.option, isSelected && styles.optionSelected]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    flex: 1,
    minWidth: '46%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: GgastosRadius.md,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    backgroundColor: GgastosColors.bgSurface,
  },
  optionSelected: {
    borderColor: GgastosColors.brandPrimary,
    backgroundColor: GgastosColors.brandPrimarySofter,
  },
  label: {
    ...GgastosType.bodySm,
    fontWeight: '600',
    color: GgastosColors.inkStrong,
  },
  labelSelected: {
    color: GgastosColors.brandPrimary,
  },
});
